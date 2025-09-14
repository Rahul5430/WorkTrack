import { Q } from '@nozbe/watermelondb';

import { database, WorkTrack } from '../db/watermelon';
import { SyncError } from '../errors';
import { logger } from '../logging';
import { entryDTOToModelData, entryModelToDTO } from '../mappers/entryMapper';
import { EntryDTO, ILocalEntryRepository } from '../types';
import { MarkedDayStatus } from '../types/calendar';

export class WatermelonEntryRepository implements ILocalEntryRepository {
	async listUnsynced(): Promise<EntryDTO[]> {
		try {
			const unsyncedEntries = await database
				.get<WorkTrack>('work_tracks')
				.query(Q.where('needs_sync', true))
				.fetch();

			return unsyncedEntries.map(entryModelToDTO);
		} catch (error) {
			logger.error('Failed to fetch unsynced entries from WatermelonDB', {
				error,
			});
			throw new SyncError('Failed to fetch unsynced entries', {
				code: 'database.fetch_failed',
				originalError: error,
			});
		}
	}

	async upsertOne(entry: EntryDTO): Promise<void> {
		try {
			await database.write(async () => {
				const existingEntry = await database
					.get<WorkTrack>('work_tracks')
					.find(entry.id)
					.catch(() => null);

				const modelData = entryDTOToModelData(entry);

				if (existingEntry) {
					await existingEntry.update((workTrack) => {
						workTrack.date = modelData.date;
						workTrack.status = modelData.status as MarkedDayStatus;
						workTrack.isAdvisory = modelData.isAdvisory;
						workTrack.trackerId = modelData.trackerId;
						workTrack.needsSync = modelData.needsSync;
						workTrack.lastModified = modelData.lastModified;
					});
				} else {
					await database
						.get<WorkTrack>('work_tracks')
						.create((workTrack) => {
							workTrack._raw.id = entry.id;
							workTrack.date = modelData.date;
							workTrack.status =
								modelData.status as MarkedDayStatus;
							workTrack.isAdvisory = modelData.isAdvisory;
							workTrack.trackerId = modelData.trackerId;
							workTrack.needsSync = modelData.needsSync;
							workTrack.lastModified = modelData.lastModified;
						});
				}
			});

			logger.debug('Successfully upserted entry', { entryId: entry.id });
		} catch (error) {
			logger.error('Failed to upsert entry in WatermelonDB', {
				error,
				entry,
			});
			throw new SyncError('Failed to upsert entry', {
				code: 'database.upsert_failed',
				originalError: error,
			});
		}
	}

	async upsertMany(trackerId: string, entries: EntryDTO[]): Promise<void> {
		try {
			await database.write(async () => {
				for (const entry of entries) {
					const existingEntry = await database
						.get<WorkTrack>('work_tracks')
						.find(entry.id)
						.catch(() => null);

					const modelData = entryDTOToModelData(entry);

					if (existingEntry) {
						await existingEntry.update((workTrack) => {
							workTrack.date = modelData.date;
							workTrack.status =
								modelData.status as MarkedDayStatus;
							workTrack.isAdvisory = modelData.isAdvisory;
							workTrack.trackerId = modelData.trackerId;
							workTrack.needsSync = modelData.needsSync;
							workTrack.lastModified = modelData.lastModified;
						});
					} else {
						await database
							.get<WorkTrack>('work_tracks')
							.create((workTrack) => {
								workTrack._raw.id = entry.id;
								workTrack.date = modelData.date;
								workTrack.status =
									modelData.status as MarkedDayStatus;
								workTrack.isAdvisory = modelData.isAdvisory;
								workTrack.trackerId = modelData.trackerId;
								workTrack.needsSync = modelData.needsSync;
								workTrack.lastModified = modelData.lastModified;
							});
					}
				}
			});

			logger.debug('Successfully upserted entries', {
				trackerId,
				count: entries.length,
			});
		} catch (error) {
			logger.error('Failed to upsert entries in WatermelonDB', {
				error,
				trackerId,
				entryCount: entries.length,
			});
			throw error;
		}
	}

	async markSynced(entries: EntryDTO[]): Promise<void> {
		try {
			await database.write(async () => {
				for (const entry of entries) {
					const workTrack = await database
						.get<WorkTrack>('work_tracks')
						.find(entry.id);

					await workTrack.update((wt) => {
						wt.needsSync = false;
						wt.syncError = undefined;
						wt.retryCount = 0;
						wt.lastModified = Date.now();
					});
				}
			});

			logger.debug('Successfully marked entries as synced', {
				count: entries.length,
			});
		} catch (error) {
			logger.error('Failed to mark entries as synced in WatermelonDB', {
				error,
				entryCount: entries.length,
			});
			throw error;
		}
	}

	async getFailedSyncRecords(): Promise<EntryDTO[]> {
		try {
			const failedEntries = await database
				.get<WorkTrack>('work_tracks')
				.query(
					Q.where('needs_sync', true),
					Q.where('sync_error', Q.notEq(null))
				)
				.fetch();

			return failedEntries.map(entryModelToDTO);
		} catch (error) {
			logger.error(
				'Failed to fetch failed sync records from WatermelonDB',
				{
					error,
				}
			);
			throw error;
		}
	}

	async getRecordsExceedingRetryLimit(limit: number): Promise<EntryDTO[]> {
		try {
			const exceededEntries = await database
				.get<WorkTrack>('work_tracks')
				.query(
					Q.where('needs_sync', true),
					Q.where('retry_count', Q.gte(limit))
				)
				.fetch();

			return exceededEntries.map(entryModelToDTO);
		} catch (error) {
			logger.error(
				'Failed to fetch records exceeding retry limit from WatermelonDB',
				{ error, limit }
			);
			throw error;
		}
	}

	async getEntriesForTracker(trackerId: string): Promise<EntryDTO[]> {
		try {
			const entries = await database
				.get<WorkTrack>('work_tracks')
				.query(Q.where('tracker_id', trackerId))
				.fetch();

			return entries.map(entryModelToDTO);
		} catch (error) {
			logger.error(
				'Failed to fetch entries for tracker from WatermelonDB',
				{
					error,
					trackerId,
				}
			);
			throw error;
		}
	}

	async getAllEntries(): Promise<EntryDTO[]> {
		try {
			const entries = await database
				.get<WorkTrack>('work_tracks')
				.query()
				.fetch();

			return entries.map(entryModelToDTO);
		} catch (error) {
			logger.error('Failed to fetch all entries from WatermelonDB', {
				error,
			});
			throw error;
		}
	}

	async delete(entryId: string): Promise<void> {
		try {
			await database.write(async () => {
				const entry = await database
					.get<WorkTrack>('work_tracks')
					.find(entryId);
				await entry.destroyPermanently();
			});

			logger.debug('Successfully deleted entry from WatermelonDB', {
				entryId,
			});
		} catch (error) {
			logger.error('Failed to delete entry from WatermelonDB', {
				error,
				entryId,
			});
			throw new SyncError('Failed to delete entry', {
				code: 'database.delete_failed',
				originalError: error,
			});
		}
	}
}
