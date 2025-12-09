import { SyncOperation } from '@/features/sync/domain/entities/SyncOperation';
import { ISyncQueueRepository } from '@/features/sync/domain/ports/ISyncQueueRepository';

import { DateRange } from '../../domain/entities/DateRange';
import { WorkEntry } from '../../domain/entities/WorkEntry';
import { IEntryRepository } from '../../domain/ports/IEntryRepository';

export class SyncingEntryRepositoryDecorator implements IEntryRepository {
	constructor(
		private readonly inner: IEntryRepository,
		private readonly queue: ISyncQueueRepository
	) {}

	async create(entry: WorkEntry): Promise<WorkEntry> {
		const created = await this.inner.create(entry);
		await this.queue.enqueue(
			new SyncOperation(
				`we-${created.id}`,
				'create',
				'work_entries',
				created.id,
				{
					userId: created.userId,
					trackerId: created.trackerId,
					date: created.date,
					status: created.status.value,
				}
			)
		);
		return created;
	}

	async update(entry: WorkEntry): Promise<WorkEntry> {
		const updated = await this.inner.update(entry);
		await this.queue.enqueue(
			new SyncOperation(
				`weu-${updated.id}-${updated.updatedAt.getTime()}`,
				'update',
				'work_entries',
				updated.id,
				{ status: updated.status.value, notes: updated.notes }
			)
		);
		return updated;
	}

	async delete(id: string): Promise<void> {
		await this.inner.delete(id);
		await this.queue.enqueue(
			new SyncOperation(`wed-${id}`, 'delete', 'work_entries', id)
		);
	}

	async getById(id: string): Promise<WorkEntry | null> {
		return this.inner.getById(id);
	}

	async getForTracker(trackerId: string): Promise<WorkEntry[]> {
		return this.inner.getForTracker(trackerId);
	}

	async getForPeriod(
		userId: string,
		range: DateRange,
		trackerId?: string
	): Promise<WorkEntry[]> {
		return this.inner.getForPeriod(userId, range, trackerId);
	}
}
