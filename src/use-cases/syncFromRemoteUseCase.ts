import { getAuth } from '@react-native-firebase/auth';

import { SyncError } from '../errors';
import { logger } from '../logging';
import {
	EntryDTO,
	ILocalEntryRepository,
	IRemoteEntryRepository,
	ITrackerRepository,
} from '../types';

export interface SyncFromRemoteUseCase {
	execute(userId: string, lastSyncTime?: number): Promise<void>;
}

export class SyncFromRemoteUseCaseImpl implements SyncFromRemoteUseCase {
	constructor(
		private readonly localEntryRepository: ILocalEntryRepository,
		private readonly trackerRepository: ITrackerRepository,
		private readonly firebaseEntryRepository: IRemoteEntryRepository,
		private readonly localTrackerRepository: ITrackerRepository
	) {}

	async execute(userId: string, lastSyncTime?: number): Promise<void> {
		logger.debug('SyncFromRemoteUseCase.execute called', {
			userId,
			lastSyncTime,
		});

		// Add overall timeout for the entire sync from remote process
		const syncPromise = this.executeSync(userId, lastSyncTime);
		const timeoutPromise = new Promise<never>((_, reject) =>
			setTimeout(
				() =>
					reject(
						new Error('Sync from remote timeout after 45 seconds')
					),
				45000
			)
		);

		await Promise.race([syncPromise, timeoutPromise]);
	}

	private async executeSync(
		userId: string,
		lastSyncTime?: number
	): Promise<void> {
		try {
			const currentUser = getAuth().currentUser;
			if (!currentUser) {
				throw new SyncError('User not authenticated', {
					code: 'auth.unauthenticated',
				});
			}

			logger.info('Syncing from remote...', { lastSyncTime });

			// Get trackers from remote (owned + shared)
			logger.debug('Fetching owned trackers from remote...');
			const ownedTrackers =
				await this.trackerRepository.listOwned(userId);
			logger.debug('Fetching shared trackers from remote...');
			const sharedTrackers =
				await this.trackerRepository.listSharedWith(userId);

			const allTrackers = [...ownedTrackers, ...sharedTrackers];
			logger.info(`Found ${allTrackers.length} trackers from remote`, {
				owned: ownedTrackers.length,
				shared: sharedTrackers.length,
			});

			// Sync trackers to local database for better performance and offline access
			if (allTrackers.length > 0) {
				logger.debug('Syncing trackers to local database', {
					count: allTrackers.length,
				});
				await this.localTrackerRepository.upsertMany(allTrackers);
				logger.info('Successfully synced trackers to local database', {
					count: allTrackers.length,
				});
			}
			const allEntries: EntryDTO[] = [];
			logger.info(
				`Starting to fetch entries for ${allTrackers.length} trackers`
			);

			for (let i = 0; i < allTrackers.length; i++) {
				const tracker = allTrackers[i];
				try {
					logger.debug('Fetching entries for tracker', {
						trackerId: tracker.id,
						progress: `${i + 1}/${allTrackers.length}`,
					});

					// Add timeout protection for individual tracker fetch
					const fetchPromise =
						this.firebaseEntryRepository.getEntriesForTracker(
							tracker.id
						);
					const timeoutPromise = new Promise<EntryDTO[]>(
						(_, reject) =>
							setTimeout(
								() =>
									reject(
										new Error(
											`Timeout fetching entries for tracker ${tracker.id}`
										)
									),
								15000
							)
					);

					const entries = await Promise.race([
						fetchPromise,
						timeoutPromise,
					]);
					allEntries.push(...entries);
					logger.debug('Fetched entries for tracker', {
						trackerId: tracker.id,
						count: entries.length,
					});
				} catch (error) {
					logger.warn('Failed to fetch entries for tracker', {
						trackerId: tracker.id,
						error,
					});
				}
			}

			if (allEntries.length > 0) {
				logger.debug('Processing entries for local sync', {
					count: allEntries.length,
				});

				const entriesByTracker = new Map<string, EntryDTO[]>();
				for (const entry of allEntries) {
					if (!entriesByTracker.has(entry.trackerId)) {
						entriesByTracker.set(entry.trackerId, []);
					}
					entriesByTracker.get(entry.trackerId)!.push(entry);
				}

				logger.debug('Syncing entries to local database', {
					count: allEntries.length,
				});

				for (const [trackerId, entries] of Array.from(
					entriesByTracker
				)) {
					await this.localEntryRepository.upsertMany(
						trackerId,
						entries
					);
				}
				logger.info(`Synced ${allEntries.length} entries from remote`);
			} else {
				logger.info('No entries to sync from remote');
			}

			logger.info('Successfully synced from remote');
		} catch (error) {
			logger.warn(
				'Failed to sync from remote, continuing with local data',
				{
					error,
				}
			);

			// Don't throw the error, just log it and continue
			// This allows the app to work offline
		}
	}
}
