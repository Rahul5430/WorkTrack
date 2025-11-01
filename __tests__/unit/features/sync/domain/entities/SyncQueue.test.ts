import { SyncOperation } from '@/features/sync/domain/entities/SyncOperation';
import { SyncQueue } from '@/features/sync/domain/entities/SyncQueue';

describe('SyncQueue', () => {
	it('enqueues and dequeues', () => {
		const q = new SyncQueue();
		const op = new SyncOperation('1', 'create', 'work_entries', 'w1');
		const q2 = q.enqueue(op);
		expect(q2.isEmpty()).toBe(false);
		const [first, rest] = q2.dequeue();
		expect(first?.id).toBe('1');
		expect(rest.isEmpty()).toBe(true);
	});
});
