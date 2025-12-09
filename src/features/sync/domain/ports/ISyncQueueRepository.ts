import { SyncOperation } from '../entities/SyncOperation';

export interface ISyncQueueRepository {
	enqueue(op: SyncOperation): Promise<void>;
	dequeue(): Promise<SyncOperation | null>;
	peek(): Promise<SyncOperation | null>;
	update(op: SyncOperation): Promise<void>;
	getAll(): Promise<SyncOperation[]>;
	clear(): Promise<void>;
}
