import { EventEmitter } from 'events';

import { logger } from '@/shared/utils/logging';

import { SyncOperation } from '../entities/SyncOperation';
import { INetworkMonitor } from '../ports/INetworkMonitor';
import { ISyncQueueRepository } from '../ports/ISyncQueueRepository';
import { ISyncRepository } from '../ports/ISyncRepository';

export class ProcessSyncQueueUseCase {
	constructor(
		private readonly queueRepo: ISyncQueueRepository,
		private readonly syncRepo: ISyncRepository,
		private readonly network: INetworkMonitor
	) {}

	private readonly emitter = new EventEmitter();

	onItemProcessed(
		listener: (payload: { id: string; success: boolean }) => void
	): void {
		this.emitter.on('itemProcessed', listener);
	}

	async execute(): Promise<void> {
		const online = await this.network.isOnline();
		if (!online) {
			logger.info('Skipping sync: offline');
			return;
		}

		const ops: SyncOperation[] = await this.queueRepo.getAll();
		if (ops.length === 0) return;

		// Mark in-progress
		await Promise.all(
			ops.map(async (op) =>
				this.queueRepo.update(op.withStatus('syncing'))
			)
		);

		const outcomes = await this.syncRepo.syncToRemote(
			ops.map((op) => ({
				id: op.id,
				payload: {
					tableName: op.tableName,
					recordId: op.recordId,
					operation: op.operation,
					data: op.data ?? {},
				},
			}))
		);

		const now = Date.now();
		await Promise.all(
			outcomes.map(async (outcome) => {
				const op = ops.find((o) => o.id === outcome.opId);
				if (!op) return;
				if (outcome.success) {
					await this.queueRepo.update(op.withStatus('completed'));
				} else {
					const nextDelayMs = this.computeBackoff(op.retryCount + 1);
					const nextRetryAt = new Date(now + nextDelayMs);
					const retried = op.incrementRetry(nextRetryAt);
					await this.queueRepo.update(retried);
				}
				this.emitter.emit('itemProcessed', {
					id: outcome.opId,
					success: outcome.success,
				});
			})
		);
	}

	private computeBackoff(attempt: number): number {
		const base = 5000; // 5s
		const cap = 24 * 60 * 60 * 1000; // 24h
		const exp = Math.max(1, attempt);
		const delay = Math.min(cap, base * Math.pow(2, exp - 1));
		return delay;
	}
}
