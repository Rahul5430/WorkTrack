// WatermelonDB tracker repository
import { Database, Q } from '@nozbe/watermelondb';

import { Tracker } from '../../domain/entities/Tracker';
import { ITrackerRepository } from '../../domain/ports/ITrackerRepository';
import { TrackerMapper, TrackerModelShape } from '../mappers/TrackerMapper';

export class WatermelonTrackerRepository implements ITrackerRepository {
	constructor(private readonly database: Database) {}

	async create(tracker: Tracker): Promise<Tracker> {
		const collection = this.database.get('trackers');
		const data = TrackerMapper.toModel(tracker);
		const created = await collection.create((model) => {
			const record = model as unknown as TrackerModelShape;
			record.name = data.name;
			record.description = data.description;
			record.isActive = data.isActive;
			record.createdAt = new Date(data.createdAt);
			record.updatedAt = new Date(data.updatedAt);
		});
		return TrackerMapper.toDomain(created as unknown as TrackerModelShape);
	}

	async update(tracker: Tracker): Promise<Tracker> {
		const collection = this.database.get('trackers');
		const found = await collection.query(Q.where('id', tracker.id)).fetch();
		if (found.length === 0) return this.create(tracker);
		const data = TrackerMapper.toModel(tracker);
		const model = found[0] as unknown as TrackerModelShape & {
			update: (
				updater: (record: TrackerModelShape) => void
			) => Promise<void>;
		};
		await model.update((record) => {
			record.name = data.name;
			record.description = data.description;
			record.isActive = data.isActive;
			record.updatedAt = new Date(data.updatedAt);
		});
		return TrackerMapper.toDomain(model);
	}

	async delete(trackerId: string): Promise<void> {
		const collection = this.database.get('trackers');
		const found = await collection.query(Q.where('id', trackerId)).fetch();
		if (found.length > 0)
			await (
				found[0] as unknown as { markAsDeleted: () => Promise<void> }
			).markAsDeleted();
	}

	async getById(trackerId: string): Promise<Tracker | null> {
		const collection = this.database.get('trackers');
		const found = await collection.query(Q.where('id', trackerId)).fetch();
		return found.length
			? TrackerMapper.toDomain(found[0] as unknown as TrackerModelShape)
			: null;
	}

	async getAllForUser(_userId: string): Promise<Tracker[]> {
		// Schema has user_id on trackers; filtering could be added if present
		const collection = this.database.get('trackers');
		const results = await collection.query().fetch();
		return results.map((m: unknown) =>
			TrackerMapper.toDomain(m as TrackerModelShape)
		);
	}
}
