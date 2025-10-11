import { getAuth } from '@react-native-firebase/auth';
import {
	collectionGroup,
	getDocs,
	query,
	where,
} from '@react-native-firebase/firestore';

import { SyncError } from '../errors';
import { logger } from '../logging';
import { getFirestoreInstance } from '../services';
import { IShareRepository, ITrackerRepository, Permission } from '../types';

export interface SharePermission {
	id: string;
	sharedWithId: string;
	sharedWithEmail: string;
	permission: Permission;
	trackerId: string;
	ownerId: string;
	ownerName: string;
	ownerEmail: string;
	ownerPhoto?: string;
	trackerType: string;
}

export interface ShareReadUseCase {
	getMyShares(): Promise<SharePermission[]>;
	getSharedWithMe(): Promise<SharePermission[]>;
	removeShare(sharedWithId: string, trackerId?: string): Promise<void>;
}

export class ShareReadUseCaseImpl implements ShareReadUseCase {
	constructor(
		private readonly shares: IShareRepository,
		private readonly trackers: ITrackerRepository
	) {}

	async getMyShares(): Promise<SharePermission[]> {
		const user = getAuth().currentUser;
		if (!user) {
			throw new SyncError('User not authenticated', {
				code: 'auth.unauthenticated',
			});
		}

		try {
			const db = getFirestoreInstance();
			// Query all shares and filter by checking if user owns the tracker
			const sharesQuery = query(collectionGroup(db, 'shares'));
			const querySnapshot = await getDocs(sharesQuery);

			const shares: SharePermission[] = [];
			for (const doc of querySnapshot.docs) {
				const data = doc.data();

				const pathParts = doc.ref.path.split('/');
				const trackerId = pathParts[1];

				// Get the tracker to check ownership
				const tracker = await this.trackers.listOwned(user.uid);
				const ownedTracker = tracker.find((t) => t.id === trackerId);

				if (ownedTracker) {
					shares.push({
						id: doc.id,
						sharedWithId: data.sharedWithId,
						sharedWithEmail: data.sharedWithEmail,
						permission: data.permission,
						trackerId: trackerId,
						ownerId: user.uid,
						ownerName: user.displayName || 'Unknown',
						ownerEmail: user.email || 'unknown@example.com',
						ownerPhoto: user.photoURL || undefined,
						trackerType: ownedTracker.trackerType,
					});
				}
			}

			return shares;
		} catch (error) {
			logger.error('Failed to get my shares', { error });
			throw new SyncError('Failed to get my shares', {
				code: 'shares.fetch_failed',
				originalError: error,
			});
		}
	}

	async getSharedWithMe(): Promise<SharePermission[]> {
		const user = getAuth().currentUser;
		if (!user) {
			throw new SyncError('User not authenticated', {
				code: 'auth.unauthenticated',
			});
		}

		try {
			const db = getFirestoreInstance();
			const sharesQuery = query(
				collectionGroup(db, 'shares'),
				where('sharedWithId', '==', user.uid)
			);
			const querySnapshot = await getDocs(sharesQuery);

			const shares: SharePermission[] = [];
			for (const doc of querySnapshot.docs) {
				const data = doc.data();

				const pathParts = doc.ref.path.split('/');
				const trackerId = pathParts[1];

				// Get the tracker to get owner information
				// Skip if ownerId is missing - this was causing the empty userId issue
				if (!data.ownerId) {
					continue;
				}

				const tracker = await this.trackers.listOwned(data.ownerId);
				const trackerInfo = tracker.find((t) => t.id === trackerId);

				shares.push({
					id: doc.id,
					sharedWithId: data.sharedWithId,
					sharedWithEmail: data.sharedWithEmail,
					permission: data.permission,
					trackerId: trackerId,
					ownerId: data.ownerId || 'unknown',
					ownerName: data.ownerName || 'Unknown',
					ownerEmail:
						data.ownerEmail ||
						data.ownerName ||
						'unknown@example.com',
					ownerPhoto: data.ownerPhoto,
					trackerType: trackerInfo?.trackerType || 'work_track',
				});
			}

			return shares;
		} catch (error) {
			logger.error('Failed to get shared with me', { error });
			throw new SyncError('Failed to get shared with me', {
				code: 'shares.fetch_failed',
				originalError: error,
			});
		}
	}

	async removeShare(sharedWithId: string, trackerId?: string): Promise<void> {
		const user = getAuth().currentUser;
		if (!user) {
			throw new SyncError('User not authenticated', {
				code: 'auth.unauthenticated',
			});
		}

		try {
			await this.shares.unshare(trackerId || 'default', sharedWithId);
		} catch (error) {
			logger.error('Failed to remove share', { error });
			throw new SyncError('Failed to remove share', {
				code: 'shares.remove_failed',
				originalError: error,
			});
		}
	}
}

export function createShareReadUseCase(
	shares: IShareRepository,
	trackers: ITrackerRepository
): ShareReadUseCase {
	return new ShareReadUseCaseImpl(shares, trackers);
}
