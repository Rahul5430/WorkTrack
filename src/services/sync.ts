import { Q } from '@nozbe/watermelondb';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { getAuth } from '@react-native-firebase/auth';

import { database } from '../db/watermelon';
import WorkTrack from '../db/watermelon/worktrack/model';
import FirebaseService from './firebase';
import WatermelonService from './watermelon';

export class SyncError extends Error {
	constructor(
		message: string,
		public readonly code: string
	) {
		super(message);
		this.name = 'SyncError';
	}
}

export interface SyncStatus {
	isSyncing: boolean;
	isOnline: boolean;
	lastSyncTime?: number;
	error?: string;
	pendingSyncs: number;
	lastBatchSize?: number;
}

export interface SyncBatch {
	records: WorkTrack[];
	timestamp: number;
	status: 'pending' | 'completed' | 'failed';
	error?: string;
}

export interface SharePermission {
	ownerId: string;
	sharedWithId: string;
	sharedWithEmail: string;
	permission: 'read' | 'write';
}

export default class SyncService {
	private static instance: SyncService;
	private isSyncing: boolean = false;
	private syncInterval: NodeJS.Timeout | null = null;
	private networkUnsubscribe: (() => void) | null = null;
	private isOnline: boolean = true;
	private lastSyncTime?: number;
	private readonly MAX_RETRIES = 3;
	private retryCount: number = 0;
	private readonly BATCH_SIZE = 50;
	private readonly syncBatches: SyncBatch[] = [];
	private defaultViewUserId: string | null = null;
	private readonly firebaseService: FirebaseService;
	private readonly watermelonService: WatermelonService;

	private constructor() {
		this.firebaseService = FirebaseService.getInstance();
		this.watermelonService = WatermelonService.getInstance();
		this.setupNetworkMonitoring();
	}

	private setupNetworkMonitoring() {
		this.networkUnsubscribe = NetInfo.addEventListener(
			(state: NetInfoState) => {
				this.isOnline = state.isConnected ?? false;
				if (this.isOnline) {
					this.syncToFirebase();
					this.syncFromFirebase();
				}
			}
		);
	}

	static getInstance(): SyncService {
		if (!SyncService.instance) {
			SyncService.instance = new SyncService();
		}
		return SyncService.instance;
	}

	async startPeriodicSync(intervalMs: number = 5 * 60 * 1000) {
		if (this.syncInterval) {
			clearInterval(this.syncInterval);
		}
		this.syncInterval = setInterval(() => {
			if (this.isOnline) {
				this.syncToFirebase();
			}
		}, intervalMs);
	}

	stopPeriodicSync() {
		if (this.syncInterval) {
			clearInterval(this.syncInterval);
			this.syncInterval = null;
		}
		if (this.networkUnsubscribe) {
			this.networkUnsubscribe();
			this.networkUnsubscribe = null;
		}
	}

	async shareWorkTrack(
		sharedWithId: string,
		permission: 'read' | 'write'
	): Promise<void> {
		const userId = getAuth().currentUser?.uid;
		if (!userId) {
			throw new SyncError('User not authenticated', 'AUTH_ERROR');
		}

		await this.firebaseService.shareWorkTrack(sharedWithId, permission);
	}

	async removeShare(sharedWithId: string): Promise<void> {
		const userId = getAuth().currentUser?.uid;
		if (!userId) {
			throw new SyncError('User not authenticated', 'AUTH_ERROR');
		}

		await this.firebaseService.removeShare(sharedWithId);
		await this.watermelonService.removeShare(userId, sharedWithId);
	}

	async getSharedWithMe(): Promise<SharePermission[]> {
		return this.firebaseService.getSharedWithMe();
	}

	async getMyShares(): Promise<SharePermission[]> {
		return this.firebaseService.getMyShares();
	}

	setDefaultViewUserId(userId: string | null) {
		this.defaultViewUserId = userId;
	}

	getDefaultViewUserId(): string | null {
		return this.defaultViewUserId;
	}

	async syncFromFirebase() {
		if (!this.isOnline) return;

		const userId = getAuth().currentUser?.uid;
		if (!userId) {
			throw new Error('User not authenticated');
		}

		const viewUserId = this.defaultViewUserId ?? userId;
		const records = await this.firebaseService.syncFromFirebase(viewUserId);

		for (const data of records) {
			await this.watermelonService.createOrUpdateRecord({
				date: data.date,
				status: data.status,
				lastModified: data.lastModified,
			});
		}
	}

	async syncToFirebase() {
		if (this.isSyncing || !this.isOnline) return;

		try {
			this.isSyncing = true;
			const userId = getAuth().currentUser?.uid;
			if (!userId) {
				throw new SyncError('User not authenticated', 'AUTH_ERROR');
			}

			const viewUserId = this.defaultViewUserId ?? userId;
			if (viewUserId !== userId) {
				const sharedWithMe = await this.getSharedWithMe();
				const share = sharedWithMe.find(
					(s) => s.ownerId === viewUserId
				);
				if (!share || share.permission !== 'write') {
					throw new SyncError(
						'No write permission',
						'PERMISSION_DENIED'
					);
				}
			}

			const unsynced = await this.watermelonService.getUnsyncedRecords();

			for (let i = 0; i < unsynced.length; i += this.BATCH_SIZE) {
				const batch = unsynced.slice(i, i + this.BATCH_SIZE);
				try {
					await this.firebaseService.syncToFirebase(
						batch,
						viewUserId
					);
					for (const record of batch) {
						await this.watermelonService.updateRecordSyncStatus(
							record,
							true
						);
					}
					this.retryCount = 0;
				} catch (error) {
					if (this.retryCount < this.MAX_RETRIES) {
						this.retryCount++;
						await new Promise((resolve) =>
							setTimeout(resolve, 1000 * this.retryCount)
						);
						await this.firebaseService.syncToFirebase(
							batch,
							viewUserId
						);
					} else {
						throw error;
					}
				}
			}

			this.lastSyncTime = Date.now();
		} finally {
			this.isSyncing = false;
		}
	}

	async getSyncStatus(): Promise<SyncStatus> {
		const unsynced = await this.watermelonService.getUnsyncedRecords();
		const lastBatch = this.syncBatches[this.syncBatches.length - 1];

		return {
			isSyncing: this.isSyncing,
			isOnline: this.isOnline,
			lastSyncTime: this.lastSyncTime,
			pendingSyncs: unsynced.length,
			lastBatchSize: lastBatch?.records.length,
			error: lastBatch?.error,
		};
	}

	async queueSync(date: string) {
		try {
			const record = await database.collections
				.get<WorkTrack>('work_tracks')
				.query(Q.where('date', date))
				.fetch();

			if (record.length > 0) {
				await this.watermelonService.updateRecordSyncStatus(
					record[0],
					false
				);

				if (this.isOnline) {
					this.syncToFirebase();
				}
			}
		} catch (error) {
			const record = await database.collections
				.get<WorkTrack>('work_tracks')
				.query(Q.where('date', date))
				.fetch();

			if (record.length > 0) {
				await this.watermelonService.updateRecordSyncStatus(
					record[0],
					false,
					error instanceof Error ? error.message : 'Queue sync error'
				);
			}
		}
	}

	isNetworkAvailable(): boolean {
		return this.isOnline;
	}

	async updateSharePermission(
		sharedWithId: string,
		newPermission: 'read' | 'write'
	): Promise<void> {
		const userId = getAuth().currentUser?.uid;
		if (!userId) {
			throw new SyncError('User not authenticated', 'AUTH_ERROR');
		}

		await this.firebaseService.updateSharePermission(
			sharedWithId,
			newPermission
		);
		await this.watermelonService.updateSharePermission(
			userId,
			sharedWithId,
			newPermission
		);
	}
}
