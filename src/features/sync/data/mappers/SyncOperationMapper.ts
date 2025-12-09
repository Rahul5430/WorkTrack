// SyncOperation mapper between domain and WatermelonDB model
import type { SerializableRecord } from '@/shared/types/serialization';

import { SyncOperation } from '../../domain/entities/SyncOperation';

// Minimal model shape for mapping
export interface SyncOperationModelShape {
	id: string;
	operation: string;
	tableName: string;
	recordId: string;
	data?: string; // JSON string
	status: string;
	retryCount: number;
	maxRetries: number;
	errorMessage?: string;
	createdAt: Date;
	updatedAt: Date;
	nextRetryAt?: Date;
}

export const SyncOperationMapper = {
	toDomain(model: SyncOperationModelShape): SyncOperation {
		// Parse JSON data and validate it's a SerializableRecord
		// We assume stored data is valid JSON that conforms to SerializableRecord
		const data: SerializableRecord | undefined = model.data
			? (JSON.parse(model.data) as SerializableRecord)
			: undefined;
		return new SyncOperation(
			model.id,
			model.operation as SyncOperation['operation'],
			model.tableName,
			model.recordId,
			data,
			model.status as SyncOperation['status'],
			model.retryCount,
			model.maxRetries,
			model.nextRetryAt,
			model.createdAt,
			model.updatedAt
		);
	},

	toModel(operation: SyncOperation): {
		operation: string;
		tableName: string;
		recordId: string;
		data?: string;
		status: string;
		retryCount: number;
		maxRetries: number;
		errorMessage?: string;
		createdAt: number;
		updatedAt: number;
		nextRetryAt?: number;
	} {
		return {
			operation: operation.operation,
			tableName: operation.tableName,
			recordId: operation.recordId,
			data: operation.data ? JSON.stringify(operation.data) : undefined,
			status: operation.status,
			retryCount: operation.retryCount,
			maxRetries: operation.maxRetries,
			createdAt: operation.createdAt.getTime(),
			updatedAt: operation.updatedAt.getTime(),
			nextRetryAt: operation.nextRetryAt?.getTime(),
		};
	},
};
