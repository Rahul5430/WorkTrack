import { SyncOperation } from '@/features/sync/domain/entities/SyncOperation';
import { SyncQueue } from '@/features/sync/domain/entities/SyncQueue';

describe('SyncQueue', () => {
	describe('constructor', () => {
		it('creates empty queue by default', () => {
			const queue = new SyncQueue();

			expect(queue.isEmpty()).toBe(true);
			expect(queue.operations).toEqual([]);
		});

		it('creates queue with initial operations', () => {
			const op1 = new SyncOperation('1', 'create', 'work_entries', 'w1');
			const op2 = new SyncOperation('2', 'update', 'trackers', 't1');
			const queue = new SyncQueue([op1, op2]);

			expect(queue.isEmpty()).toBe(false);
			expect(queue.operations).toHaveLength(2);
			expect(queue.operations[0]).toBe(op1);
			expect(queue.operations[1]).toBe(op2);
		});

		it('creates copy of operations array', () => {
			const operations = [
				new SyncOperation('1', 'create', 'work_entries', 'w1'),
			];
			const queue = new SyncQueue(operations);

			operations.push(new SyncOperation('2', 'update', 'trackers', 't1'));

			expect(queue.operations).toHaveLength(1);
		});
	});

	describe('operations', () => {
		it('returns readonly array of operations', () => {
			const op1 = new SyncOperation('1', 'create', 'work_entries', 'w1');
			const queue = new SyncQueue([op1]);

			const operations = queue.operations;

			expect(operations).toHaveLength(1);
			expect(operations[0]).toBe(op1);
		});

		it('returns immutable operations array', () => {
			const op = new SyncOperation('1', 'create', 'work_entries', 'w1');
			const queue = new SyncQueue([op]);

			const operations = queue.operations;

			// Readonly array should not allow direct mutation
			// Note: TypeScript readonly arrays don't throw at runtime,
			// but they prevent mutation at compile time
			expect(operations).toHaveLength(1);
			expect(operations[0]).toBe(op);
		});
	});

	describe('enqueue', () => {
		it('adds operation to queue', () => {
			const queue = new SyncQueue();
			const op = new SyncOperation('1', 'create', 'work_entries', 'w1');

			const newQueue = queue.enqueue(op);

			expect(newQueue.isEmpty()).toBe(false);
			expect(newQueue.operations).toHaveLength(1);
			expect(newQueue.operations[0]).toBe(op);
		});

		it('creates new queue instance', () => {
			const queue = new SyncQueue();
			const op = new SyncOperation('1', 'create', 'work_entries', 'w1');

			const newQueue = queue.enqueue(op);

			expect(newQueue).not.toBe(queue);
			expect(queue.isEmpty()).toBe(true);
		});

		it('maintains order of operations', () => {
			const queue = new SyncQueue();
			const op1 = new SyncOperation('1', 'create', 'work_entries', 'w1');
			const op2 = new SyncOperation('2', 'update', 'trackers', 't1');

			const queue1 = queue.enqueue(op1);
			const queue2 = queue1.enqueue(op2);

			expect(queue2.operations).toHaveLength(2);
			expect(queue2.operations[0].id).toBe('1');
			expect(queue2.operations[1].id).toBe('2');
		});
	});

	describe('dequeue', () => {
		it('returns undefined and empty queue when queue is empty', () => {
			const queue = new SyncQueue();

			const [operation, newQueue] = queue.dequeue();

			expect(operation).toBeUndefined();
			expect(newQueue.isEmpty()).toBe(true);
		});

		it('returns first operation and remaining queue', () => {
			const op1 = new SyncOperation('1', 'create', 'work_entries', 'w1');
			const op2 = new SyncOperation('2', 'update', 'trackers', 't1');
			const queue = new SyncQueue([op1, op2]);

			const [operation, newQueue] = queue.dequeue();

			expect(operation).toBe(op1);
			expect(newQueue.isEmpty()).toBe(false);
			expect(newQueue.operations).toHaveLength(1);
			expect(newQueue.operations[0]).toBe(op2);
		});

		it('creates new queue instance', () => {
			const op = new SyncOperation('1', 'create', 'work_entries', 'w1');
			const queue = new SyncQueue([op]);

			const [_, newQueue] = queue.dequeue();

			expect(newQueue).not.toBe(queue);
			expect(queue.operations).toHaveLength(1);
		});

		it('returns empty queue when dequeueing last operation', () => {
			const op = new SyncOperation('1', 'create', 'work_entries', 'w1');
			const queue = new SyncQueue([op]);

			const [operation, newQueue] = queue.dequeue();

			expect(operation).toBe(op);
			expect(newQueue.isEmpty()).toBe(true);
		});
	});

	describe('isEmpty', () => {
		it('returns true for empty queue', () => {
			const queue = new SyncQueue();

			expect(queue.isEmpty()).toBe(true);
		});

		it('returns false for queue with operations', () => {
			const op = new SyncOperation('1', 'create', 'work_entries', 'w1');
			const queue = new SyncQueue([op]);

			expect(queue.isEmpty()).toBe(false);
		});
	});
});
