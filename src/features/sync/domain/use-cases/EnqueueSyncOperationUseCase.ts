import { logger } from '@/shared/utils/logging';

import { SyncOperation } from '../entities/SyncOperation';
import { ISyncQueueRepository } from '../ports/ISyncQueueRepository';

export class EnqueueSyncOperationUseCase {
	constructor(private readonly queueRepo: ISyncQueueRepository) {}

	async execute(operation: SyncOperation): Promise<void> {
		logger.info('Enqueue sync operation', { id: operation.id });
		await this.queueRepo.enqueue(operation);
	}
}
