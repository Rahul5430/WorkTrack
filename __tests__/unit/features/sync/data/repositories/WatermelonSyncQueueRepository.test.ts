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

		it('creates a sync operation with nextRetryAt', async () => {
			const nextRetryAt = new Date('2023-12-31');
			const op = new SyncOperation(
				'op1',
				'create',
				'work_entries',
				'w1',
				{ foo: 'bar' },
				'pending',
				0,
				5,
				nextRetryAt
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
		it('updates existing sync operation with all fields', async () => {
			const op = new SyncOperation(
				'op1',
				'create',
				'work_entries',
				'w1',
				{ foo: 'bar' },
				'syncing',
				1,
				5,
				new Date('2023-01-01T00:00:00Z')
			);

			const nextRetryAt = new Date('2023-01-02T00:00:00Z');
			const opWithRetry = op
				.withStatus('syncing')
				.incrementRetry(nextRetryAt);

			const mockModel = {
				update: jest.fn().mockImplementation((cb) => {
					cb({});
					return Promise.resolve();
				}),
			};

			collection.find.mockResolvedValue(
				mockModel as unknown as SyncOperationModel
			);

			await repository.update(opWithRetry);

			expect(collection.find).toHaveBeenCalledWith('op1');
			expect(mockModel.update).toHaveBeenCalled();
		});

		it('updates operation without nextRetryAt', async () => {
			const op = new SyncOperation(
				'op1',
				'update',
				'trackers',
				't1',
				undefined,
				'completed'
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
		it('returns all pending and syncing operations with default limit', async () => {
			const mockModels = [
				{
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
					nextRetryAt: new Date(Date.now() - 1000), // Past date
				},
				{
					id: 'op2',
					operation: 'update',
					tableName: 'trackers',
					recordId: 't1',
					data: undefined,
					status: 'syncing',
					retryCount: 1,
					maxRetries: 5,
					createdAt: new Date('2023-01-01'),
					updatedAt: new Date('2023-01-01'),
					nextRetryAt: new Date(Date.now() - 2000), // Past date
				},
			] as unknown as SyncOperationModel[];

			queryBuilder.fetch.mockResolvedValueOnce(mockModels);

			const result = await repository.getAll();

			expect(collection.query).toHaveBeenCalled();
			expect(result).toHaveLength(2);
			expect(result[0]).toBeInstanceOf(SyncOperation);
			expect(result[1]).toBeInstanceOf(SyncOperation);
		});

		it('returns operations with custom limit', async () => {
			const mockModels = [
				{
					id: 'op1',
					operation: 'create',
					tableName: 'work_entries',
					recordId: 'w1',
					data: '{}',
					status: 'pending',
					retryCount: 0,
					maxRetries: 5,
					createdAt: new Date(),
					updatedAt: new Date(),
					nextRetryAt: new Date(Date.now() - 1000),
				},
				{
					id: 'op2',
					operation: 'update',
					tableName: 'trackers',
					recordId: 't1',
					data: '{}',
					status: 'syncing',
					retryCount: 1,
					maxRetries: 5,
					createdAt: new Date(),
					updatedAt: new Date(),
					nextRetryAt: new Date(Date.now() - 2000),
				},
				{
					id: 'op3',
					operation: 'delete',
					tableName: 'work_entries',
					recordId: 'w2',
					data: undefined,
					status: 'pending',
					retryCount: 0,
					maxRetries: 5,
					createdAt: new Date(),
					updatedAt: new Date(),
					nextRetryAt: new Date(Date.now() - 3000),
				},
			] as unknown as SyncOperationModel[];

			queryBuilder.fetch.mockResolvedValueOnce(mockModels);

			const result = await repository.getAll(2);

			expect(result).toHaveLength(2); // Limited to 2
		});

		it('returns empty array when no operations match', async () => {
			queryBuilder.fetch.mockResolvedValueOnce([]);

			const result = await repository.getAll();

			expect(result).toEqual([]);
		});

		it('handles operations without nextRetryAt', async () => {
			const mockModels = [
				{
					id: 'op1',
					operation: 'create',
					tableName: 'work_entries',
					recordId: 'w1',
					data: '{}',
					status: 'pending',
					retryCount: 0,
					maxRetries: 5,
					createdAt: new Date(),
					updatedAt: new Date(),
					nextRetryAt: undefined,
				},
			] as unknown as SyncOperationModel[];

			queryBuilder.fetch.mockResolvedValueOnce(mockModels);

			const result = await repository.getAll();

			expect(result).toHaveLength(1);
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
