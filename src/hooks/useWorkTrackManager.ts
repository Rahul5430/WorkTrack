import { getAuth } from '@react-native-firebase/auth';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { Container, createDefaultContainer } from '../di/container';
import { SyncError } from '../errors';
import { logger } from '../logging';
import { GoogleUser } from '../store/reducers/userSlice';
import {
	Permission,
	SyncStatusDTO,
	TrackerDTO,
	WorkTrackManager,
} from '../types';
import { useAppSelector } from './redux';

// Singleton container to ensure all components use the same sync instance
let globalContainer: Container | null = null;

export function useWorkTrackManager(): WorkTrackManager {
	const container = useMemo(() => {
		if (!globalContainer) {
			globalContainer = createDefaultContainer();
		}
		return globalContainer;
	}, []);
	const currentUser = useAppSelector(
		(state) => state.user.user
	) as GoogleUser | null;

	// Periodic sync state
	const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const isPeriodicSyncActiveRef = useRef(false);

	const getCurrentUserId = useCallback(() => {
		if (!currentUser?.id) {
			throw new SyncError('User not authenticated', {
				code: 'auth.unauthenticated',
			});
		}
		return currentUser.id;
	}, [currentUser]);

	const sync = useCallback(async () => {
		await container.sync.execute();
	}, [container]);

	const share = useCallback(
		async (email: string, permission: Permission, trackerId?: string) => {
			await container.share.shareByEmail(email, permission, trackerId);
		},
		[container]
	);

	const updateSharePermission = useCallback(
		async (
			sharedWithId: string,
			permission: Permission,
			trackerId?: string
		) => {
			await container.share.updateSharePermission(
				sharedWithId,
				permission,
				trackerId
			);
		},
		[container]
	);

	const getSyncStatus = useCallback(async (): Promise<SyncStatusDTO> => {
		return container.sync.getSyncStatus();
	}, [container]);

	const startPeriodicSync = useCallback(
		async (intervalMs: number = 30000) => {
			if (isPeriodicSyncActiveRef.current) {
				logger.warn('Periodic sync is already active');
				return;
			}

			if (!currentUser?.id) {
				logger.warn(
					'Cannot start periodic sync: user not authenticated'
				);
				return;
			}

			logger.info('Starting periodic sync', { intervalMs });
			isPeriodicSyncActiveRef.current = true;

			// Initial sync
			try {
				await container.sync.execute();
				logger.debug('Initial periodic sync completed');
			} catch (error) {
				logger.error('Initial periodic sync failed', { error });
			}

			// Set up interval
			syncIntervalRef.current = setInterval(async () => {
				if (!isPeriodicSyncActiveRef.current) {
					return;
				}

				try {
					logger.debug('Running periodic sync');
					await container.sync.execute();
					logger.debug('Periodic sync completed successfully');
				} catch (error) {
					logger.error('Periodic sync failed', { error });
				}
			}, intervalMs);
		},
		[container.sync, currentUser?.id]
	);

	const stopPeriodicSync = useCallback(() => {
		if (!isPeriodicSyncActiveRef.current) {
			logger.warn('Periodic sync is not active');
			return;
		}

		logger.info('Stopping periodic sync');
		isPeriodicSyncActiveRef.current = false;

		if (syncIntervalRef.current) {
			clearInterval(syncIntervalRef.current);
			syncIntervalRef.current = null;
		}

		logger.debug('Periodic sync stopped');
	}, []);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (syncIntervalRef.current) {
				clearInterval(syncIntervalRef.current);
				syncIntervalRef.current = null;
			}
			isPeriodicSyncActiveRef.current = false;
		};
	}, []);

	const triggerSync = useCallback(async () => {
		await container.sync.execute();
	}, [container.sync]);

	const syncFromRemote = useCallback(async () => {
		const authUser = getAuth().currentUser;
		if (!authUser) {
			throw new SyncError('User not authenticated', {
				code: 'auth.unauthenticated',
			});
		}
		await container.syncFromRemote.execute(authUser.uid);
	}, [container.syncFromRemote]);

	const getMyTrackers = useCallback(async () => {
		const userId = getCurrentUserId();
		return container.localTrackers.listOwned(userId);
	}, [container.localTrackers, getCurrentUserId]);

	const getSharedTrackers = useCallback(async () => {
		const userId = getCurrentUserId();
		return container.localTrackers.listSharedWith(userId);
	}, [container.localTrackers, getCurrentUserId]);

	const createTracker = useCallback(
		async (tracker: Omit<TrackerDTO, 'ownerId'>) => {
			const userId = getCurrentUserId();
			const trackerWithOwner: TrackerDTO = {
				...tracker,
				ownerId: userId,
			};
			// Create in both local and remote
			await container.localTrackers.create(trackerWithOwner, userId);
			await container.trackers.create(trackerWithOwner, userId);
		},
		[container.localTrackers, container.trackers, getCurrentUserId]
	);

	const updateTracker = useCallback(
		async (
			tracker: Partial<Omit<TrackerDTO, 'ownerId'>> & { id: string }
		) => {
			const userId = getCurrentUserId();
			// Update in both local and remote
			await container.localTrackers.update(tracker, userId);
			await container.trackers.update(tracker, userId);
		},
		[container.localTrackers, container.trackers, getCurrentUserId]
	);

	return useMemo<WorkTrackManager>(
		() => ({
			sync,
			share,
			getSyncStatus,
			startPeriodicSync,
			stopPeriodicSync,
			triggerSync,
			syncFromRemote,
			getMyTrackers,
			getSharedTrackers,
			createTracker,
			updateTracker,
			updateSharePermission,
			shareRead: container.shareRead,
			userManagement: container.userManagement,
			entry: container.entry,
		}),
		[
			sync,
			share,
			getSyncStatus,
			startPeriodicSync,
			stopPeriodicSync,
			triggerSync,
			syncFromRemote,
			getMyTrackers,
			getSharedTrackers,
			createTracker,
			updateTracker,
			updateSharePermission,
			container,
		]
	);
}
