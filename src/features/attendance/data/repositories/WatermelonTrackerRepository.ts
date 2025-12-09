// WatermelonDB tracker repository
import { Database, Q } from '@nozbe/watermelondb';

import { Tracker } from '../../domain/entities/Tracker';
import { ITrackerRepository } from '../../domain/ports/ITrackerRepository';
import { TrackerMapper, TrackerModelShape } from '../mappers/TrackerMapper';
import TrackerModel from '../models/TrackerModel';

/**
 * Helper function to safely cast WatermelonDB Model to TrackerModelShape
 * This is necessary because WatermelonDB's Model type doesn't expose all properties
 * directly, but they are available at runtime.
 */
function toModelShape(model: TrackerModel): TrackerModelShape {
	return model as unknown as TrackerModelShape;
}

export class WatermelonTrackerRepository implements ITrackerRepository {
	constructor(private readonly database: Database) {}

	async create(tracker: Tracker, userId: string): Promise<Tracker> {
		const collection = this.database.get<TrackerModel>('trackers');
		const data = TrackerMapper.toModel(tracker);
		const created = await this.database.write(async () => {
			return await collection.create((model) => {
				const record = toModelShape(model);
				record.name = data.name;
				record.description = data.description;
				record.userId = userId;
				record.isActive = data.isActive;
				record.createdAt = new Date(data.createdAt);
				record.updatedAt = new Date(data.updatedAt);
			});
		});
		return TrackerMapper.toDomain(toModelShape(created));
	}

	async update(tracker: Tracker): Promise<Tracker> {
		const collection = this.database.get<TrackerModel>('trackers');
		const found = await collection.query(Q.where('id', tracker.id)).fetch();
		if (found.length === 0) {
			throw new Error(`Tracker with id ${tracker.id} not found`);
		}
		const data = TrackerMapper.toModel(tracker);
		const model = found[0];
		await this.database.write(async () => {
			await model.update((record) => {
				const r = toModelShape(record);
				r.name = data.name;
				r.description = data.description;
				r.isActive = data.isActive;
				r.updatedAt = new Date(data.updatedAt);
			});
		});
		return TrackerMapper.toDomain(toModelShape(model));
	}

	async delete(trackerId: string): Promise<void> {
		const collection = this.database.get<TrackerModel>('trackers');
		const found = await collection.query(Q.where('id', trackerId)).fetch();
		if (found.length > 0) {
			const model = found[0];
			await this.database.write(async () => {
				await model.markAsDeleted();
			});
		}
	}

	async getById(trackerId: string): Promise<Tracker | null> {
		const collection = this.database.get<TrackerModel>('trackers');
		const found = await collection.query(Q.where('id', trackerId)).fetch();
		return found.length
			? TrackerMapper.toDomain(toModelShape(found[0]))
			: null;
	}

	async getAllForUser(_userId: string): Promise<Tracker[]> {
		// Schema has user_id on trackers; filtering could be added if present
		const collection = this.database.get<TrackerModel>('trackers');
		const results = await collection.query().fetch();
		return results.map((m) => TrackerMapper.toDomain(toModelShape(m)));
	}
}
