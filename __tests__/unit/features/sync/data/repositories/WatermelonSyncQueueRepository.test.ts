import { Database } from '@nozbe/watermelondb';

import SyncOperationModel from '@/features/sync/data/models/SyncOperationModel';
import { WatermelonSyncQueueRepository } from '@/features/sync/data/repositories/WatermelonSyncQueueRepository';
import { SyncOperation } from '@/features/sync/domain/entities/SyncOperation';

describe('WatermelonSyncQueueRepository', () => {
	let database: jest.Mocked<Database>;
	let repository: WatermelonSyncQueueRepository;
	let collection: jest.Mocked<
		ReturnType<Database['get']> & {
			create: jest.Mock;
			find: jest.Mock;
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
			find: jest.fn(),
			query: jest.fn().mockReturnValue(queryBuilder),
		} as unknown as jest.Mocked<
			ReturnType<Database['get']> & {
				create: jest.Mock;
				find: jest.Mock;
				query: jest.Mock;
			}
		>;

		database = {
			get: jest.fn().mockReturnValue(collection),
		} as unknown as jest.Mocked<Database>;

		repository = new WatermelonSyncQueueRepository(database);
	});

	describe('enqueue', () => {
		it('creates a new sync operation in the database', async () => {
			const op = new SyncOperation(
				'op1',
				'create',
				'work_entries',
				'w1',
				{ foo: 'bar' }
			);

			const mockModel = {
				destroyPermanently: jest.fn(),
			};

			collection.create.mockImplementation((cb) => {
				const model = {} as unknown as SyncOperationModel;
				cb(model);
				return Promise.resolve(mockModel);
			});

			await repository.enqueue(op);

			expect(database.get).toHaveBeenCalledWith('sync_queue');
			expect(collection.create).toHaveBeenCalled();
		});
	});

	describe('dequeue', () => {
		it('returns null when no pending operations', async () => {
			queryBuilder.fetch.mockResolvedValueOnce([]);

			const result = await repository.dequeue();

			expect(result).toBeNull();
			expect(collection.query).toHaveBeenCalled();
		});

		it('returns and deletes first pending operation', async () => {
			const mockModel = {
				id: 'op1',
				operation: 'create',
				tableName: 'work_entries',
				recordId: 'w1',
				data: '{"foo":"bar"}',
				status: 'pending',
				retryCount: 0,
				maxRetries: 5,
				createdAt: new Date('2023-01-01'),
				updatedAt: new Date('2023-01-01'),
				destroyPermanently: jest.fn().mockResolvedValue(undefined),
			} as unknown as SyncOperationModel;

			queryBuilder.fetch.mockResolvedValueOnce([mockModel]);

			const result = await repository.dequeue();

			expect(result).toBeDefined();
			expect(mockModel.destroyPermanently).toHaveBeenCalled();
		});
	});

	describe('peek', () => {
		it('returns null when no pending operations', async () => {
			queryBuilder.fetch.mockResolvedValueOnce([]);

			const result = await repository.peek();

			expect(result).toBeNull();
		});

		it('returns first pending operation without deleting', async () => {
			const mockModel = {
				id: 'op1',
				operation: 'create',
				tableName: 'work_entries',
				recordId: 'w1',
				data: '{"foo":"bar"}',
				status: 'pending',
				retryCount: 0,
				maxRetries: 5,
				createdAt: new Date('2023-01-01'),
				updatedAt: new Date('2023-01-01'),
			} as unknown as SyncOperationModel;

			queryBuilder.fetch.mockResolvedValueOnce([mockModel]);

			const result = await repository.peek();

			expect(result).toBeDefined();
			expect(result?.id).toBe('op1');
		});
	});

	describe('update', () => {
		it('updates existing sync operation', async () => {
			const op = new SyncOperation(
				'op1',
				'create',
				'work_entries',
				'w1',
				undefined,
				'syncing'
			);

			const mockModel = {
				update: jest.fn().mockImplementation((cb) => {
					cb({});
					return Promise.resolve();
				}),
			};

			collection.find.mockResolvedValue(
				mockModel as unknown as SyncOperationModel
			);

			await repository.update(op);

			expect(collection.find).toHaveBeenCalledWith('op1');
			expect(mockModel.update).toHaveBeenCalled();
		});

		it('throws error when operation not found', async () => {
			const op = new SyncOperation('op1', 'create', 'work_entries', 'w1');

			collection.find.mockResolvedValue(
				null as unknown as SyncOperationModel
			);

			await expect(repository.update(op)).rejects.toThrow(
				'Sync operation op1 not found'
			);
		});
	});

	describe('getAll', () => {
		it('returns all pending and syncing operations', async () => {
			const mockModels = [
				{
					id: 'op1',
					operation: 'create',
					tableName: 'work_entries',
					recordId: 'w1',
					status: 'pending',
					retryCount: 0,
					maxRetries: 5,
					createdAt: new Date('2023-01-01'),
					updatedAt: new Date('2023-01-01'),
				},
				{
					id: 'op2',
					operation: 'update',
					tableName: 'trackers',
					recordId: 't1',
					status: 'syncing',
					retryCount: 1,
					maxRetries: 5,
					createdAt: new Date('2023-01-01'),
					updatedAt: new Date('2023-01-01'),
				},
			] as unknown as SyncOperationModel[];

			queryBuilder.fetch.mockResolvedValueOnce(mockModels);

			const result = await repository.getAll();

			expect(result).toHaveLength(2);
		});
	});

	describe('clear', () => {
		it('removes all completed operations', async () => {
			const mockModels = [
				{
					id: 'op1',
					status: 'completed',
					destroyPermanently: jest.fn().mockResolvedValue(undefined),
				},
				{
					id: 'op2',
					status: 'completed',
					destroyPermanently: jest.fn().mockResolvedValue(undefined),
				},
			] as unknown as SyncOperationModel[];

			queryBuilder.fetch.mockResolvedValueOnce(mockModels);

			await repository.clear();

			expect(mockModels[0].destroyPermanently).toHaveBeenCalled();
			expect(mockModels[1].destroyPermanently).toHaveBeenCalled();
		});
	});
});
