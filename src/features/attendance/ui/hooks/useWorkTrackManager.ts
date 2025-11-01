import { getAuth } from '@react-native-firebase/auth';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';

import { useDI } from '@/app/providers/DIProvider';
import { RootState } from '@/app/store';
import { AttendanceServiceIdentifiers } from '@/features/attendance/di';
import { Tracker } from '@/features/attendance/domain/entities/Tracker';
import { WorkEntry } from '@/features/attendance/domain/entities/WorkEntry';
import { ITrackerRepository } from '@/features/attendance/domain/ports/ITrackerRepository';
import {
	CreateEntryUseCase,
	GetEntriesForTrackerUseCase,
	UpdateEntryUseCase,
} from '@/features/attendance/domain/use-cases';
import { AuthServiceIdentifiers } from '@/features/auth/di';
import { IAuthRepository } from '@/features/auth/domain/ports/IAuthRepository';
import { SharingServiceIdentifiers } from '@/features/sharing/di';
import { Permission } from '@/features/sharing/domain/entities/Permission';
import { Share } from '@/features/sharing/domain/entities/Share';
import {
	GetSharedWithMeUseCase,
	ShareTrackerUseCase,
	UpdatePermissionUseCase,
} from '@/features/sharing/domain/use-cases';
import { SyncManager } from '@/features/sync/data/services/SyncManager';
import { SyncServiceIdentifiers } from '@/features/sync/di';
import { INetworkMonitor } from '@/features/sync/domain/ports/INetworkMonitor';
import { ISyncQueueRepository } from '@/features/sync/domain/ports/ISyncQueueRepository';
import { UUID } from '@/shared/domain/value-objects/UUID';
import { logger } from '@/shared/utils/logging';

// Types for the hook return value
type TrackerInfo = { id: string; name: string };
type EntryInfo = {
	date: string;
	status: 'office' | 'wfh' | 'holiday' | 'leave' | 'weekend' | 'forecast';
	isAdvisory?: boolean;
};

export interface WorkTrackManager {
	userManagement: {
		initializeUserData: (userId: string) => Promise<TrackerInfo>;
		ensureUserHasTracker: (userId: string) => Promise<TrackerInfo>;
		getTrackerByOwnerId: (ownerId: string) => Promise<TrackerInfo | null>;
	};
	entry: {
		getEntriesForTracker: (trackerId: string) => Promise<EntryInfo[]>;
		createOrUpdateEntry: (entry: {
			trackerId: string;
			date: string;
			status: EntryInfo['status'];
			isAdvisory?: boolean;
		}) => Promise<void>;
		getFailedSyncRecords: () => Promise<
			Array<
				EntryInfo & {
					id: string;
					syncError?: string;
					retryCount?: number;
				}
			>
		>;
		getRecordsExceedingRetryLimit: (
			limit: number
		) => Promise<Array<EntryInfo & { id: string }>>;
	};
	triggerSync: () => Promise<void>;
	sync: () => Promise<void>;
	syncFromRemote: () => Promise<void>;
	getSyncStatus: () => Promise<{
		isSyncing: boolean;
		isOnline: boolean;
		lastSyncTime?: number;
	}>;
	startPeriodicSync: (intervalMs?: number) => Promise<void>;
	stopPeriodicSync: () => void;
	share: (
		email: string,
		permission: Permission,
		trackerId?: string
	) => Promise<void>;
	updateSharePermission: (
		sharedWithId: string,
		permission: Permission,
		trackerId?: string
	) => Promise<void>;
	getMyTrackers: () => Promise<TrackerInfo[]>;
	getSharedTrackers: () => Promise<TrackerInfo[]>;
	createTracker: (tracker: Omit<TrackerInfo, 'id'>) => Promise<TrackerInfo>;
	updateTracker: (
		tracker: Partial<Omit<TrackerInfo, 'id'>> & { id: string }
	) => Promise<TrackerInfo>;
}

export function useWorkTrackManager(): WorkTrackManager {
	const container = useDI();
	const currentUser = useSelector((state: RootState) => state.user.user);

	// Periodic sync state
	const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const isPeriodicSyncActiveRef = useRef(false);

	// Resolve dependencies from DI container
	const createEntryUseCase = useMemo(
		() =>
			container.resolve<CreateEntryUseCase>(
				AttendanceServiceIdentifiers.CREATE_ENTRY
			),
		[container]
	);

	const updateEntryUseCase = useMemo(
		() =>
			container.resolve<UpdateEntryUseCase>(
				AttendanceServiceIdentifiers.UPDATE_ENTRY
			),
		[container]
	);

	const getEntriesForTrackerUseCase = useMemo(
		() =>
			container.resolve<GetEntriesForTrackerUseCase>(
				AttendanceServiceIdentifiers.GET_ENTRIES_FOR_TRACKER
			),
		[container]
	);

	const trackerRepository = useMemo(
		() =>
			container.resolve<ITrackerRepository>(
				AttendanceServiceIdentifiers.TRACKER_REPOSITORY
			),
		[container]
	);

	const syncManager = useMemo(
		() =>
			container.resolve<SyncManager>(SyncServiceIdentifiers.SYNC_MANAGER),
		[container]
	);

	const shareTrackerUseCase = useMemo(
		() =>
			container.resolve<ShareTrackerUseCase>(
				SharingServiceIdentifiers.SHARE_TRACKER
			),
		[container]
	);

	const updatePermissionUseCase = useMemo(
		() =>
			container.resolve<UpdatePermissionUseCase>(
				SharingServiceIdentifiers.UPDATE_PERMISSION
			),
		[container]
	);

	const getSharedWithMeUseCase = useMemo(
		() =>
			container.resolve<GetSharedWithMeUseCase>(
				SharingServiceIdentifiers.GET_SHARED_WITH_ME
			),
		[container]
	);

	const syncQueueRepository = useMemo(
		() =>
			container.resolve<ISyncQueueRepository>(
				SyncServiceIdentifiers.SYNC_QUEUE_REPOSITORY
			),
		[container]
	);

	const networkMonitor = useMemo(
		() =>
			container.resolve<INetworkMonitor>(
				SyncServiceIdentifiers.NETWORK_MONITOR
			),
		[container]
	);

	const authRepository = useMemo(
		() =>
			container.resolve<IAuthRepository>(
				AuthServiceIdentifiers.AUTH_REPOSITORY
			),
		[container]
	);

	const getCurrentUserId = useCallback(() => {
		if (!currentUser?.id) {
			throw new Error('User not authenticated');
		}
		return currentUser.id;
	}, [currentUser]);

	// Sync operations
	const sync = useCallback(async () => {
		await syncManager.processNow();
	}, [syncManager]);

	const triggerSync = useCallback(async () => {
		await syncManager.processNow();
	}, [syncManager]);

	const syncFromRemote = useCallback(async () => {
		const authUser = getAuth().currentUser;
		if (!authUser) {
			throw new Error('User not authenticated');
		}
		// SyncManager handles syncFromRemote internally
		await syncManager.processNow();
	}, [syncManager]);

	const getSyncStatus = useCallback(async () => {
		const isOnline = await networkMonitor.isOnline();

		return {
			isSyncing: syncManager.running,
			isOnline,
			lastSyncTime: Date.now(),
		};
	}, [syncManager, networkMonitor]);

	// Periodic sync
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
				await syncManager.processNow();
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
					await syncManager.processNow();
					logger.debug('Periodic sync completed successfully');
				} catch (error) {
					logger.error('Periodic sync failed', { error });
				}
			}, intervalMs);
		},
		[syncManager, currentUser?.id]
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

	// Sharing operations
	const share = useCallback(
		async (email: string, permission: Permission, trackerId?: string) => {
			const userId = getCurrentUserId();

			// Look up user by email to get their actual userId
			const sharedWithUser = await authRepository.getUserByEmail(
				email.toLowerCase()
			);

			if (!sharedWithUser) {
				throw new Error(
					`User with email ${email} not found. They must be signed up to receive shares.`
				);
			}

			const shareId = UUID.generate().value;
			const shareEntity = new Share(
				shareId,
				trackerId || userId, // Use trackerId if provided, otherwise use userId
				sharedWithUser.id, // Use actual userId from lookup
				permission
			);
			await shareTrackerUseCase.execute(shareEntity);
		},
		[shareTrackerUseCase, authRepository, getCurrentUserId]
	);

	const updateSharePermission = useCallback(
		async (
			sharedWithId: string,
			permission: Permission,
			_trackerId?: string
		) => {
			await updatePermissionUseCase.execute(sharedWithId, permission);
		},
		[updatePermissionUseCase]
	);

	// Tracker operations
	const getMyTrackers = useCallback(async () => {
		const userId = getCurrentUserId();
		const trackers = await trackerRepository.getAllForUser(userId);
		return trackers.map((t) => ({ id: t.id, name: t.name }));
	}, [trackerRepository, getCurrentUserId]);

	const getSharedTrackers = useCallback(async () => {
		const userId = getCurrentUserId();
		const shares = await getSharedWithMeUseCase.execute(userId);
		// Extract unique tracker IDs from shares and get tracker details
		const trackerIds = [...new Set(shares.map((s) => s.trackerId))];
		const trackers = await Promise.all(
			trackerIds.map(async (trackerId) => {
				const tracker = await trackerRepository.getById(trackerId);
				if (!tracker) {
					return null;
				}
				return { id: tracker.id, name: tracker.name };
			})
		);

		return trackers.filter(
			(tracker): tracker is TrackerInfo => tracker !== null
		);
	}, [getSharedWithMeUseCase, trackerRepository, getCurrentUserId]);

	const createTracker = useCallback(
		async (tracker: Omit<TrackerInfo, 'id'>) => {
			const trackerId = UUID.generate().value;
			const domainTracker = new Tracker(
				trackerId,
				tracker.name,
				'',
				true
			);

			const created = await trackerRepository.create(domainTracker);

			return { id: created.id, name: created.name };
		},
		[trackerRepository]
	);

	const updateTracker = useCallback(
		async (tracker: Partial<Omit<TrackerInfo, 'id'>> & { id: string }) => {
			const existing = await trackerRepository.getById(tracker.id);
			if (!existing) {
				throw new Error(`Tracker with id ${tracker.id} not found`);
			}
			// Create new Tracker with updated values
			const updated = new Tracker(
				existing.id,
				tracker.name ?? existing.name,
				existing.description,
				existing.isActive,
				existing.createdAt,
				new Date()
			);
			const saved = await trackerRepository.update(updated);
			return { id: saved.id, name: saved.name };
		},
		[trackerRepository]
	);

	// User management operations
	const initializeUserData = useCallback(
		async (userId: string): Promise<TrackerInfo> => {
			// Check if user already has a tracker
			const trackers = await trackerRepository.getAllForUser(userId);
			if (trackers.length > 0) {
				const tracker = trackers[0];
				return { id: tracker.id, name: tracker.name };
			}

			// Create a new tracker for the user
			const trackerId = UUID.generate().value;
			const newTracker = new Tracker(
				trackerId,
				'My WorkTrack',
				'Default work tracker',
				true
			);
			const created = await trackerRepository.create(newTracker);
			return { id: created.id, name: created.name };
		},
		[trackerRepository]
	);

	const ensureUserHasTracker = useCallback(
		async (userId: string): Promise<TrackerInfo> => {
			return initializeUserData(userId);
		},
		[initializeUserData]
	);

	const getTrackerByOwnerId = useCallback(
		async (ownerId: string): Promise<TrackerInfo | null> => {
			const trackers = await trackerRepository.getAllForUser(ownerId);
			if (trackers.length === 0) {
				return null;
			}
			const tracker = trackers[0];
			return { id: tracker.id, name: tracker.name };
		},
		[trackerRepository]
	);

	// Entry operations
	const getEntriesForTracker = useCallback(
		async (trackerId: string): Promise<EntryInfo[]> => {
			const entries =
				await getEntriesForTrackerUseCase.execute(trackerId);
			return entries.map((entry) => ({
				date: entry.date,
				status: entry.status.value as EntryInfo['status'],
				isAdvisory: entry.isAdvisory,
			}));
		},
		[getEntriesForTrackerUseCase]
	);

	const createOrUpdateEntry = useCallback(
		async (entry: {
			trackerId: string;
			date: string;
			status: EntryInfo['status'];
			isAdvisory?: boolean;
		}) => {
			const userId = getCurrentUserId();

			// Check if entry exists for this date and tracker
			const existingEntries = await getEntriesForTrackerUseCase.execute(
				entry.trackerId
			);
			const existing = existingEntries.find((e) => e.date === entry.date);

			if (existing) {
				// Update existing entry
				const updated = existing.withUpdates({
					status: entry.status,
					isAdvisory: entry.isAdvisory ?? existing.isAdvisory,
				});
				await updateEntryUseCase.execute(updated);
			} else {
				// Create new entry
				const entryId = UUID.generate().value;
				const workEntry = new WorkEntry(
					entryId,
					userId,
					entry.trackerId,
					entry.date,
					entry.status,
					undefined,
					entry.isAdvisory ?? false
				);
				await createEntryUseCase.execute(workEntry);
			}
		},
		[
			createEntryUseCase,
			updateEntryUseCase,
			getEntriesForTrackerUseCase,
			getCurrentUserId,
		]
	);

	const getFailedSyncRecords = useCallback(async () => {
		const allOps = await syncQueueRepository.getAll();
		const failedOps = allOps.filter(
			(op) => op.status === 'failed' && op.tableName === 'work_entries'
		);

		// Extract entry info from failed sync operations
		const entries: Array<
			EntryInfo & {
				id: string;
				syncError?: string;
				retryCount?: number;
			}
		> = [];

		for (const op of failedOps) {
			if (!op.data) {
				continue;
			}
			entries.push({
				id: op.recordId,
				date: op.data.date as string,
				status: op.data.status as EntryInfo['status'],
				isAdvisory: op.data.isAdvisory as boolean | undefined,
				syncError: undefined, // SyncOperation doesn't expose errorMessage directly
				retryCount: op.retryCount,
			});
		}

		return entries;
	}, [syncQueueRepository]);

	const getRecordsExceedingRetryLimit = useCallback(
		async (limit: number) => {
			const allOps = await syncQueueRepository.getAll();
			const exceededOps = allOps.filter(
				(op) =>
					op.tableName === 'work_entries' &&
					op.retryCount >= limit &&
					(op.status === 'failed' || op.status === 'pending')
			);

			// Extract entry info from sync operations
			const entries: Array<EntryInfo & { id: string }> = [];

			for (const op of exceededOps) {
				if (!op.data) {
					continue;
				}
				entries.push({
					id: op.recordId,
					date: op.data.date as string,
					status: op.data.status as EntryInfo['status'],
					isAdvisory: op.data.isAdvisory as boolean | undefined,
				});
			}

			return entries;
		},
		[syncQueueRepository]
	);

	return useMemo<WorkTrackManager>(
		() => ({
			userManagement: {
				initializeUserData,
				ensureUserHasTracker,
				getTrackerByOwnerId,
			},
			entry: {
				getEntriesForTracker,
				createOrUpdateEntry,
				getFailedSyncRecords,
				getRecordsExceedingRetryLimit,
			},
			triggerSync,
			sync,
			syncFromRemote,
			getSyncStatus,
			startPeriodicSync,
			stopPeriodicSync,
			share,
			updateSharePermission,
			getMyTrackers,
			getSharedTrackers,
			createTracker,
			updateTracker,
		}),
		[
			initializeUserData,
			ensureUserHasTracker,
			getTrackerByOwnerId,
			getEntriesForTracker,
			createOrUpdateEntry,
			getFailedSyncRecords,
			getRecordsExceedingRetryLimit,
			triggerSync,
			sync,
			syncFromRemote,
			getSyncStatus,
			startPeriodicSync,
			stopPeriodicSync,
			share,
			updateSharePermission,
			getMyTrackers,
			getSharedTrackers,
			createTracker,
			updateTracker,
		]
	);
}
