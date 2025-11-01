import { SyncingTrackerRepositoryDecorator } from '@/features/attendance/data/repositories/SyncingTrackerRepositoryDecorator';
import { Tracker } from '@/features/attendance/domain/entities/Tracker';
import { ITrackerRepository } from '@/features/attendance/domain/ports/ITrackerRepository';
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
		await decorator.create(tracker);
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
	});
});
