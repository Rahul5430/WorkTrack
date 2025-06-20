import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { getAuth } from '@react-native-firebase/auth';

import FirebaseService from './firebase';
import WatermelonService from './watermelon';

export class SyncError extends Error {
	constructor(
		message: string,
		public readonly code: string,
		public readonly isRetryable: boolean = true
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
	errorType?: 'network' | 'auth' | 'server' | 'unknown';
}

export default class SyncService {
	private static instance: SyncService;
	private isSyncing: boolean = false;
	private syncInterval: NodeJS.Timeout | null = null;
	private networkUnsubscribe: (() => void) | null = null;
	private isOnline: boolean = true;
	private lastSyncTime: number | null = null;
	private readonly LAST_SYNC_KEY = '@last_sync_time';
	private readonly firebaseService: FirebaseService;
	private readonly watermelonService: WatermelonService;

	private constructor() {
		this.firebaseService = FirebaseService.getInstance();
		this.watermelonService = WatermelonService.getInstance();
		this.setupNetworkMonitoring();
	}

	private async loadLastSyncTime() {
		const time = await AsyncStorage.getItem(this.LAST_SYNC_KEY);
		this.lastSyncTime = time ? parseInt(time, 10) : null;
	}

	private async setLastSyncTime(time: number) {
		this.lastSyncTime = time;
		await AsyncStorage.setItem(this.LAST_SYNC_KEY, time.toString());
	}

	private setupNetworkMonitoring() {
		this.networkUnsubscribe = NetInfo.addEventListener(
			(state: NetInfoState) => {
				const isOnline = state.isConnected ?? false;
				if (this.isOnline !== isOnline) {
					this.isOnline = isOnline;
					if (isOnline) {
						this.triggerSync();
					}
				}
			}
		);
	}

	static getInstance(): SyncService {
		if (!SyncService.instance) {
			SyncService.instance = new SyncService();
			SyncService.instance
				.loadLastSyncTime()
				.catch((err) =>
					console.error('Failed to load last sync time on init', err)
				);
		}
		return SyncService.instance;
	}

	async triggerSync() {
		if (this.isSyncing || !this.isOnline) return;

		console.log('Sync triggered...');
		this.isSyncing = true;
		try {
			await this.syncToFirebase();
			await this.syncFromFirebase();
			await this.setLastSyncTime(Date.now());
			console.log('Sync completed successfully.');
		} catch (error) {
			console.error('Sync failed:', error);
			// Categorize the error for better user feedback
			const errorType = this.categorizeError(error);
			console.error(`Sync error type: ${errorType}`);
		} finally {
			this.isSyncing = false;
		}
	}

	// Manual sync trigger for user interaction
	async manualSync(): Promise<boolean> {
		if (this.isSyncing) {
			console.log('Sync already in progress...');
			return false;
		}

		if (!this.isOnline) {
			console.log('No network connection available');
			return false;
		}

		try {
			await this.triggerSync();
			return true;
		} catch (error) {
			console.error('Manual sync failed:', error);
			return false;
		}
	}

	private categorizeError(
		error: any
	): 'network' | 'auth' | 'server' | 'unknown' {
		if (!error) return 'unknown';

		const errorMessage = error.message?.toLowerCase() ?? '';
		const errorCode = error.code?.toLowerCase() ?? '';

		// Network errors
		if (
			errorMessage.includes('network') ||
			errorMessage.includes('connection') ||
			errorMessage.includes('timeout') ||
			errorCode.includes('network') ||
			errorCode.includes('unavailable')
		) {
			return 'network';
		}

		// Authentication errors
		if (
			errorMessage.includes('auth') ||
			errorMessage.includes('unauthorized') ||
			errorMessage.includes('permission') ||
			errorCode.includes('permission') ||
			errorCode.includes('unauthenticated')
		) {
			return 'auth';
		}

		// Server errors
		if (
			errorMessage.includes('server') ||
			errorMessage.includes('internal') ||
			errorCode.includes('internal') ||
			errorCode.includes('unavailable')
		) {
			return 'server';
		}

		return 'unknown';
	}

	async syncToFirebase() {
		const recordsToSync = await this.watermelonService.getUnsyncedRecords();
		if (recordsToSync.length > 0) {
			console.log(
				`Syncing ${recordsToSync.length} records to Firebase...`
			);
			try {
				await this.firebaseService.syncToFirebase(recordsToSync);
				// After successful sync, mark records as synced
				await this.watermelonService.markRecordsAsSynced(recordsToSync);
			} catch (error) {
				console.error('Sync to Firebase failed:', error);
				// Mark records with sync error for retry
				await this.watermelonService.markRecordsWithSyncError(
					recordsToSync,
					error instanceof Error ? error.message : 'Sync failed'
				);
				throw error;
			}
		} else {
			console.log('No records to sync to Firebase.');
		}
	}

	async syncFromFirebase() {
		const userId = getAuth().currentUser?.uid;
		if (!userId) {
			throw new Error('User not authenticated');
		}

		console.log('Syncing from Firebase...');
		const { trackers, entries } =
			await this.firebaseService.syncFromFirebase(
				userId,
				this.lastSyncTime
			);

		// Sync trackers
		if (trackers.length > 0) {
			console.log(`Received ${trackers.length} trackers from Firebase.`);
			await this.watermelonService.createOrUpdateTrackers(trackers);
		}

		// Sync entries
		for (const entryGroup of entries) {
			if (entryGroup.data.length > 0) {
				console.log(
					`Received ${entryGroup.data.length} entries for tracker ${entryGroup.trackerId}.`
				);
				await this.watermelonService.createOrUpdateEntries(
					entryGroup.trackerId,
					entryGroup.data
				);
			}
		}
	}

	startPeriodicSync(intervalMs: number = 5 * 60 * 1000) {
		if (this.syncInterval) clearInterval(this.syncInterval);
		this.syncInterval = setInterval(() => this.triggerSync(), intervalMs);
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

	async getSyncStatus(): Promise<SyncStatus> {
		return {
			isSyncing: this.isSyncing,
			isOnline: this.isOnline,
			lastSyncTime: this.lastSyncTime ?? undefined,
			error: undefined,
		};
	}

	isNetworkAvailable(): boolean {
		return this.isOnline;
	}
}
