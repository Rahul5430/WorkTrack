import { SyncingTrackerRepositoryDecorator } from '@/features/attendance/data/repositories/SyncingTrackerRepositoryDecorator';
import { Tracker } from '@/features/attendance/domain/entities/Tracker';
import { ITrackerRepository } from '@/features/attendance/domain/ports/ITrackerRepository';
import { SyncOperation } from '@/features/sync/domain/entities/SyncOperation';
import { ISyncQueueRepository } from '@/features/sync/domain/ports/ISyncQueueRepository';

describe('SyncingTrackerRepositoryDecorator', () => {
	let inner: jest.Mocked<ITrackerRepository>;
	let queue: jest.Mocked<ISyncQueueRepository>;
	let decorator: SyncingTrackerRepositoryDecorator;

	beforeEach(() => {
		inner = {
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			getById: jest.fn(),
			getAllForUser: jest.fn(),
		} as unknown as jest.Mocked<ITrackerRepository>;
		queue = {
			enqueue: jest.fn(),
			dequeue: jest.fn(),
			peek: jest.fn(),
			update: jest.fn(),
			getAll: jest.fn(),
			clear: jest.fn(),
		} as unknown as jest.Mocked<ISyncQueueRepository>;
		decorator = new SyncingTrackerRepositoryDecorator(inner, queue);
	});

	it('enqueues after create', async () => {
		const tracker = new Tracker('t1', 'T', undefined, true);
		inner.create.mockResolvedValue(tracker);
		await decorator.create(tracker, 'user-1');
		expect(queue.enqueue).toHaveBeenCalled();
	});

	it('enqueues after update', async () => {
		const tracker = new Tracker('t1', 'T', undefined, true);
		inner.update.mockResolvedValue(tracker);
		await decorator.update(tracker);
		expect(queue.enqueue).toHaveBeenCalled();
	});

	it('enqueues after delete', async () => {
		inner.delete.mockResolvedValue(undefined);
		await decorator.delete('t1');
		expect(queue.enqueue).toHaveBeenCalled();
		const op = queue.enqueue.mock.calls[0][0] as SyncOperation;
		expect(op.operation).toBe('delete');
		expect(op.recordId).toBe('t1');
	});

	it('delegates getById to inner repository', async () => {
		const tracker = new Tracker('t1', 'Test Tracker');
		inner.getById.mockResolvedValue(tracker);

		const result = await decorator.getById('t1');

		expect(inner.getById).toHaveBeenCalledWith('t1');
		expect(result).toBe(tracker);
		expect(queue.enqueue).not.toHaveBeenCalled();
	});

	it('delegates getAllForUser to inner repository', async () => {
		const trackers = [new Tracker('t1', 'Test Tracker')];
		inner.getAllForUser.mockResolvedValue(trackers);

		const result = await decorator.getAllForUser('u1');

		expect(inner.getAllForUser).toHaveBeenCalledWith('u1');
		expect(result).toBe(trackers);
		expect(queue.enqueue).not.toHaveBeenCalled();
	});

	it('enqueues create operation with correct data', async () => {
		const tracker = new Tracker('t1', 'Test Tracker', 'Description', true);
		inner.create.mockResolvedValue(tracker);

		await decorator.create(tracker, 'user-1');

		const op = queue.enqueue.mock.calls[0][0] as SyncOperation;
		expect(op.operation).toBe('create');
		expect(op.tableName).toBe('trackers');
		expect(op.recordId).toBe('t1');
		expect(op.data).toEqual({
			ownerId: 'user-1',
			name: 'Test Tracker',
			description: 'Description',
			isActive: true,
		});
	});

	it('enqueues update operation with correct data', async () => {
		const tracker = new Tracker(
			't1',
			'Updated Tracker',
			'Updated Desc',
			false
		);
		inner.update.mockResolvedValue(tracker);

		await decorator.update(tracker);

		const op = queue.enqueue.mock.calls[0][0] as SyncOperation;
		expect(op.operation).toBe('update');
		expect(op.tableName).toBe('trackers');
		expect(op.recordId).toBe('t1');
		expect(op.data).toEqual({
			name: 'Updated Tracker',
			description: 'Updated Desc',
			isActive: false,
		});
	});

	it('enqueues update operation with undefined description', async () => {
		const tracker = new Tracker('t1', 'Test Tracker');
		inner.update.mockResolvedValue(tracker);

		await decorator.update(tracker);

		const op = queue.enqueue.mock.calls[0][0] as SyncOperation;
		expect(op.data).toEqual({
			name: 'Test Tracker',
			description: undefined,
			isActive: true,
		});
	});
});
