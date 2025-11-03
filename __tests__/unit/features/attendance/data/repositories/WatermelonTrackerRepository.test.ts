import { Database, Q } from '@nozbe/watermelondb';

import { TrackerModelShape } from '@/features/attendance/data/mappers/TrackerMapper';
import { WatermelonTrackerRepository } from '@/features/attendance/data/repositories/WatermelonTrackerRepository';
import { Tracker } from '@/features/attendance/domain/entities/Tracker';

describe('WatermelonTrackerRepository', () => {
	let database: jest.Mocked<Database>;
	let repository: WatermelonTrackerRepository;
	let collection: jest.Mocked<
		ReturnType<Database['get']> & {
			create: jest.Mock;
			query: jest.Mock;
		}
	>;
	let queryBuilder: {
		fetch: jest.Mock;
	};

	beforeEach(() => {
		queryBuilder = {
			fetch: jest.fn().mockResolvedValue([]),
		};

		collection = {
			create: jest.fn(),
			query: jest.fn().mockReturnValue(queryBuilder),
		} as unknown as jest.Mocked<
			ReturnType<Database['get']> & {
				create: jest.Mock;
				query: jest.Mock;
			}
		>;

		database = {
			get: jest.fn().mockReturnValue(collection),
		} as unknown as jest.Mocked<Database>;

		repository = new WatermelonTrackerRepository(database);
	});

	describe('create', () => {
		it('creates a new tracker', async () => {
			const tracker = new Tracker(
				'tracker-1',
				'My Tracker',
				'Test description',
				true,
				new Date('2024-01-01T00:00:00Z'),
				new Date('2024-01-02T00:00:00Z')
			);

			const mockModel = {
				id: 'tracker-1',
				name: 'My Tracker',
				description: 'Test description',
				isActive: true,
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: new Date('2024-01-02T00:00:00Z'),
			} as unknown as TrackerModelShape;

			collection.create.mockImplementation((cb) => {
				cb(mockModel);
				return Promise.resolve(mockModel);
			});

			const result = await repository.create(tracker);

			expect(database.get).toHaveBeenCalledWith('trackers');
			expect(collection.create).toHaveBeenCalled();
			expect(result).toBeInstanceOf(Tracker);
			expect(result.id).toBe('tracker-1');
			expect(result.name).toBe('My Tracker');
			expect(result.isActive).toBe(true);
		});

		it('creates tracker without description', async () => {
			const tracker = new Tracker(
				'tracker-1',
				'My Tracker',
				undefined,
				false,
				new Date('2024-01-01T00:00:00Z'),
				new Date('2024-01-02T00:00:00Z')
			);

			const mockModel = {
				id: 'tracker-1',
				name: 'My Tracker',
				isActive: false,
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: new Date('2024-01-02T00:00:00Z'),
			} as unknown as TrackerModelShape;

			collection.create.mockImplementation((cb) => {
				cb(mockModel);
				return Promise.resolve(mockModel);
			});

			const result = await repository.create(tracker);

			expect(result.description).toBeUndefined();
			expect(result.isActive).toBe(false);
		});
	});

	describe('update', () => {
		it('updates existing tracker', async () => {
			const tracker = new Tracker(
				'tracker-1',
				'Updated Tracker',
				'Updated description',
				false,
				new Date('2024-01-01T00:00:00Z'),
				new Date('2024-01-03T00:00:00Z')
			);

			const mockModel = {
				id: 'tracker-1',
				name: 'Updated Tracker',
				description: 'Updated description',
				isActive: false,
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: new Date('2024-01-03T00:00:00Z'),
				update: jest.fn().mockImplementation((cb) => {
					cb(mockModel);
					return Promise.resolve();
				}),
			} as unknown as TrackerModelShape & {
				update: (
					cb: (record: TrackerModelShape) => void
				) => Promise<void>;
			};

			queryBuilder.fetch.mockResolvedValueOnce([mockModel]);

			const result = await repository.update(tracker);

			expect(collection.query).toHaveBeenCalledWith(
				Q.where('id', 'tracker-1')
			);
			expect(queryBuilder.fetch).toHaveBeenCalled();
			expect(mockModel.update).toHaveBeenCalled();
			expect(result).toBeInstanceOf(Tracker);
			expect(result.name).toBe('Updated Tracker');
			expect(result.isActive).toBe(false);
		});

		it('creates tracker if not found during update', async () => {
			const tracker = new Tracker(
				'tracker-1',
				'New Tracker',
				'Description',
				true
			);

			queryBuilder.fetch.mockResolvedValueOnce([]);

			const mockModel = {
				id: 'tracker-1',
				name: 'New Tracker',
				description: 'Description',
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			} as unknown as TrackerModelShape;

			collection.create.mockImplementation((cb) => {
				cb(mockModel);
				return Promise.resolve(mockModel);
			});

			const result = await repository.update(tracker);

			expect(collection.create).toHaveBeenCalled();
			expect(result).toBeInstanceOf(Tracker);
		});
	});

	describe('delete', () => {
		it('marks tracker as deleted when found', async () => {
			const mockModel = {
				markAsDeleted: jest.fn().mockResolvedValue(undefined),
			} as unknown as { markAsDeleted: () => Promise<void> };

			queryBuilder.fetch.mockResolvedValueOnce([mockModel]);

			await repository.delete('tracker-1');

			expect(collection.query).toHaveBeenCalledWith(
				Q.where('id', 'tracker-1')
			);
			expect(mockModel.markAsDeleted).toHaveBeenCalled();
		});

		it('does nothing when tracker not found', async () => {
			queryBuilder.fetch.mockResolvedValueOnce([]);

			await repository.delete('tracker-1');

			expect(collection.query).toHaveBeenCalledWith(
				Q.where('id', 'tracker-1')
			);
		});
	});

	describe('getById', () => {
		it('returns tracker when found', async () => {
			const mockModel = {
				id: 'tracker-1',
				name: 'My Tracker',
				description: 'Description',
				isActive: true,
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: new Date('2024-01-02T00:00:00Z'),
			} as unknown as TrackerModelShape;

			queryBuilder.fetch.mockResolvedValueOnce([mockModel]);

			const result = await repository.getById('tracker-1');

			expect(collection.query).toHaveBeenCalledWith(
				Q.where('id', 'tracker-1')
			);
			expect(result).toBeInstanceOf(Tracker);
			expect(result?.id).toBe('tracker-1');
			expect(result?.name).toBe('My Tracker');
		});

		it('returns null when tracker not found', async () => {
			queryBuilder.fetch.mockResolvedValueOnce([]);

			const result = await repository.getById('tracker-1');

			expect(result).toBeNull();
		});
	});

	describe('getAllForUser', () => {
		it('returns all trackers', async () => {
			const mockModels = [
				{
					id: 'tracker-1',
					name: 'Tracker 1',
					description: 'Description 1',
					isActive: true,
					createdAt: new Date('2024-01-01T00:00:00Z'),
					updatedAt: new Date('2024-01-02T00:00:00Z'),
				},
				{
					id: 'tracker-2',
					name: 'Tracker 2',
					isActive: false,
					createdAt: new Date('2024-01-02T00:00:00Z'),
					updatedAt: new Date('2024-01-03T00:00:00Z'),
				},
			] as unknown as TrackerModelShape[];

			queryBuilder.fetch.mockResolvedValueOnce(mockModels);

			const result = await repository.getAllForUser('user-1');

			expect(collection.query).toHaveBeenCalled();
			expect(result).toHaveLength(2);
			expect(result[0]).toBeInstanceOf(Tracker);
			expect(result[1]).toBeInstanceOf(Tracker);
		});

		it('returns empty array when no trackers found', async () => {
			queryBuilder.fetch.mockResolvedValueOnce([]);

			const result = await repository.getAllForUser('user-1');

			expect(result).toEqual([]);
		});
	});
});
