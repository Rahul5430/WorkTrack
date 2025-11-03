import { InMemorySyncQueueRepository } from '@/features/sync/data/repositories/InMemorySyncQueueRepository';
import { SyncOperation } from '@/features/sync/domain/entities/SyncOperation';

describe('InMemorySyncQueueRepository', () => {
	let repo: InMemorySyncQueueRepository;

	beforeEach(() => {
		repo = new InMemorySyncQueueRepository();
	});

	it('enqueues and peeks pending operation', async () => {
		const op = new SyncOperation('1', 'create', 'work_entries', 'w1');
		await repo.enqueue(op);
		const peek = await repo.peek();
		expect(peek?.id).toBe('1');
	});

	it('dequeues pending operation', async () => {
		const op = new SyncOperation('1', 'create', 'work_entries', 'w1');
		await repo.enqueue(op);
		const dequeued = await repo.dequeue();
		expect(dequeued?.id).toBe('1');
		const next = await repo.peek();
		expect(next).toBeNull();
	});

	it('dequeue returns null when no pending operations', async () => {
		const dequeued = await repo.dequeue();
		expect(dequeued).toBeNull();
	});

	it('dequeue handles empty array correctly', async () => {
		// Add a completed operation, should not be dequeued
		await repo.enqueue(
			new SyncOperation(
				'1',
				'create',
				'work_entries',
				'w1',
				undefined,
				'completed'
			)
		);
		const dequeued = await repo.dequeue();
		expect(dequeued).toBeNull();
	});

	it('updates operation status', async () => {
		const op = new SyncOperation('1', 'create', 'work_entries', 'w1');
		await repo.enqueue(op);
		const syncing = op.withStatus('syncing');
		await repo.update(syncing);
		const all = await repo.getAll();
		expect(all[0].status).toBe('syncing');
	});

	it('update does nothing when operation not found', async () => {
		const op = new SyncOperation('1', 'create', 'work_entries', 'w1');
		await repo.enqueue(op);
		const notFound = new SyncOperation('2', 'update', 'work_entries', 'w2');
		await repo.update(notFound);
		const all = await repo.getAll();
		expect(all).toHaveLength(1);
		expect(all[0].id).toBe('1');
	});

	it('getAll returns pending and syncing only', async () => {
		await repo.enqueue(
			new SyncOperation(
				'1',
				'create',
				'work_entries',
				'w1',
				undefined,
				'completed'
			)
		);
		await repo.enqueue(
			new SyncOperation('2', 'create', 'work_entries', 'w2')
		);
		const all = await repo.getAll();
		expect(all.map((o) => o.id)).toEqual(['2']);
	});

	it('clear removes completed ops', async () => {
		await repo.enqueue(
			new SyncOperation(
				'1',
				'create',
				'work_entries',
				'w1',
				undefined,
				'completed'
			)
		);
		await repo.enqueue(
			new SyncOperation('2', 'create', 'work_entries', 'w2')
		);
		await repo.clear();
		const all = await repo.getAll();
		expect(all.find((o) => o.id === '1')).toBeUndefined();
	});
});
