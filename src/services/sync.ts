import { Q } from '@nozbe/watermelondb';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDocs,
	getFirestore,
	query,
	where,
	writeBatch,
} from '@react-native-firebase/firestore';

import { database } from '../db/watermelon';
import Sharing from '../db/watermelon/sharing/model';
import WorkTrack from '../db/watermelon/worktrack/model';

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
	permission: 'read' | 'write';
}

export default class SyncService {
	private static instance: SyncService;
	private isSyncing: boolean = false;
	private syncInterval: NodeJS.Timeout | null = null;
	private readonly COLLECTION_NAME = 'work_tracks';
	private readonly SHARING_COLLECTION = 'sharing';
	private networkUnsubscribe: (() => void) | null = null;
	private isOnline: boolean = true;
	private lastSyncTime?: number;
	private readonly MAX_RETRIES = 3;
	private retryCount: number = 0;
	private readonly BATCH_SIZE = 50;
	private readonly syncBatches: SyncBatch[] = [];
	private defaultViewUserId: string | null = null;

	private constructor() {
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

	private async processBatch(
		batch: WorkTrack[],
		userId: string
	): Promise<void> {
		const db = getFirestore();
		const batchRef = writeBatch(db);
		const batchTimestamp = Date.now();

		try {
			for (const record of batch) {
				const docId = `${record.date}_${userId}`;
				const docRef = doc(db, this.COLLECTION_NAME, docId);

				batchRef.set(
					docRef,
					{
						date: record.date,
						status: record.status,
						userId,
						lastModified: record.lastModified,
						createdAt: record.createdAt,
					},
					{ merge: true }
				);
			}

			await batchRef.commit();

			// Update local records after successful batch commit
			for (const record of batch) {
				await database.write(async () => {
					await record.update((r) => {
						r.synced = true;
						r.syncError = undefined;
					});
				});
			}

			this.syncBatches.push({
				records: batch,
				timestamp: batchTimestamp,
				status: 'completed',
			});
		} catch (error) {
			this.syncBatches.push({
				records: batch,
				timestamp: batchTimestamp,
				status: 'failed',
				error:
					error instanceof Error
						? error.message
						: 'Batch sync failed',
			});
			throw error;
		}
	}

	async shareWorkTrack(
		sharedWithId: string,
		permission: 'read' | 'write'
	): Promise<void> {
		const userId = getAuth(getApp()).currentUser?.uid;
		if (!userId) {
			throw new SyncError('User not authenticated', 'AUTH_ERROR');
		}

		const db = getFirestore(getApp());
		let sharedWithUserId = sharedWithId; // Default to using email as ID

		// Try to find user by email
		try {
			const userQuery = query(
				collection(db, 'users'),
				where('email', '==', sharedWithId.toLowerCase())
			);
			const userSnapshot = await getDocs(userQuery);

			if (!userSnapshot.empty) {
				sharedWithUserId = userSnapshot.docs[0].id;
			}
		} catch (error: any) {
			// Only ignore if collection doesn't exist
			if (error.code !== 'not-found') {
				throw error;
			}
		}

		// Create share with explicit ownerId
		const shareData = {
			ownerId: userId,
			sharedWithId: sharedWithUserId,
			permission,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		// Create share in Firestore
		await addDoc(collection(db, this.SHARING_COLLECTION), shareData);

		// Also sync to local database
		await database.write(async () => {
			await database.collections.get<Sharing>('sharing').create((s) => {
				s.ownerId = userId;
				s.sharedWithId = sharedWithUserId;
				s.permission = permission;
				s.createdAt = new Date();
				s.updatedAt = new Date();
			});
		});
	}

	async removeShare(sharedWithId: string): Promise<void> {
		const userId = getAuth().currentUser?.uid;
		if (!userId) {
			throw new SyncError('User not authenticated', 'AUTH_ERROR');
		}

		const db = getFirestore();
		const q = query(
			collection(db, this.SHARING_COLLECTION),
			where('ownerId', '==', userId),
			where('sharedWithId', '==', sharedWithId)
		);
		const snapshot = await getDocs(q);

		for (const doc of snapshot.docs) {
			await deleteDoc(doc.ref);
		}

		// Also remove from local database
		const localShares = await database.collections
			.get<Sharing>('sharing')
			.query(
				Q.where('ownerId', userId),
				Q.where('sharedWithId', sharedWithId)
			)
			.fetch();

		await database.write(async () => {
			for (const share of localShares) {
				await share.destroyPermanently();
			}
		});
	}

	async getSharedWithMe(): Promise<SharePermission[]> {
		const userId = getAuth().currentUser?.uid;
		if (!userId) {
			throw new SyncError('User not authenticated', 'AUTH_ERROR');
		}

		const db = getFirestore();
		const q = query(
			collection(db, this.SHARING_COLLECTION),
			where('sharedWithId', '==', userId)
		);
		const snapshot = await getDocs(q);

		return snapshot.docs.map((doc) => doc.data() as SharePermission);
	}

	async getMyShares(): Promise<SharePermission[]> {
		const userId = getAuth().currentUser?.uid;
		if (!userId) {
			throw new SyncError('User not authenticated', 'AUTH_ERROR');
		}

		const db = getFirestore();
		const q = query(
			collection(db, this.SHARING_COLLECTION),
			where('ownerId', '==', userId)
		);
		const snapshot = await getDocs(q);

		return snapshot.docs.map((doc) => doc.data() as SharePermission);
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

		// Get shared tracks
		const sharedWithMe = await this.getSharedWithMe();
		const viewUserId = this.defaultViewUserId || userId;

		const db = getFirestore();
		// Query work tracks where userId matches
		const q = query(
			collection(db, this.COLLECTION_NAME),
			where('userId', '==', viewUserId)
		);

		try {
			const snapshot = await getDocs(q);
			console.log('Fetched work tracks:', snapshot.size); // Debug log

			for (const doc of snapshot.docs) {
				const data = doc.data();
				console.log('Processing work track:', data); // Debug log

				const existingRecord = await database.collections
					.get<WorkTrack>('work_tracks')
					.query(Q.where('date', data.date))
					.fetch();

				if (existingRecord.length > 0) {
					// Update existing record if remote is newer
					const localRecord = existingRecord[0];
					if (data.lastModified > localRecord.lastModified) {
						await database.write(async () => {
							await localRecord.update((r) => {
								r.status = data.status;
								r.lastModified = data.lastModified;
								r.synced = true;
								r.syncError = undefined;
							});
						});
					}
				} else {
					// Create new record
					await database.write(async () => {
						await database.collections
							.get<WorkTrack>('work_tracks')
							.create((r) => {
								r.date = data.date;
								r.status = data.status;
								r.lastModified = data.lastModified;
								r.synced = true;
							});
					});
				}
			}
		} catch (error) {
			console.error('Error syncing from Firebase:', error);
			throw error;
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

			// Check if user has write permission for the current view
			const viewUserId = this.defaultViewUserId || userId;
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

			const unsynced = await database.collections
				.get<WorkTrack>('work_tracks')
				.query(Q.where('synced', false))
				.fetch();

			// Process records in batches
			for (let i = 0; i < unsynced.length; i += this.BATCH_SIZE) {
				const batch = unsynced.slice(i, i + this.BATCH_SIZE);
				try {
					await this.processBatch(batch, viewUserId);
					this.retryCount = 0;
				} catch (error) {
					if (this.retryCount < this.MAX_RETRIES) {
						this.retryCount++;
						await new Promise((resolve) =>
							setTimeout(resolve, 1000 * this.retryCount)
						);
						await this.processBatch(batch, viewUserId);
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

	async resolveConflicts(
		localRecord: WorkTrack,
		remoteData: any
	): Promise<void> {
		// If remote data is newer, update local
		if (remoteData.lastModified > localRecord.lastModified) {
			await database.write(async () => {
				await localRecord.update((r) => {
					r.status = remoteData.status;
					r.lastModified = remoteData.lastModified;
					r.synced = true;
					r.syncError = undefined;
				});
			});
		} else if (remoteData.lastModified < localRecord.lastModified) {
			// If local is newer, update remote
			const db = getFirestore();
			const docRef = doc(db, this.COLLECTION_NAME, localRecord.id);
			const batch = writeBatch(db);
			batch.set(
				docRef,
				{
					date: localRecord.date,
					status: localRecord.status,
					lastModified: localRecord.lastModified,
				},
				{ merge: true }
			);
			await batch.commit();
		}
	}

	async getSyncStatus(): Promise<SyncStatus> {
		const unsynced = await database.collections
			.get<WorkTrack>('work_tracks')
			.query(Q.where('synced', false))
			.fetch();

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
				await database.write(async () => {
					await record[0].update((r) => {
						r.synced = false;
						r.lastModified = Date.now();
					});
				});

				// If online, trigger immediate sync
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
				await database.write(async () => {
					await record[0].update((r) => {
						r.syncError =
							error instanceof Error
								? error.message
								: 'Queue sync error';
					});
				});
			}
		}
	}

	isNetworkAvailable(): boolean {
		return this.isOnline;
	}
}
