import { getAuth } from '@react-native-firebase/auth';

import { SyncError } from '../errors';
import { logger } from '../logging';
import {
	EntryDTO,
	ILocalEntryRepository,
	IRemoteEntryRepository,
	ITrackerRepository,
} from '../types';

export interface SyncToRemoteUseCase {
	execute(): Promise<void>;
}

export class SyncToRemoteUseCaseImpl implements SyncToRemoteUseCase {
	constructor(
		private readonly localEntryRepository: ILocalEntryRepository,
		private readonly firebaseEntryRepository: IRemoteEntryRepository,
		private readonly trackerRepository: ITrackerRepository
	) {}

	async execute(): Promise<void> {
		try {
			const unsyncedEntries =
				await this.localEntryRepository.listUnsynced();
			logger.debug('Found unsynced entries', {
				count: unsyncedEntries.length,
			});

			if (unsyncedEntries.length === 0) {
				logger.info('No entries to sync to remote');
				return;
			}

			unsyncedEntries.forEach((entry, index) => {
				logger.debug('Unsynced entry', {
					index,
					trackerId: entry.trackerId,
					date: entry.date,
					status: entry.status,
				});
			});

			logger.info(
				`Syncing ${unsyncedEntries.length} entries to remote...`
			);

			const trackerIds = new Set(unsyncedEntries.map((e) => e.trackerId));
			const currentUser = getAuth().currentUser;

			if (!currentUser) {
				throw new SyncError('User not authenticated', {
					code: 'auth.unauthenticated',
				});
			}

			// Ensure trackers exist in Firebase before syncing entries
			for (const trackerId of Array.from(trackerIds)) {
				logger.debug('Ensuring tracker structure exists', {
					trackerId,
				});
				// Check these variables:
				await this.trackerRepository.ensureExists(
					trackerId,
					currentUser.uid
				);
			}

			const entriesByTracker = new Map<string, EntryDTO[]>();
			for (const entry of unsyncedEntries) {
				if (!entriesByTracker.has(entry.trackerId)) {
					entriesByTracker.set(entry.trackerId, []);
				}
				entriesByTracker.get(entry.trackerId)!.push(entry);
			}

			for (const [trackerId, entries] of Array.from(entriesByTracker)) {
				await this.firebaseEntryRepository.upsertMany(
					trackerId,
					entries
				);
			}

			await this.localEntryRepository.markSynced(unsyncedEntries);

			logger.info('Successfully synced entries to remote');
		} catch (error) {
			logger.error('Failed to sync entries to remote', { error });

			// Mark entries with sync error for retry
			if (error instanceof Error) {
				// This would be handled by the entry repository
				logger.warn('Marking entries with sync error for retry', {
					error: error.message,
				});
			}

			throw new SyncError(
				`Failed to sync to remote: ${error instanceof Error ? error.message : 'Unknown error'}`,
				{
					code: 'sync.to_remote_failed',
				}
			);
		}
	}
}
