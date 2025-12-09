import { SyncOperation } from '@/features/sync/domain/entities/SyncOperation';
import { ISyncQueueRepository } from '@/features/sync/domain/ports/ISyncQueueRepository';
import { ISyncRepository } from '@/features/sync/domain/ports/ISyncRepository';
import { ProcessSyncQueueUseCase } from '@/features/sync/domain/use-cases/ProcessSyncQueueUseCase';
import { INetworkMonitor } from '@/shared/data/network';

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
		const net: jest.Mocked<INetworkMonitor> = {
			isOnline: jest.fn().mockResolvedValue(true),
			listen: jest.fn(),
		};
		const uc = new ProcessSyncQueueUseCase(queue, sync, net);
		await uc.execute();
		expect(sync.syncToRemote).not.toHaveBeenCalled();
		expect(queue.update).not.toHaveBeenCalled();
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

	it('handles operations with undefined data using empty object', async () => {
		const op1 = new SyncOperation(
			'1',
			'delete',
			'work_entries',
			'w1',
			undefined
		);
		const ops = [op1];
		const queue: jest.Mocked<ISyncQueueRepository> = {
			enqueue: jest.fn(),
			dequeue: jest.fn(),
			peek: jest.fn(),
			update: jest.fn(),
			getAll: jest.fn().mockResolvedValue(ops),
			clear: jest.fn(),
		};
		const sync: jest.Mocked<ISyncRepository> = {
			syncToRemote: jest
				.fn()
				.mockResolvedValue([{ opId: '1', success: true }]),
			syncFromRemote: jest.fn(),
		};
		const net: jest.Mocked<INetworkMonitor> = {
			isOnline: jest.fn().mockResolvedValue(true),
			listen: jest.fn(),
		};
		const uc = new ProcessSyncQueueUseCase(queue, sync, net);

		await uc.execute();

		// Should use empty object for undefined data (line 49: op.data ?? {})
		expect(sync.syncToRemote).toHaveBeenCalledWith([
			{
				id: '1',
				payload: {
					tableName: 'work_entries',
					recordId: 'w1',
					operation: 'delete',
					data: {},
				},
			},
		]);
	});

	it('skips operations not found in outcomes', async () => {
		const op1 = new SyncOperation('1', 'create', 'work_entries', 'w1', {});
		const ops = [op1];
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
				{ opId: '2', success: true }, // Different opId - not found
			]),
			syncFromRemote: jest.fn(),
		};
		const net: jest.Mocked<INetworkMonitor> = {
			isOnline: jest.fn().mockResolvedValue(true),
			listen: jest.fn(),
		};
		const uc = new ProcessSyncQueueUseCase(queue, sync, net);

		await uc.execute();

		// Should mark operations as syncing (line 36-39)
		expect(queue.update).toHaveBeenCalledWith(
			expect.objectContaining({ id: '1', status: 'syncing' })
		);
		// Should not update op1 since it's not in outcomes (line 58: if (!op) return;)
		// Only the initial "syncing" update should be called
		const completedCalls = (queue.update as jest.Mock).mock.calls.filter(
			(c) => c[0].id === '1' && c[0].status === 'completed'
		);
		expect(completedCalls).toHaveLength(0);
	});

	it('handles multiple successful operations', async () => {
		const op1 = new SyncOperation('1', 'create', 'work_entries', 'w1', {});
		const op2 = new SyncOperation('2', 'update', 'trackers', 't1', {});
		const op3 = new SyncOperation('3', 'delete', 'work_entries', 'w2', {});
		const ops = [op1, op2, op3];
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
				{ opId: '2', success: true },
				{ opId: '3', success: true },
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

		await uc.execute();

		// All should be marked as completed
		expect(queue.update).toHaveBeenCalledWith(
			expect.objectContaining({ id: '1', status: 'completed' })
		);
		expect(queue.update).toHaveBeenCalledWith(
			expect.objectContaining({ id: '2', status: 'completed' })
		);
		expect(queue.update).toHaveBeenCalledWith(
			expect.objectContaining({ id: '3', status: 'completed' })
		);

		expect(events).toHaveLength(3);
		expect(events).toEqual([
			{ id: '1', success: true },
			{ id: '2', success: true },
			{ id: '3', success: true },
		]);
	});

	it('computes backoff with exponential delay capped at 24h', async () => {
		const op1 = new SyncOperation(
			'1',
			'create',
			'work_entries',
			'w1',
			{},
			'pending',
			5
		); // retryCount = 5
		const ops = [op1];
		const queue: jest.Mocked<ISyncQueueRepository> = {
			enqueue: jest.fn(),
			dequeue: jest.fn(),
			peek: jest.fn(),
			update: jest.fn(),
			getAll: jest.fn().mockResolvedValue(ops),
			clear: jest.fn(),
		};
		const sync: jest.Mocked<ISyncRepository> = {
			syncToRemote: jest
				.fn()
				.mockResolvedValue([{ opId: '1', success: false }]),
			syncFromRemote: jest.fn(),
		};
		const net: jest.Mocked<INetworkMonitor> = {
			isOnline: jest.fn().mockResolvedValue(true),
			listen: jest.fn(),
		};
		const uc = new ProcessSyncQueueUseCase(queue, sync, net);

		await uc.execute();

		// Find the retry call
		const retryCalls = (queue.update as jest.Mock).mock.calls.filter(
			(c) =>
				c[0].id === '1' &&
				c[0].status === 'pending' &&
				c[0].retryCount === 6
		);
		expect(retryCalls.length).toBeGreaterThan(0);
		const retriedOp = retryCalls[0][0] as SyncOperation;
		const nextRetryTime = retriedOp.nextRetryAt as Date;
		const delay = nextRetryTime.getTime() - Date.now();
		const cap = 24 * 60 * 60 * 1000; // 24h
		expect(delay).toBeLessThanOrEqual(cap);
		// Should be exponential: base * 2^(attempt-1) = 5000 * 2^(6-1) = 5000 * 32 = 160000ms
		// But capped at 24h = 86400000ms, so should be 160000ms
		expect(delay).toBeGreaterThan(100000); // At least 100s for attempt 6
	});

	it('handles backoff calculation with attempt 0 (Math.max ensures 1)', async () => {
		const op1 = new SyncOperation(
			'1',
			'create',
			'work_entries',
			'w1',
			{},
			'pending',
			0
		);
		const ops = [op1];
		const queue: jest.Mocked<ISyncQueueRepository> = {
			enqueue: jest.fn(),
			dequeue: jest.fn(),
			peek: jest.fn(),
			update: jest.fn(),
			getAll: jest.fn().mockResolvedValue(ops),
			clear: jest.fn(),
		};
		const sync: jest.Mocked<ISyncRepository> = {
			syncToRemote: jest
				.fn()
				.mockResolvedValue([{ opId: '1', success: false }]),
			syncFromRemote: jest.fn(),
		};
		const net: jest.Mocked<INetworkMonitor> = {
			isOnline: jest.fn().mockResolvedValue(true),
			listen: jest.fn(),
		};
		const uc = new ProcessSyncQueueUseCase(queue, sync, net);

		const before = Date.now();
		await uc.execute();

		// retryCount is 0, so attempt = 0 + 1 = 1
		// Math.max(1, 1) = 1
		// delay = 5000 * 2^(1-1) = 5000 * 1 = 5000ms
		const retryCalls = (queue.update as jest.Mock).mock.calls.filter(
			(c) => c[0].id === '1' && c[0].status === 'pending'
		);
		expect(retryCalls.length).toBeGreaterThan(0);
		const retriedOp = retryCalls[retryCalls.length - 1][0] as SyncOperation;
		const nextRetryTime = retriedOp.nextRetryAt as Date;
		const delay = nextRetryTime.getTime() - before;
		expect(delay).toBeGreaterThanOrEqual(5000);
		expect(delay).toBeLessThan(10000); // Should be around 5s, not much more
	});
});
