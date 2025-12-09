import { SyncOperation } from '@/features/sync/domain/entities/SyncOperation';
import { ISyncQueueRepository } from '@/features/sync/domain/ports/ISyncQueueRepository';

import { Tracker } from '../../domain/entities/Tracker';
import { ITrackerRepository } from '../../domain/ports/ITrackerRepository';

export class SyncingTrackerRepositoryDecorator implements ITrackerRepository {
	constructor(
		private readonly inner: ITrackerRepository,
		private readonly queue: ISyncQueueRepository
	) {}

	async create(tracker: Tracker, userId: string): Promise<Tracker> {
		const created = await this.inner.create(tracker, userId);
		await this.queue.enqueue(
			new SyncOperation(
				`tr-${created.id}`,
				'create',
				'trackers',
				created.id,
				{
					ownerId: userId,
					name: created.name,
					description: created.description,
					isActive: created.isActive,
				}
			)
		);
		return created;
	}

	async update(tracker: Tracker): Promise<Tracker> {
		const updated = await this.inner.update(tracker);
		await this.queue.enqueue(
			new SyncOperation(
				`tru-${updated.id}-${updated.updatedAt.getTime()}`,
				'update',
				'trackers',
				updated.id,
				{
					name: updated.name,
					description: updated.description,
					isActive: updated.isActive,
				}
			)
		);
		return updated;
	}

	async delete(id: string): Promise<void> {
		await this.inner.delete(id);
		await this.queue.enqueue(
			new SyncOperation(`trd-${id}`, 'delete', 'trakers', id)
		);
	}

	async getById(id: string): Promise<Tracker | null> {
		return this.inner.getById(id);
	}

	async getAllForUser(userId: string): Promise<Tracker[]> {
		return this.inner.getAllForUser(userId);
	}
}
