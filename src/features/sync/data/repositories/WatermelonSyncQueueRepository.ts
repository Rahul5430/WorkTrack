// WatermelonDB sync queue repository
import { Database, Q } from '@nozbe/watermelondb';

import { logger } from '@/shared/utils/logging';

import { SyncOperation } from '../../domain/entities/SyncOperation';
import { ISyncQueueRepository } from '../../domain/ports/ISyncQueueRepository';
import {
	SyncOperationMapper,
	SyncOperationModelShape,
} from '../mappers/SyncOperationMapper';
import SyncOperationModel from '../models/SyncOperationModel';

/**
 * Helper function to safely cast WatermelonDB Model to SyncOperationModelShape
 * This is necessary because WatermelonDB's Model type doesn't expose all properties
 * directly, but they are available at runtime.
 */
function toModelShape(model: SyncOperationModel): SyncOperationModelShape {
	return model as unknown as SyncOperationModelShape;
}

export class WatermelonSyncQueueRepository implements ISyncQueueRepository {
	constructor(private readonly database: Database) {}

	async enqueue(op: SyncOperation): Promise<void> {
		const collection = this.database.get<SyncOperationModel>('sync_queue');
		const data = SyncOperationMapper.toModel(op);
		await collection.create((model) => {
			const record = toModelShape(model);
			record.operation = data.operation;
			record.tableName = data.tableName;
			record.recordId = data.recordId;
			record.data = data.data;
			record.status = data.status;
			record.retryCount = data.retryCount;
			record.maxRetries = data.maxRetries;
			record.createdAt = new Date(data.createdAt);
			record.updatedAt = new Date(data.updatedAt);
			record.nextRetryAt = data.nextRetryAt
				? new Date(data.nextRetryAt)
				: undefined;
		});
		logger.info('Enqueued sync operation', { id: op.id });
	}

	async dequeue(): Promise<SyncOperation | null> {
		const collection = this.database.get<SyncOperationModel>('sync_queue');
		const pending = await collection
			.query(
				Q.where('status', 'pending'),
				Q.sortBy('created_at', Q.asc),
				Q.take(1)
			)
			.fetch();
		if (pending.length === 0) return null;
		const model = pending[0];
		const op = SyncOperationMapper.toDomain(toModelShape(model));
		await model.destroyPermanently();
		return op;
	}

	async peek(): Promise<SyncOperation | null> {
		const collection = this.database.get<SyncOperationModel>('sync_queue');
		const pending = await collection
			.query(
				Q.where('status', 'pending'),
				Q.sortBy('created_at', Q.asc),
				Q.take(1)
			)
			.fetch();
		if (pending.length === 0) return null;
		return SyncOperationMapper.toDomain(toModelShape(pending[0]));
	}

	async update(op: SyncOperation): Promise<void> {
		const collection = this.database.get<SyncOperationModel>('sync_queue');
		const found = await collection.find(op.id);
		if (!found) {
			throw new Error(`Sync operation ${op.id} not found`);
		}
		const data = SyncOperationMapper.toModel(op);
		await found.update((model) => {
			const record = toModelShape(model);
			record.status = data.status;
			record.retryCount = data.retryCount;
			record.errorMessage = data.errorMessage;
			record.updatedAt = new Date(data.updatedAt);
			record.nextRetryAt = data.nextRetryAt
				? new Date(data.nextRetryAt)
				: undefined;
		});
		logger.info('Updated sync operation', { id: op.id });
	}

	async getAll(limit = 50): Promise<SyncOperation[]> {
		const collection = this.database.get<SyncOperationModel>('sync_queue');
		const now = Date.now();
		const models = await collection
			.query(
				Q.where('status', Q.oneOf(['pending', 'syncing'])),
				Q.where('next_retry_at', Q.lte(now)),
				Q.sortBy('created_at', Q.asc)
			)
			.fetch();
		const limited = models.slice(0, limit);
		return limited.map((m) =>
			SyncOperationMapper.toDomain(toModelShape(m))
		);
	}

	async clear(): Promise<void> {
		const collection = this.database.get<SyncOperationModel>('sync_queue');
		const completed = await collection
			.query(Q.where('status', 'completed'))
			.fetch();
		await Promise.all(completed.map((m) => m.destroyPermanently()));
		logger.info('Cleared completed sync operations');
	}
}
