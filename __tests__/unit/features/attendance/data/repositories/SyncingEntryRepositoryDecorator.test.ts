import { SyncingEntryRepositoryDecorator } from '@/features/attendance/data/repositories/SyncingEntryRepositoryDecorator';
import { WorkEntry } from '@/features/attendance/domain/entities/WorkEntry';
import { IEntryRepository } from '@/features/attendance/domain/ports/IEntryRepository';
import { SyncOperation } from '@/features/sync/domain/entities/SyncOperation';
import { ISyncQueueRepository } from '@/features/sync/domain/ports/ISyncQueueRepository';

describe('SyncingEntryRepositoryDecorator', () => {
	let inner: jest.Mocked<IEntryRepository>;
	let queue: jest.Mocked<ISyncQueueRepository>;
	let decorator: SyncingEntryRepositoryDecorator;

	beforeEach(() => {
		inner = {
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			getById: jest.fn(),
			getForTracker: jest.fn(),
			getForPeriod: jest.fn(),
		} as unknown as jest.Mocked<IEntryRepository>;
		queue = {
			enqueue: jest.fn(),
			dequeue: jest.fn(),
			peek: jest.fn(),
			update: jest.fn(),
			getAll: jest.fn(),
			clear: jest.fn(),
		} as unknown as jest.Mocked<ISyncQueueRepository>;
		decorator = new SyncingEntryRepositoryDecorator(inner, queue);
	});

	it('enqueues after create', async () => {
		const entry = new WorkEntry('e1', 'u1', 't1', '2023-02-01', 'present');
		inner.create.mockResolvedValue(entry);
		await decorator.create(entry);
		expect(queue.enqueue).toHaveBeenCalled();
		const op = queue.enqueue.mock.calls[0][0] as SyncOperation;
		expect(op.tableName).toBe('work_entries');
	});

	it('enqueues after update', async () => {
		const entry = new WorkEntry('e1', 'u1', 't1', '2023-02-01', 'present');
		inner.update.mockResolvedValue(entry);
		await decorator.update(entry);
		expect(queue.enqueue).toHaveBeenCalled();
	});

	it('enqueues after delete', async () => {
		inner.delete.mockResolvedValue(undefined);
		await decorator.delete('e1');
		expect(queue.enqueue).toHaveBeenCalled();
	});
});
