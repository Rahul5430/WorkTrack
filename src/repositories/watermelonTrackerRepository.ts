import { TrackerType } from '../constants/trackerTypes';
import { database } from '../db/watermelon';
import Tracker from '../db/watermelon/tracker/model';
import { SyncError } from '../errors';
import { logger } from '../logging';
import {
	trackerDTOToModelData,
	trackerModelToDTO,
} from '../mappers/trackerMapper';
import { ITrackerRepository, TrackerDTO } from '../types';

export class WatermelonTrackerRepository implements ITrackerRepository {
	async create(tracker: TrackerDTO, ownerId: string): Promise<void> {
		try {
			await database.write(async () => {
				const modelData = trackerDTOToModelData(tracker);
				await database
					.get<Tracker>('trackers')
					.create((trackerModel) => {
						trackerModel._raw.id = tracker.id;
						trackerModel.ownerId = modelData.ownerId;
						trackerModel.name = modelData.name;
						trackerModel.color = modelData.color;
						trackerModel.isDefault = modelData.isDefault;
						trackerModel.trackerType = modelData.trackerType;
					});
			});

			logger.debug('Successfully created tracker in WatermelonDB', {
				trackerId: tracker.id,
				ownerId,
			});
		} catch (error) {
			logger.error('Failed to create tracker in WatermelonDB', {
				error,
				tracker,
			});
			throw new SyncError('Failed to create tracker', {
				code: 'database.create_failed',
				originalError: error,
			});
		}
	}

	async update(
		tracker: Partial<TrackerDTO> & { id: string },
		ownerId: string
	): Promise<void> {
		try {
			await database.write(async () => {
				const existingTracker = await database
					.get<Tracker>('trackers')
					.find(tracker.id);

				await existingTracker.update((trackerModel: Tracker) => {
					if (tracker.name !== undefined) {
						trackerModel.name = tracker.name;
					}
					if (tracker.color !== undefined) {
						trackerModel.color = tracker.color;
					}
					if (tracker.isDefault !== undefined) {
						trackerModel.isDefault = tracker.isDefault;
					}
					if (tracker.trackerType !== undefined) {
						trackerModel.trackerType =
							tracker.trackerType as TrackerType;
					}
				});
			});

			logger.debug('Successfully updated tracker in WatermelonDB', {
				trackerId: tracker.id,
				ownerId,
			});
		} catch (error) {
			logger.error('Failed to update tracker in WatermelonDB', {
				error,
				tracker,
			});
			throw new SyncError('Failed to update tracker', {
				code: 'database.update_failed',
				originalError: error,
			});
		}
	}

	async listOwned(userId: string): Promise<TrackerDTO[]> {
		try {
			const trackers = await database
				.get<Tracker>('trackers')
				.query()
				.fetch();

			const ownedTrackers = trackers
				.filter((tracker) => tracker.ownerId === userId)
				.map(trackerModelToDTO);

			logger.debug(
				'Successfully fetched owned trackers from WatermelonDB',
				{
					userId,
					count: ownedTrackers.length,
				}
			);

			return ownedTrackers;
		} catch (error) {
			logger.error('Failed to fetch owned trackers from WatermelonDB', {
				error,
				userId,
			});
			throw new SyncError('Failed to fetch owned trackers', {
				code: 'database.fetch_failed',
				originalError: error,
			});
		}
	}

	async listSharedWith(userId: string): Promise<TrackerDTO[]> {
		try {
			// For now, return empty array since shared trackers are handled differently
			// This would need to be implemented with a proper shared tracker relationship
			logger.debug(
				'listSharedWith called on WatermelonTrackerRepository - not implemented'
			);
			return [];
		} catch (error) {
			logger.error('Failed to fetch shared trackers from WatermelonDB', {
				error,
				userId,
			});
			throw new SyncError('Failed to fetch shared trackers', {
				code: 'database.fetch_failed',
				originalError: error,
			});
		}
	}

	async ensureExists(id: string, ownerId: string): Promise<void> {
		try {
			const existingTracker = await database
				.get<Tracker>('trackers')
				.find(id)
				.catch(() => null);

			if (!existingTracker) {
				// Create a default tracker if it doesn't exist
				const defaultTracker: TrackerDTO = {
					id,
					ownerId,
					name: 'Work Tracker',
					color: '#4CAF50',
					isDefault: true,
					trackerType: 'work',
				};

				await this.create(defaultTracker, ownerId);
				logger.debug('Created default tracker in WatermelonDB', {
					trackerId: id,
					ownerId,
				});
			}
		} catch (error) {
			logger.error('Failed to ensure tracker exists in WatermelonDB', {
				error,
				trackerId: id,
				ownerId,
			});
			throw new SyncError('Failed to ensure tracker exists', {
				code: 'database.ensure_failed',
				originalError: error,
			});
		}
	}

	async upsertMany(trackers: TrackerDTO[]): Promise<void> {
		try {
			await database.write(async () => {
				for (const tracker of trackers) {
					const existingTracker = await database
						.get<Tracker>('trackers')
						.find(tracker.id)
						.catch(() => null);

					const modelData = trackerDTOToModelData(tracker);

					if (existingTracker) {
						await existingTracker.update(
							(trackerModel: Tracker) => {
								trackerModel.ownerId = modelData.ownerId;
								trackerModel.name = modelData.name;
								trackerModel.color = modelData.color;
								trackerModel.isDefault = modelData.isDefault;
								trackerModel.trackerType =
									modelData.trackerType;
							}
						);
					} else {
						await database
							.get<Tracker>('trackers')
							.create((trackerModel) => {
								trackerModel._raw.id = tracker.id;
								trackerModel.ownerId = modelData.ownerId;
								trackerModel.name = modelData.name;
								trackerModel.color = modelData.color;
								trackerModel.isDefault = modelData.isDefault;
								trackerModel.trackerType =
									modelData.trackerType;
							});
					}
				}
			});

			logger.debug('Successfully upserted trackers to WatermelonDB', {
				count: trackers.length,
			});
		} catch (error) {
			logger.error('Failed to upsert trackers to WatermelonDB', {
				error,
				count: trackers.length,
			});
			throw new SyncError('Failed to upsert trackers', {
				code: 'database.upsert_failed',
				originalError: error,
			});
		}
	}
}
