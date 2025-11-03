import { SyncOperation } from '@/features/sync/domain/entities/SyncOperation';
import { ISyncQueueRepository } from '@/features/sync/domain/ports/ISyncQueueRepository';
import { ISyncRepository } from '@/features/sync/domain/ports/ISyncRepository';
import { SyncToRemoteUseCase } from '@/features/sync/domain/use-cases/SyncToRemoteUseCase';

describe('SyncToRemoteUseCase', () => {
	it('syncs and clears queue', async () => {
		const ops = [new SyncOperation('1', 'create', 'work_entries', 'w1')];
		const queue: jest.Mocked<ISyncQueueRepository> = {
			enqueue: jest.fn(),
			dequeue: jest.fn(),
			peek: jest.fn(),
			update: jest.fn(),
			getAll: jest.fn().mockResolvedValue(ops),
			clear: jest.fn(),
		};
		const sync: jest.Mocked<ISyncRepository> = {
			syncToRemote: jest.fn(),
			syncFromRemote: jest.fn(),
		};
		const uc = new SyncToRemoteUseCase(queue, sync);
		await uc.execute();
		expect(sync.syncToRemote).toHaveBeenCalledWith([
			{
				id: '1',
				payload: {
					tableName: 'work_entries',
					recordId: 'w1',
					operation: 'create',
					data: undefined,
				},
			},
		]);
		expect(queue.clear).toHaveBeenCalled();
	});

	it('returns early when queue is empty', async () => {
		const queue: jest.Mocked<ISyncQueueRepository> = {
			enqueue: jest.fn(),
			dequeue: jest.fn(),
			peek: jest.fn(),
			update: jest.fn(),
			getAll: jest.fn().mockResolvedValue([]),
			clear: jest.fn(),
		};
		const sync: jest.Mocked<ISyncRepository> = {
			syncToRemote: jest.fn(),
			syncFromRemote: jest.fn(),
		};
		const uc = new SyncToRemoteUseCase(queue, sync);
		await uc.execute();
		expect(sync.syncToRemote).not.toHaveBeenCalled();
		expect(queue.clear).not.toHaveBeenCalled();
	});

	it('syncs multiple operations', async () => {
		const ops = [
			new SyncOperation('1', 'create', 'work_entries', 'w1', {
				status: 'office',
			}),
			new SyncOperation('2', 'update', 'trackers', 't1', {
				name: 'Test',
			}),
			new SyncOperation('3', 'delete', 'work_entries', 'w2'),
		];
		const queue: jest.Mocked<ISyncQueueRepository> = {
			enqueue: jest.fn(),
			dequeue: jest.fn(),
			peek: jest.fn(),
			update: jest.fn(),
			getAll: jest.fn().mockResolvedValue(ops),
			clear: jest.fn(),
		};
		const sync: jest.Mocked<ISyncRepository> = {
			syncToRemote: jest.fn(),
			syncFromRemote: jest.fn(),
		};
		const uc = new SyncToRemoteUseCase(queue, sync);
		await uc.execute();
		expect(sync.syncToRemote).toHaveBeenCalledWith([
			{
				id: '1',
				payload: {
					tableName: 'work_entries',
					recordId: 'w1',
					operation: 'create',
					data: { status: 'office' },
				},
			},
			{
				id: '2',
				payload: {
					tableName: 'trackers',
					recordId: 't1',
					operation: 'update',
					data: { name: 'Test' },
				},
			},
			{
				id: '3',
				payload: {
					tableName: 'work_entries',
					recordId: 'w2',
					operation: 'delete',
					data: undefined,
				},
			},
		]);
		expect(queue.clear).toHaveBeenCalled();
	});
});
