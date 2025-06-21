import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import {
	collection,
	doc,
	getDoc,
	getDocs,
	getFirestore,
	query,
	where,
} from '@react-native-firebase/firestore';

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

export interface SharePermission {
	ownerId: string;
	sharedWithId: string;
	sharedWithEmail: string;
	permission: 'read' | 'write';
	ownerName: string;
	ownerPhoto?: string;
	trackerType: string;
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

	// Sharing Management Methods
	async shareWorkTrack(
		email: string,
		permission: 'read' | 'write',
		trackerId?: string
	): Promise<void> {
		const user = getAuth().currentUser;
		if (!user) throw new Error('User not authenticated');

		// If no trackerId provided, use the user's default tracker
		if (!trackerId) {
			const myTrackers = await this.watermelonService.getMyTrackers(
				user.uid
			);
			const defaultTracker =
				myTrackers.find((t) => t.isDefault) || myTrackers[0];
			if (!defaultTracker) {
				throw new Error('No tracker available to share');
			}
			trackerId = defaultTracker.id;
		}

		// First, find the user by email in Firebase
		const db = getFirestore(getApp());
		const usersQuery = query(
			collection(db, 'users'),
			where('email', '==', email.toLowerCase())
		);
		const usersSnapshot = await getDocs(usersQuery);

		if (usersSnapshot.empty) {
			throw new Error('User not found with this email address');
		}

		const targetUser = usersSnapshot.docs[0];
		const targetUserId = targetUser.id;

		if (targetUserId === user.uid) {
			throw new Error('You cannot share with yourself');
		}

		// Share the tracker
		await this.firebaseService.shareTracker(trackerId, {
			sharedWithId: targetUserId,
			permission,
			sharedWithEmail: email.toLowerCase(),
		});

		// Also create the share locally
		await this.watermelonService.shareTracker(
			trackerId,
			targetUserId,
			permission
		);
	}

	async removeShare(sharedWithId: string, trackerId?: string): Promise<void> {
		const user = getAuth().currentUser;
		if (!user) throw new Error('User not authenticated');

		// If no trackerId provided, find the tracker that has this share
		if (!trackerId) {
			const myShares = await this.watermelonService.getTrackersSharedByMe(
				user.uid
			);
			const share = myShares.find(
				(s) => s.share.sharedWith === sharedWithId
			);
			if (!share) {
				throw new Error('Share not found');
			}
			trackerId = share.tracker.id;
		}

		// Remove from Firebase
		await this.firebaseService.unshareTracker(trackerId, sharedWithId);

		// Remove from local database
		await this.watermelonService.removeShare(trackerId, sharedWithId);
	}

	async updateSharePermission(
		sharedWithId: string,
		permission: 'read' | 'write',
		trackerId?: string
	): Promise<void> {
		const user = getAuth().currentUser;
		if (!user) throw new Error('User not authenticated');

		// If no trackerId provided, find the tracker that has this share
		if (!trackerId) {
			const myShares = await this.watermelonService.getTrackersSharedByMe(
				user.uid
			);
			const share = myShares.find(
				(s) => s.share.sharedWith === sharedWithId
			);
			if (!share) {
				throw new Error('Share not found');
			}
			trackerId = share.tracker.id;
		}

		// Update in local database
		await this.watermelonService.updateSharePermission(
			trackerId,
			sharedWithId,
			permission
		);

		// Update in Firebase (re-create the share with new permission)
		const share = await this.watermelonService
			.getTrackersSharedByMe(user.uid)
			.then((shares) =>
				shares.find(
					(s) =>
						s.share.sharedWith === sharedWithId &&
						s.tracker.id === trackerId
				)
			);

		if (share) {
			await this.firebaseService.shareTracker(trackerId, {
				sharedWithId,
				permission,
				sharedWithEmail: share.share.sharedWith, // This should be the email
			});
		}
	}

	async getMyShares(): Promise<SharePermission[]> {
		const user = getAuth().currentUser;
		if (!user) throw new Error('User not authenticated');

		const myShares = await this.watermelonService.getTrackersSharedByMe(
			user.uid
		);

		// Convert to SharePermission format
		const sharePermissions: SharePermission[] = [];
		for (const { tracker, share } of myShares) {
			// Get the shared user's info from Firebase
			const db = getFirestore(getApp());
			try {
				const userDoc = await getDoc(
					doc(db, 'users', share.sharedWith)
				);
				if (userDoc.exists()) {
					const userData = userDoc.data();
					sharePermissions.push({
						ownerId: tracker.ownerId,
						sharedWithId: share.sharedWith,
						sharedWithEmail: userData?.email ?? share.sharedWith,
						permission: share.permission,
						ownerName: tracker.name,
						ownerPhoto: undefined, // Could be added to tracker model if needed
						trackerType: tracker.trackerType,
					});
				}
			} catch (error) {
				console.warn('Failed to get user info for share:', error);
				// Still include the share with basic info
				sharePermissions.push({
					ownerId: tracker.ownerId,
					sharedWithId: share.sharedWith,
					sharedWithEmail: share.sharedWith,
					permission: share.permission,
					ownerName: tracker.name,
					trackerType: tracker.trackerType,
				});
			}
		}

		return sharePermissions;
	}

	async getSharedWithMe(): Promise<SharePermission[]> {
		const user = getAuth().currentUser;
		if (!user) throw new Error('User not authenticated');

		const sharedWithMe =
			await this.watermelonService.getTrackersSharedWithMe(user.uid);

		// Convert to SharePermission format
		const sharePermissions: SharePermission[] = [];
		for (const { tracker, share } of sharedWithMe) {
			// Get the owner's info from Firebase
			const db = getFirestore(getApp());
			try {
				const ownerDoc = await getDoc(
					doc(db, 'users', tracker.ownerId)
				);
				if (ownerDoc.exists()) {
					const ownerData = ownerDoc.data();
					sharePermissions.push({
						ownerId: tracker.ownerId,
						sharedWithId: user.uid,
						sharedWithEmail: user.email ?? '',
						permission: share.permission,
						ownerName: ownerData?.displayName ?? tracker.name,
						ownerPhoto: ownerData?.photoURL,
						trackerType: tracker.trackerType,
					});
				}
			} catch (error) {
				console.warn('Failed to get owner info for share:', error);
				// Still include the share with basic info
				sharePermissions.push({
					ownerId: tracker.ownerId,
					sharedWithId: user.uid,
					sharedWithEmail: user.email ?? '',
					permission: share.permission,
					ownerName: tracker.name,
					trackerType: tracker.trackerType,
				});
			}
		}

		return sharePermissions;
	}

	// Default view management
	getDefaultViewUserId(): string | null {
		// This would typically be stored in AsyncStorage
		// For now, return null to use user's own tracker
		return null;
	}

	setDefaultViewUserId(userId: string | null): void {
		// This would typically be stored in AsyncStorage
		// For now, just log the change
		console.log('Setting default view user ID:', userId);
	}
}
