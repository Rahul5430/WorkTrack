import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from '@react-native-firebase/auth';

import { logger } from '../logging';
import {
	EntryDTO,
	ILocalEntryRepository,
	IRemoteEntryRepository,
	ITrackerRepository,
	TrackerDTO,
} from '../types';
import { ErrorHandler } from '../utils/errorHandler';

export interface UserManagementUseCase {
	ensureUserHasTracker(userId: string): Promise<TrackerDTO>;
	initializeUserData(userId: string): Promise<TrackerDTO>;
	getTrackerByOwnerId(ownerId: string): Promise<TrackerDTO | null>;
	getDefaultViewUserId(): Promise<string | null>;
	setDefaultViewUserId(userId: string | null): Promise<void>;
	checkAndFixRecordsWithoutTrackerId(): Promise<void>;
	ensureDatabaseReady(): Promise<void>;
}

export class UserManagementUseCaseImpl implements UserManagementUseCase {
	private readonly DEFAULT_VIEW_KEY = '@default_view_user_id';

	constructor(
		private readonly trackers: ITrackerRepository,
		private readonly entries: ILocalEntryRepository,
		private readonly firebaseEntries: IRemoteEntryRepository
	) {}

	async ensureUserHasTracker(userId: string): Promise<TrackerDTO> {
		ErrorHandler.validateRequired(userId, 'userId');

		return ErrorHandler.wrapAsync(
			async () => {
				const ownedTrackers = await this.trackers.listOwned(userId);

				if (ownedTrackers.length > 0) {
					return ownedTrackers[0];
				}

				// Create default tracker if none exists
				const defaultTracker: Omit<TrackerDTO, 'ownerId'> = {
					id: `tracker_${userId}_${Date.now()}`,
					name: 'Work Tracker',
					color: '#4CAF50',
					isDefault: true,
					trackerType: 'work',
				};

				await this.trackers.create(
					{ ...defaultTracker, ownerId: userId },
					userId
				);
				return { ...defaultTracker, ownerId: userId };
			},
			'Failed to ensure user has tracker',
			'tracker.ensure_failed'
		);
	}

	async initializeUserData(userId: string): Promise<TrackerDTO> {
		ErrorHandler.validateRequired(userId, 'userId');

		return ErrorHandler.wrapAsync(
			async () => {
				logger.info('Initializing user data', { userId });

				// First, try to get existing tracker from local database
				const ownedTrackers = await this.trackers.listOwned(userId);

				if (ownedTrackers.length > 0) {
					logger.info('Found existing tracker in local database', {
						trackerId: ownedTrackers[0].id,
					});
					return ownedTrackers[0];
				}

				// No local tracker found - check if this is a new user or returning user
				logger.info(
					'No local tracker found, checking if user has remote data'
				);

				// For new users, we'll create a tracker locally first
				// For returning users, we'll sync from remote first
				const isNewUser = await this.isNewUser(userId);

				if (isNewUser) {
					logger.info('Detected new user, creating default tracker');
					// Create default tracker for new user
					const defaultTracker: Omit<TrackerDTO, 'ownerId'> = {
						id: `tracker_${userId}_${Date.now()}`,
						name: 'Work Tracker',
						color: '#4CAF50',
						isDefault: true,
						trackerType: 'work',
					};

					await this.trackers.create(
						{ ...defaultTracker, ownerId: userId },
						userId
					);

					logger.info('Created default tracker for new user', {
						trackerId: defaultTracker.id,
					});

					return { ...defaultTracker, ownerId: userId };
				} else {
					logger.info('Detected returning user, syncing from remote');
					// For returning users, sync from remote first
					try {
						// This will create the tracker in local DB if it exists remotely
						const syncedTrackers =
							await this.trackers.listOwned(userId);
						if (syncedTrackers.length > 0) {
							return syncedTrackers[0];
						}
					} catch (error) {
						logger.warn(
							'Failed to sync from remote, creating default tracker',
							{
								error,
							}
						);
					}

					// Fallback: create default tracker if sync failed
					const defaultTracker: Omit<TrackerDTO, 'ownerId'> = {
						id: `tracker_${userId}_${Date.now()}`,
						name: 'Work Tracker',
						color: '#4CAF50',
						isDefault: true,
						trackerType: 'work',
					};

					await this.trackers.create(
						{ ...defaultTracker, ownerId: userId },
						userId
					);

					return { ...defaultTracker, ownerId: userId };
				}
			},
			'Failed to initialize user data',
			'user.initialize_failed'
		);
	}

	private async isNewUser(userId: string): Promise<boolean> {
		try {
			// Check if user has any entries in the database
			const entries = await this.firebaseEntries.getAllEntries();
			const userHasEntries = entries.some((entry) =>
				entry.trackerId.includes(userId)
			);

			logger.debug('Checking if user is new', {
				userId,
				hasEntries: userHasEntries,
				totalEntries: entries.length,
			});

			return !userHasEntries;
		} catch (error) {
			logger.warn('Failed to check if user is new, assuming new user', {
				error,
			});
			return true; // Assume new user if we can't determine
		}
	}

	async getTrackerByOwnerId(ownerId: string): Promise<TrackerDTO | null> {
		ErrorHandler.validateRequired(ownerId, 'ownerId');

		return ErrorHandler.wrapAsync(
			async () => {
				const ownedTrackers = await this.trackers.listOwned(ownerId);
				return ownedTrackers.length > 0 ? ownedTrackers[0] : null;
			},
			'Failed to get tracker by owner ID',
			'tracker.fetch_failed'
		);
	}

	async getDefaultViewUserId(): Promise<string | null> {
		try {
			const userId = await AsyncStorage.getItem(this.DEFAULT_VIEW_KEY);
			return userId;
		} catch (error) {
			logger.error('Failed to get default view user ID', { error });
			return null;
		}
	}

	async setDefaultViewUserId(userId: string | null): Promise<void> {
		return ErrorHandler.wrapAsync(
			async () => {
				if (userId) {
					await AsyncStorage.setItem(this.DEFAULT_VIEW_KEY, userId);
				} else {
					await AsyncStorage.removeItem(this.DEFAULT_VIEW_KEY);
				}
				logger.info('Default view user ID updated', { userId });
			},
			'Failed to set default view user ID',
			'user.default_view_failed'
		);
	}

	async checkAndFixRecordsWithoutTrackerId(): Promise<void> {
		return ErrorHandler.wrapAsync(
			async () => {
				// Get all entries to check for orphaned records
				const allEntries = await this.entries.getAllEntries();
				logger.info('Checking and fixing records without tracker ID', {
					checkedEntries: allEntries.length,
				});

				// First, clean up entries with incorrect ID formats (random IDs)
				await this.cleanupIncorrectIdFormat(allEntries);

				// Then find entries with invalid or missing tracker IDs
				const orphanedEntries = allEntries.filter((entry) => {
					return (
						!entry.trackerId ||
						entry.trackerId.trim() === '' ||
						entry.trackerId === 'undefined' ||
						entry.trackerId === 'null'
					);
				});

				if (orphanedEntries.length === 0) {
					logger.info('No orphaned records found');
					return;
				}

				logger.warn('Found orphaned records', {
					orphanedCount: orphanedEntries.length,
					orphanedIds: orphanedEntries.map((e) => e.id),
				});

				// Fix orphaned records by assigning them to a default tracker
				const currentUser = getAuth().currentUser;
				if (!currentUser) {
					logger.warn(
						'No user ID available, cannot fix orphaned records'
					);
					return;
				}
				const userId = currentUser.uid;

				// Get or create a default tracker for the user
				const defaultTracker = await this.ensureUserHasTracker(userId);

				// Update orphaned entries with the default tracker ID
				for (const entry of orphanedEntries) {
					const updatedEntry: EntryDTO = {
						...entry,
						id: entry.date,
						trackerId: defaultTracker.id,
						lastModified: Date.now(),
					};

					await this.entries.upsertOne(updatedEntry);
				}

				logger.info('Successfully fixed orphaned records', {
					orphanedCount: orphanedEntries.length,
					assignedTrackerId: defaultTracker.id,
					orphanedIds: orphanedEntries.map((e) => e.id),
				});
			},
			'Failed to check and fix records without tracker ID',
			'entries.fix_failed'
		);
	}

	private async cleanupIncorrectIdFormat(
		allEntries: EntryDTO[]
	): Promise<void> {
		// Find entries with incorrect ID formats (not date-based)
		const incorrectIdEntries = allEntries.filter((entry) => {
			// Check if ID is not in date format (YYYY-MM-DD)
			const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
			return !dateRegex.test(entry.id);
		});

		if (incorrectIdEntries.length === 0) {
			logger.info('No entries with incorrect ID format found');
			return;
		}

		logger.warn('Found entries with incorrect ID format', {
			incorrectIdCount: incorrectIdEntries.length,
			incorrectIds: incorrectIdEntries.map((e) => e.id),
		});

		// Delete entries with incorrect ID format
		for (const entry of incorrectIdEntries) {
			try {
				// Delete from local database (WatermelonDB)
				await this.entries.delete(entry.id);

				// Delete from Firebase (if it exists there)
				await this.firebaseEntries.delete(entry.id);

				logger.debug(
					'Deleted entry with incorrect ID from both local and Firebase',
					{
						deletedId: entry.id,
						date: entry.date,
					}
				);
			} catch (error) {
				logger.error('Failed to cleanup entry with incorrect ID', {
					entryId: entry.id,
					error,
				});
			}
		}

		logger.info(
			'Successfully cleaned up entries with incorrect ID format',
			{
				cleanedCount: incorrectIdEntries.length,
			}
		);
	}

	async ensureDatabaseReady(): Promise<void> {
		return ErrorHandler.wrapAsync(
			async () => {
				// Perform basic database readiness checks
				try {
					// Test local database connectivity only (WatermelonDB)
					// Firestore connectivity will be tested when user is authenticated
					await this.entries.listUnsynced();

					logger.info(
						'Database readiness checks completed successfully'
					);
				} catch (error) {
					logger.warn(
						'Database readiness check failed, but continuing',
						{
							error,
						}
					);
					// Don't throw here as this is a readiness check, not a critical operation
				}
			},
			'Failed to ensure database ready',
			'database.init_failed'
		);
	}
}

export function createUserManagementUseCase(
	trackers: ITrackerRepository,
	entries: ILocalEntryRepository,
	firebaseEntries: IRemoteEntryRepository
): UserManagementUseCase {
	return new UserManagementUseCaseImpl(trackers, entries, firebaseEntries);
}
