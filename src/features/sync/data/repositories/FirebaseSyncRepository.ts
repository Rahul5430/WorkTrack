// Firebase sync repository
import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import {
	collection,
	collectionGroup,
	doc,
	getDocs,
	getFirestore,
	query,
	where,
	writeBatch,
} from '@react-native-firebase/firestore';

import { logger } from '@/shared/utils/logging';

import { SyncOperationPayload } from '../../domain/entities/SyncOperation';
import { ISyncRepository } from '../../domain/ports/ISyncRepository';
import type { ISyncOpOutcome } from '../../domain/types';

export class FirebaseSyncRepository implements ISyncRepository {
	private readonly firestore;

	constructor() {
		const app = getApp();
		this.firestore = getFirestore(app);
	}

	async syncToRemote(
		operations: { id: string; payload: SyncOperationPayload }[]
	): Promise<ISyncOpOutcome[]> {
		logger.info('Syncing operations to remote', {
			count: operations.length,
		});
		const batch = writeBatch(this.firestore);

		for (const op of operations) {
			const payload = op.payload;

			// Map WatermelonDB table names to Firestore collection paths
			let ref: ReturnType<typeof doc>;
			if (payload.tableName === 'work_entries') {
				// Entries are stored under trackers/{trackerId}/entries/{entryId}
				const trackerId = payload.data?.trackerId as string | undefined;
				if (!trackerId) {
					logger.warn(
						'Sync operation missing trackerId for work_entry',
						{
							operationId: op.id,
						}
					);
					continue;
				}
				const trackerRef = doc(this.firestore, 'trackers', trackerId);
				const entriesRef = collection(trackerRef, 'entries');
				ref = doc(entriesRef, payload.recordId);
			} else if (payload.tableName === 'shares') {
				// Shares are stored under trackers/{trackerId}/shares/{shareId}
				const trackerId = payload.data?.trackerId as string | undefined;
				if (!trackerId) {
					logger.warn('Sync operation missing trackerId for share', {
						operationId: op.id,
					});
					continue;
				}
				const trackerRef = doc(this.firestore, 'trackers', trackerId);
				const sharesRef = collection(trackerRef, 'shares');
				ref = doc(sharesRef, payload.recordId);
			} else {
				// trackers and users are at root level
				const collectionRef = collection(
					this.firestore,
					payload.tableName
				);
				ref = doc(collectionRef, payload.recordId);
			}

			switch (payload.operation) {
				case 'create':
				case 'update':
					if (payload.data) {
						batch.set(ref, payload.data, { merge: true });
					}
					break;
				case 'delete':
					batch.delete(ref);
					break;
			}
		}

		await batch.commit();
		logger.info('Successfully synced operations to remote');
		return operations.map((o) => ({ opId: o.id, success: true }));
	}

	async syncFromRemote(since?: Date): Promise<void> {
		logger.info('Syncing from remote', { since });
		const sinceMs = since ? since.getTime() : undefined;

		// Sync users at root level
		try {
			const usersRef = collection(this.firestore, 'users');
			const usersQuery = sinceMs
				? query(usersRef, where('updated_at', '>', sinceMs))
				: usersRef;
			const usersSnapshot = await getDocs(usersQuery);
			logger.info('Pulled remote changes', {
				collection: 'users',
				count: usersSnapshot.size,
			});
		} catch (error) {
			logger.warn('Failed to sync users from remote', { error });
		}

		// Sync trackers at root level - only trackers owned by the current user
		try {
			const auth = getAuth();
			const currentUser = auth.currentUser;
			if (!currentUser) {
				logger.warn('No authenticated user, skipping tracker sync');
			} else {
				const trackersRef = collection(this.firestore, 'trackers');
				// Filter trackers by ownerId to only get trackers the user owns
				// This prevents permission denied errors when trying to read entries from other users' trackers
				const trackersQuery = sinceMs
					? query(
							trackersRef,
							where('ownerId', '==', currentUser.uid),
							where('updated_at', '>', sinceMs)
						)
					: query(
							trackersRef,
							where('ownerId', '==', currentUser.uid)
						);
				const trackersSnapshot = await getDocs(trackersQuery);
				logger.info('Pulled remote changes', {
					collection: 'trackers',
					count: trackersSnapshot.size,
				});

				// Sync entries from each tracker's entries subcollection
				// Only trackers owned by the user are included, so we should have permission
				for (const trackerDoc of trackersSnapshot.docs) {
					try {
						const trackerId = trackerDoc.id;
						const entriesRef = collection(
							doc(this.firestore, 'trackers', trackerId),
							'entries'
						);
						const entriesQuery = sinceMs
							? query(
									entriesRef,
									where('updated_at', '>', sinceMs)
								)
							: entriesRef;
						const entriesSnapshot = await getDocs(entriesQuery);
						logger.debug('Pulled remote changes', {
							collection: `trackers/${trackerId}/entries`,
							count: entriesSnapshot.size,
						});
					} catch (error) {
						logger.warn('Failed to sync entries from tracker', {
							trackerId: trackerDoc.id,
							error,
						});
					}
				}
			}
		} catch (error) {
			logger.warn('Failed to sync trackers from remote', { error });
		}

		// Sync shares using collectionGroup query (all shares across all trackers)
		try {
			const sharesGroup = collectionGroup(this.firestore, 'shares');
			const sharesQuery = sinceMs
				? query(sharesGroup, where('updated_at', '>', sinceMs))
				: sharesGroup;
			const sharesSnapshot = await getDocs(sharesQuery);
			logger.info('Pulled remote changes', {
				collection: 'shares (collectionGroup)',
				count: sharesSnapshot.size,
			});
		} catch (error) {
			logger.warn('Failed to sync shares from remote', { error });
		}

		// Note: For now, we only read; applying to local DB is handled by
		// a dedicated mapper/repository in a subsequent step of the manager flow.
		// Future: upsert into WatermelonDB within a single write block
	}
}
