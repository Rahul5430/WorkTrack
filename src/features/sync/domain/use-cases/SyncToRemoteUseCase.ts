import { logger } from '@/shared/utils/logging';

import { ISyncQueueRepository } from '../ports/ISyncQueueRepository';
import { ISyncRepository } from '../ports/ISyncRepository';

export class SyncToRemoteUseCase {
	constructor(
		private readonly queueRepo: ISyncQueueRepository,
		private readonly syncRepo: ISyncRepository
	) {}

	async execute(): Promise<void> {
		const ops = await this.queueRepo.getAll();
		if (ops.length === 0) return;
		logger.info('Syncing to remote', { count: ops.length });
		await this.syncRepo.syncToRemote(
			ops.map((op) => ({
				id: op.id,
				payload: {
					tableName: op.tableName,
					recordId: op.recordId,
					operation: op.operation,
					data: op.data,
				},
			}))
		);
		await this.queueRepo.clear();
	}
}
