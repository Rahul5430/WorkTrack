import { SyncOperation } from './SyncOperation';

export class SyncQueue {
	private readonly _operations: SyncOperation[];

	constructor(operations: SyncOperation[] = []) {
		this._operations = [...operations];
	}

	get operations(): ReadonlyArray<SyncOperation> {
		return this._operations;
	}

	enqueue(operation: SyncOperation): SyncQueue {
		return new SyncQueue([...this._operations, operation]);
	}

	dequeue(): [SyncOperation | undefined, SyncQueue] {
		const [first, ...rest] = this._operations;
		return [first, new SyncQueue(rest)];
	}

	isEmpty(): boolean {
		return this._operations.length === 0;
	}
}
