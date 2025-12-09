import { BaseEntity } from '@/shared/domain/entities';
import type { SerializableRecord } from '@/shared/types/serialization';

export type SyncOperationType = 'create' | 'update' | 'delete';
export type SyncOperationStatus =
	| 'pending'
	| 'syncing'
	| 'completed'
	| 'failed';

export interface SyncOperationPayload {
	tableName: string;
	recordId: string;
	operation: SyncOperationType;
	data?: SerializableRecord;
}

export class SyncOperation extends BaseEntity<SyncOperationPayload> {
	public readonly operation: SyncOperationType;
	public readonly tableName: string;
	public readonly recordId: string;
	public readonly data?: SerializableRecord;
	public readonly status: SyncOperationStatus;
	public readonly retryCount: number;
	public readonly maxRetries: number;
	public readonly nextRetryAt?: Date;

	constructor(
		id: string,
		operation: SyncOperationType,
		tableName: string,
		recordId: string,
		data?: SerializableRecord,
		status: SyncOperationStatus = 'pending',
		retryCount = 0,
		maxRetries = 5,
		nextRetryAt?: Date,
		createdAt?: Date,
		updatedAt?: Date
	) {
		super(id, createdAt, updatedAt);
		this.operation = operation;
		this.tableName = tableName;
		this.recordId = recordId;
		this.data = data;
		this.status = status;
		this.retryCount = retryCount;
		this.maxRetries = maxRetries;
		this.nextRetryAt = nextRetryAt;
		this.validate();
	}

	withStatus(status: SyncOperationStatus, nextRetryAt?: Date): SyncOperation {
		return new SyncOperation(
			this.id,
			this.operation,
			this.tableName,
			this.recordId,
			this.data,
			status,
			this.retryCount,
			this.maxRetries,
			nextRetryAt,
			this.createdAt,
			new Date()
		);
	}

	incrementRetry(nextRetryAt: Date): SyncOperation {
		return new SyncOperation(
			this.id,
			this.operation,
			this.tableName,
			this.recordId,
			this.data,
			'pending',
			this.retryCount + 1,
			this.maxRetries,
			nextRetryAt,
			this.createdAt,
			new Date()
		);
	}

	protected validate(): void {
		super.validate();
		if (!this.tableName) throw new Error('tableName is required');
		if (!this.recordId) throw new Error('recordId is required');
		if (!['create', 'update', 'delete'].includes(this.operation)) {
			throw new Error('Invalid sync operation');
		}
		if (
			!['pending', 'syncing', 'completed', 'failed'].includes(this.status)
		) {
			throw new Error('Invalid sync status');
		}
	}
}
