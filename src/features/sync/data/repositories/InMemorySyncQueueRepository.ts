import { SyncOperation } from '../../domain/entities/SyncOperation';
import { ISyncQueueRepository } from '../../domain/ports/ISyncQueueRepository';

export class InMemorySyncQueueRepository implements ISyncQueueRepository {
	private operations: SyncOperation[] = [];

	async enqueue(op: SyncOperation): Promise<void> {
		this.operations.push(op);
	}

	async dequeue(): Promise<SyncOperation | null> {
		const idx = this.operations.findIndex((op) => op.status === 'pending');
		if (idx === -1) return null;
		const [op] = this.operations.splice(idx, 1);
		return op ?? null;
	}

	async peek(): Promise<SyncOperation | null> {
		return this.operations.find((op) => op.status === 'pending') ?? null;
	}

	async update(op: SyncOperation): Promise<void> {
		const idx = this.operations.findIndex((o) => o.id === op.id);
		if (idx !== -1) this.operations[idx] = op;
	}

	async getAll(): Promise<SyncOperation[]> {
		return this.operations.filter(
			(op) => op.status === 'pending' || op.status === 'syncing'
		);
	}

	async clear(): Promise<void> {
		this.operations = this.operations.filter(
			(op) => op.status !== 'completed'
		);
	}
}
