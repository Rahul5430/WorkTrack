import { SyncingEntryRepositoryDecorator } from '@/features/attendance/data/repositories/SyncingEntryRepositoryDecorator';
import { DateRange } from '@/features/attendance/domain/entities/DateRange';
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
		const entry = new WorkEntry('e1', 'u1', 't1', '2023-02-01', 'office');
		inner.create.mockResolvedValue(entry);
		await decorator.create(entry);
		expect(queue.enqueue).toHaveBeenCalled();
		const op = queue.enqueue.mock.calls[0][0] as SyncOperation;
		expect(op.tableName).toBe('work_entries');
	});

	it('enqueues after update', async () => {
		const entry = new WorkEntry('e1', 'u1', 't1', '2023-02-01', 'office');
		inner.update.mockResolvedValue(entry);
		await decorator.update(entry);
		expect(queue.enqueue).toHaveBeenCalled();
	});

	it('enqueues after delete', async () => {
		inner.delete.mockResolvedValue(undefined);
		await decorator.delete('e1');
		expect(queue.enqueue).toHaveBeenCalled();
		const op = queue.enqueue.mock.calls[0][0] as SyncOperation;
		expect(op.operation).toBe('delete');
		expect(op.tableName).toBe('work_entries');
		expect(op.recordId).toBe('e1');
	});

	it('delegates getById to inner repository', async () => {
		const entry = new WorkEntry('e1', 'u1', 't1', '2023-02-01', 'office');
		inner.getById.mockResolvedValue(entry);

		const result = await decorator.getById('e1');

		expect(inner.getById).toHaveBeenCalledWith('e1');
		expect(result).toBe(entry);
		expect(queue.enqueue).not.toHaveBeenCalled();
	});

	it('delegates getForTracker to inner repository', async () => {
		const entries = [
			new WorkEntry('e1', 'u1', 't1', '2023-02-01', 'office'),
		];
		inner.getForTracker.mockResolvedValue(entries);

		const result = await decorator.getForTracker('t1');

		expect(inner.getForTracker).toHaveBeenCalledWith('t1');
		expect(result).toBe(entries);
		expect(queue.enqueue).not.toHaveBeenCalled();
	});

	it('delegates getForPeriod to inner repository', async () => {
		const entries = [
			new WorkEntry('e1', 'u1', 't1', '2023-02-01', 'office'),
		];
		const range = new DateRange(
			new Date('2023-02-01'),
			new Date('2023-02-28')
		);
		inner.getForPeriod.mockResolvedValue(entries);

		const result = await decorator.getForPeriod('u1', range);

		expect(inner.getForPeriod).toHaveBeenCalledWith('u1', range, undefined);
		expect(result).toBe(entries);
		expect(queue.enqueue).not.toHaveBeenCalled();
	});

	it('delegates getForPeriod with trackerId to inner repository', async () => {
		const entries = [
			new WorkEntry('e1', 'u1', 't1', '2023-02-01', 'office'),
		];
		const range = new DateRange(
			new Date('2023-02-01'),
			new Date('2023-02-28')
		);
		inner.getForPeriod.mockResolvedValue(entries);

		const result = await decorator.getForPeriod('u1', range, 't1');

		expect(inner.getForPeriod).toHaveBeenCalledWith('u1', range, 't1');
		expect(result).toBe(entries);
		expect(queue.enqueue).not.toHaveBeenCalled();
	});

	it('enqueues create operation with correct data', async () => {
		const entry = new WorkEntry('e1', 'u1', 't1', '2023-02-01', 'office');
		inner.create.mockResolvedValue(entry);

		await decorator.create(entry);

		const op = queue.enqueue.mock.calls[0][0] as SyncOperation;
		expect(op.operation).toBe('create');
		expect(op.tableName).toBe('work_entries');
		expect(op.recordId).toBe('e1');
		expect(op.data).toEqual({
			userId: 'u1',
			trackerId: 't1',
			date: '2023-02-01',
			status: 'office',
		});
	});

	it('enqueues update operation with correct data', async () => {
		const entry = new WorkEntry(
			'e1',
			'u1',
			't1',
			'2023-02-01',
			'office',
			'Notes'
		);
		inner.update.mockResolvedValue(entry);

		await decorator.update(entry);

		const op = queue.enqueue.mock.calls[0][0] as SyncOperation;
		expect(op.operation).toBe('update');
		expect(op.tableName).toBe('work_entries');
		expect(op.recordId).toBe('e1');
		expect(op.data).toEqual({
			status: 'office',
			notes: 'Notes',
		});
	});

	it('enqueues update operation with undefined notes', async () => {
		const entry = new WorkEntry('e1', 'u1', 't1', '2023-02-01', 'office');
		inner.update.mockResolvedValue(entry);

		await decorator.update(entry);

		const op = queue.enqueue.mock.calls[0][0] as SyncOperation;
		expect(op.data).toEqual({
			status: 'office',
			notes: undefined,
		});
	});
});
