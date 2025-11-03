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

	it('constructs with all operation types', () => {
		const createOp = new SyncOperation(
			'op1',
			'create',
			'work_entries',
			'e1'
		);
		const updateOp = new SyncOperation('op2', 'update', 'trackers', 't1');
		const deleteOp = new SyncOperation(
			'op3',
			'delete',
			'work_entries',
			'e2'
		);

		expect(createOp.operation).toBe('create');
		expect(updateOp.operation).toBe('update');
		expect(deleteOp.operation).toBe('delete');
	});

	it('constructs with optional data', () => {
		const op1 = new SyncOperation('op1', 'create', 'work_entries', 'e1');
		expect(op1.data).toBeUndefined();

		const data = { status: 'office', notes: 'Test' };
		const op2 = new SyncOperation(
			'op2',
			'update',
			'work_entries',
			'e1',
			data
		);
		expect(op2.data).toEqual(data);
	});

	it('defaults to pending status', () => {
		const op = new SyncOperation('op1', 'create', 'work_entries', 'e1');
		expect(op.status).toBe('pending');
	});

	it('constructs with different statuses', () => {
		const pending = new SyncOperation(
			'op1',
			'create',
			'work_entries',
			'e1',
			undefined,
			'pending'
		);
		const syncing = new SyncOperation(
			'op2',
			'update',
			'trackers',
			't1',
			undefined,
			'syncing'
		);
		const completed = new SyncOperation(
			'op3',
			'delete',
			'work_entries',
			'e2',
			undefined,
			'completed'
		);
		const failed = new SyncOperation(
			'op4',
			'create',
			'work_entries',
			'e3',
			undefined,
			'failed'
		);

		expect(pending.status).toBe('pending');
		expect(syncing.status).toBe('syncing');
		expect(completed.status).toBe('completed');
		expect(failed.status).toBe('failed');
	});

	it('defaults retryCount to 0', () => {
		const op = new SyncOperation('op1', 'create', 'work_entries', 'e1');
		expect(op.retryCount).toBe(0);
	});

	it('constructs with custom retryCount', () => {
		const op = new SyncOperation(
			'op1',
			'create',
			'work_entries',
			'e1',
			undefined,
			'pending',
			3
		);
		expect(op.retryCount).toBe(3);
	});

	it('defaults maxRetries to 5', () => {
		const op = new SyncOperation('op1', 'create', 'work_entries', 'e1');
		expect(op.maxRetries).toBe(5);
	});

	it('constructs with custom maxRetries', () => {
		const op = new SyncOperation(
			'op1',
			'create',
			'work_entries',
			'e1',
			undefined,
			'pending',
			0,
			10
		);
		expect(op.maxRetries).toBe(10);
	});

	it('can have nextRetryAt', () => {
		const nextRetry = new Date(Date.now() + 5000);
		const op = new SyncOperation(
			'op1',
			'create',
			'work_entries',
			'e1',
			undefined,
			'pending',
			0,
			5,
			nextRetry
		);
		expect(op.nextRetryAt).toEqual(nextRetry);
	});

	it('withStatus preserves all properties', () => {
		const op = new SyncOperation('op1', 'update', 'trackers', 't1', {
			name: 'Test',
		});
		const updated = op.withStatus('syncing');

		expect(updated.id).toBe(op.id);
		expect(updated.operation).toBe(op.operation);
		expect(updated.tableName).toBe(op.tableName);
		expect(updated.recordId).toBe(op.recordId);
		expect(updated.data).toEqual(op.data);
		expect(updated.status).toBe('syncing');
		expect(updated.retryCount).toBe(op.retryCount);
		expect(updated.maxRetries).toBe(op.maxRetries);
	});

	it('withStatus can set nextRetryAt', () => {
		const op = new SyncOperation('op1', 'update', 'trackers', 't1');
		const nextRetry = new Date(Date.now() + 5000);
		const updated = op.withStatus('failed', nextRetry);

		expect(updated.status).toBe('failed');
		expect(updated.nextRetryAt).toEqual(nextRetry);
	});

	it('withStatus updates timestamp', () => {
		const op = new SyncOperation('op1', 'create', 'trackers', 't1');
		const originalUpdatedAt = op.updatedAt.getTime();
		const beforeUpdate = Date.now();
		const updated = op.withStatus('failed');

		// updatedAt should be updated (could be equal or greater due to timing)
		expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
			beforeUpdate
		);
		// If it's not greater, it should at least be equal (updatedAt is set to now)
		if (updated.updatedAt.getTime() <= originalUpdatedAt) {
			expect(updated.updatedAt.getTime()).toBe(originalUpdatedAt);
		} else {
			expect(updated.updatedAt.getTime()).toBeGreaterThan(
				originalUpdatedAt
			);
		}
	});

	it('withStatus preserves properties', () => {
		const op = new SyncOperation('op1', 'update', 'trackers', 't1');
		const originalUpdatedAt = op.updatedAt.getTime();
		const beforeUpdate = Date.now();
		const updated = op.withStatus('syncing');

		expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
			beforeUpdate
		);
		// If it's not greater, it should at least be equal (updatedAt is set to now)
		if (updated.updatedAt.getTime() <= originalUpdatedAt) {
			expect(updated.updatedAt.getTime()).toBe(originalUpdatedAt);
		} else {
			expect(updated.updatedAt.getTime()).toBeGreaterThan(
				originalUpdatedAt
			);
		}
	});

	it('incrementRetry sets status to pending', () => {
		const op = new SyncOperation(
			'op1',
			'update',
			'trackers',
			't1',
			undefined,
			'failed'
		);
		const retried = op.incrementRetry(new Date());

		expect(retried.status).toBe('pending');
	});

	it('incrementRetry preserves all properties except status and retry', () => {
		const op = new SyncOperation(
			'op1',
			'update',
			'trackers',
			't1',
			{ name: 'Test' },
			'failed',
			2,
			10
		);
		const nextRetry = new Date(Date.now() + 5000);
		const retried = op.incrementRetry(nextRetry);

		expect(retried.id).toBe(op.id);
		expect(retried.operation).toBe(op.operation);
		expect(retried.tableName).toBe(op.tableName);
		expect(retried.recordId).toBe(op.recordId);
		expect(retried.data).toEqual(op.data);
		expect(retried.maxRetries).toBe(op.maxRetries);
		expect(retried.retryCount).toBe(3);
		expect(retried.nextRetryAt).toEqual(nextRetry);
	});

	it('incrementRetry updates timestamp', () => {
		const op = new SyncOperation('op1', 'update', 'trackers', 't1');
		const originalUpdatedAt = op.updatedAt.getTime();
		const beforeIncrement = Date.now();
		const retried = op.incrementRetry(new Date());

		// updatedAt should be updated (could be equal or greater due to timing)
		expect(retried.updatedAt.getTime()).toBeGreaterThanOrEqual(
			beforeIncrement
		);
		// If it's not greater, it should at least be equal (updatedAt is set to now)
		if (retried.updatedAt.getTime() <= originalUpdatedAt) {
			expect(retried.updatedAt.getTime()).toBe(originalUpdatedAt);
		} else {
			expect(retried.updatedAt.getTime()).toBeGreaterThan(
				originalUpdatedAt
			);
		}
	});

	it('validates tableName is required', () => {
		expect(() => {
			// eslint-disable-next-line no-new
			new SyncOperation('op1', 'create', '', 'e1');
		}).toThrow('tableName is required');
	});

	it('validates recordId is required', () => {
		expect(() => {
			// eslint-disable-next-line no-new
			new SyncOperation('op1', 'create', 'work_entries', '');
		}).toThrow('recordId is required');
	});

	it('validates operation type', () => {
		expect(() => {
			// @ts-expect-error invalid operation
			// eslint-disable-next-line no-new
			new SyncOperation('op1', 'invalid', 'work_entries', 'e1');
		}).toThrow('Invalid sync operation');
	});

	it('validates status type', () => {
		expect(() => {
			// eslint-disable-next-line no-new
			new SyncOperation(
				'op1',
				'create',
				'work_entries',
				'e1',
				undefined,
				'invalid' as 'pending' | 'syncing' | 'completed' | 'failed'
			);
		}).toThrow('Invalid sync status');
	});

	it('preserves createdAt when updating', () => {
		const op = new SyncOperation('op1', 'update', 'trackers', 't1');
		const withStatus = op.withStatus('syncing');
		const retried = op.incrementRetry(new Date());

		expect(withStatus.createdAt).toEqual(op.createdAt);
		expect(retried.createdAt).toEqual(op.createdAt);
	});
});
