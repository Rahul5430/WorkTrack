import { SyncOperation } from '@/features/sync/domain/entities/SyncOperation';

describe('SyncOperation', () => {
	it('constructs with valid data', () => {
		const op = new SyncOperation('op1', 'create', 'work_entries', 'id1', {
			foo: 'bar',
		});
		expect(op.operation).toBe('create');
		expect(op.tableName).toBe('work_entries');
		expect(op.recordId).toBe('id1');
		expect(op.status).toBe('pending');
	});

	it('updates status', () => {
		const op = new SyncOperation('op1', 'update', 'trackers', 't1');
		const syncing = op.withStatus('syncing');
		expect(syncing.status).toBe('syncing');
		expect(syncing.updatedAt.getTime()).toBeGreaterThanOrEqual(
			op.updatedAt.getTime()
		);
	});

	it('increments retry', () => {
		const op = new SyncOperation('op1', 'update', 'trackers', 't1');
		const next = new Date(Date.now() + 1000);
		const retried = op.incrementRetry(next);
		expect(retried.retryCount).toBe(1);
		expect(retried.nextRetryAt).toEqual(next);
	});
});
