import { SyncOperation } from '@/features/sync/domain/entities/SyncOperation';
import { INetworkMonitor } from '@/features/sync/domain/ports/INetworkMonitor';
import { ISyncQueueRepository } from '@/features/sync/domain/ports/ISyncQueueRepository';
import { ISyncRepository } from '@/features/sync/domain/ports/ISyncRepository';
import { ProcessSyncQueueUseCase } from '@/features/sync/domain/use-cases/ProcessSyncQueueUseCase';

describe('ProcessSyncQueueUseCase', () => {
	it('skips when offline', async () => {
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
		const net: jest.Mocked<INetworkMonitor> = {
			isOnline: jest.fn().mockResolvedValue(false),
			listen: jest.fn(),
		};
		const uc = new ProcessSyncQueueUseCase(queue, sync, net);
		await uc.execute();
		expect(sync.syncToRemote).not.toHaveBeenCalled();
	});

	it('handles per-operation outcomes and emits itemProcessed', async () => {
		const op1 = new SyncOperation('1', 'create', 'work_entries', 'w1', {
			a: 1,
		});
		const op2 = new SyncOperation('2', 'update', 'trackers', 't1', {
			b: 2,
		});
		const ops = [op1, op2];
		const queue: jest.Mocked<ISyncQueueRepository> = {
			enqueue: jest.fn(),
			dequeue: jest.fn(),
			peek: jest.fn(),
			update: jest.fn(),
			getAll: jest.fn().mockResolvedValue(ops),
			clear: jest.fn(),
		};
		const sync: jest.Mocked<ISyncRepository> = {
			syncToRemote: jest.fn().mockResolvedValue([
				{ opId: '1', success: true },
				{ opId: '2', success: false, code: 'ERR', message: 'failed' },
			]),
			syncFromRemote: jest.fn(),
		};
		const net: jest.Mocked<INetworkMonitor> = {
			isOnline: jest.fn().mockResolvedValue(true),
			listen: jest.fn(),
		};
		const uc = new ProcessSyncQueueUseCase(queue, sync, net);

		const events: Array<{ id: string; success: boolean }> = [];
		uc.onItemProcessed((e) => events.push(e));

		const before = Date.now();
		await uc.execute();

		// Called with transformed input
		expect(sync.syncToRemote).toHaveBeenCalledWith([
			{
				id: '1',
				payload: {
					tableName: 'work_entries',
					recordId: 'w1',
					operation: 'create',
					data: { a: 1 },
				},
			},
			{
				id: '2',
				payload: {
					tableName: 'trackers',
					recordId: 't1',
					operation: 'update',
					data: { b: 2 },
				},
			},
		]);

		// Completed op marked done
		expect(queue.update).toHaveBeenCalledWith(
			expect.objectContaining({ id: '1', status: 'completed' })
		);

		// Failed op scheduled with backoff in the future
		const matchingCalls = (queue.update as jest.Mock).mock.calls.filter(
			(c) => c[0].id === '2'
		);
		const retriedCall = matchingCalls[matchingCalls.length - 1];
		expect(retriedCall).toBeTruthy();
		const retriedOp = retriedCall![0] as SyncOperation;
		expect(retriedOp.status).toBe('pending');
		expect(retriedOp.retryCount).toBe(1);
		expect(retriedOp.nextRetryAt).toBeInstanceOf(Date);
		expect(
			(retriedOp.nextRetryAt as Date).getTime()
		).toBeGreaterThanOrEqual(before + 5000);

		// Per-item events emitted
		expect(events).toEqual([
			{ id: '1', success: true },
			{ id: '2', success: false },
		]);
	});
});
