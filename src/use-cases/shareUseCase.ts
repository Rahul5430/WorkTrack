import { getAuth } from '@react-native-firebase/auth';
import {
	collection,
	getDocs,
	query,
	where,
} from '@react-native-firebase/firestore';

import { SyncError } from '../errors';
import { logger } from '../logging';
import { getFirestoreInstance } from '../services';
import { IShareRepository, ITrackerRepository, Permission } from '../types';

export interface ShareUseCase {
	shareByEmail(
		email: string,
		permission: Permission,
		trackerId?: string
	): Promise<void>;
	updateSharePermission(
		sharedWithId: string,
		permission: Permission,
		trackerId?: string
	): Promise<void>;
}

export class ShareUseCaseImpl implements ShareUseCase {
	constructor(
		private readonly shares: IShareRepository,
		private readonly trackers: ITrackerRepository
	) {}

	private async resolveUserIdByEmail(
		email: string
	): Promise<{ id: string; email: string }> {
		const db = getFirestoreInstance();
		const usersQuery = query(
			collection(db, 'users'),
			where('email', '==', email)
		);
		const usersSnapshot = await getDocs(usersQuery);
		if (usersSnapshot.empty) {
			throw new SyncError('User not found with this email address', {
				code: 'users.not_found',
				retryable: false,
			});
		}
		const doc = usersSnapshot.docs[0];
		return { id: doc.id, email };
	}

	private async resolveTrackerId(trackerId?: string): Promise<string> {
		if (trackerId) {
			return trackerId;
		}

		const currentUser = getAuth().currentUser;
		if (!currentUser) {
			throw new SyncError('User not authenticated', {
				code: 'auth.unauthenticated',
				retryable: false,
			});
		}

		const myTrackers = await this.trackers.listOwned(currentUser.uid);
		const defaultTracker =
			myTrackers.find((t) => t.isDefault) || myTrackers[0];

		if (!defaultTracker) {
			throw new SyncError('No tracker available to share', {
				code: 'tracker.not_found',
				retryable: false,
			});
		}

		return defaultTracker.id;
	}

	async shareByEmail(
		email: string,
		permission: Permission,
		trackerId?: string
	): Promise<void> {
		const currentUser = getAuth().currentUser;
		if (!currentUser) {
			throw new SyncError('User not authenticated', {
				code: 'auth.unauthenticated',
				retryable: false,
			});
		}

		const normalizedEmail = email.toLowerCase();
		const { id: targetUserId } =
			await this.resolveUserIdByEmail(normalizedEmail);
		const resolvedTrackerId = await this.resolveTrackerId(trackerId);

		if (targetUserId === currentUser.uid) {
			throw new SyncError('You cannot share with yourself', {
				code: 'share.self',
				retryable: false,
			});
		}

		await this.shares.share({
			trackerId: resolvedTrackerId,
			sharedWithId: targetUserId,
			permission,
			sharedWithEmail: normalizedEmail,
		});

		logger.info('Shared tracker successfully', {
			trackerId: resolvedTrackerId,
			sharedWithId: targetUserId,
			permission,
		});
	}

	async updateSharePermission(
		sharedWithId: string,
		permission: Permission,
		trackerId?: string
	): Promise<void> {
		const resolvedTrackerId = await this.resolveTrackerId(trackerId);

		await this.shares.updatePermission(
			resolvedTrackerId,
			sharedWithId,
			permission
		);
		logger.info('Updated share permission', {
			trackerId: resolvedTrackerId,
			sharedWithId,
			permission,
		});
	}
}

export function createShareUseCase(
	shares: IShareRepository,
	trackers: ITrackerRepository
): ShareUseCase {
	return new ShareUseCaseImpl(shares, trackers);
}
