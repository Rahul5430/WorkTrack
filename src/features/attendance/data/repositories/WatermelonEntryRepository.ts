// WatermelonDB entry repository
import { Database, Q } from '@nozbe/watermelondb';

import { logger } from '@/shared/utils/logging';

import { DateRange } from '../../domain/entities/DateRange';
import { WorkEntry } from '../../domain/entities/WorkEntry';
import { IEntryRepository } from '../../domain/ports/IEntryRepository';
import { EntryMapper, WorkEntryModelShape } from '../mappers/EntryMapper';
import WorkEntryModel from '../models/WorkEntryModel';

/**
 * Helper function to safely cast WatermelonDB Model to WorkEntryModelShape
 * This is necessary because WatermelonDB's Model type doesn't expose all properties
 * directly, but they are available at runtime.
 */
function toModelShape(model: WorkEntryModel): WorkEntryModelShape {
	return model as unknown as WorkEntryModelShape;
}

export class WatermelonEntryRepository implements IEntryRepository {
	constructor(private readonly database: Database) {}

	async create(entry: WorkEntry): Promise<WorkEntry> {
		const collection = this.database.get<WorkEntryModel>('work_entries');
		const data = EntryMapper.toModel(entry);
		const created = await this.database.write(async () => {
			return await collection.create((model) => {
				const record = toModelShape(model);
				record.date = data.date;
				record.status = data.status;
				record.isAdvisory = data.isAdvisory;
				record.notes = data.notes;
				record.createdAt = new Date(data.createdAt);
				record.updatedAt = new Date(data.updatedAt);
				record.userId = data.userId;
				record.trackerId = data.trackerId;
			});
		});
		logger.info('Created work entry');
		return EntryMapper.toDomain(toModelShape(created));
	}

	async update(entry: WorkEntry): Promise<WorkEntry> {
		const collection = this.database.get<WorkEntryModel>('work_entries');
		const data = EntryMapper.toModel(entry);
		const found = await collection.query(Q.where('id', entry.id)).fetch();
		if (found.length === 0) return this.create(entry);
		const model = found[0];
		await this.database.write(async () => {
			await model.update((record) => {
				const r = toModelShape(record);
				r.status = data.status;
				r.notes = data.notes;
				r.isAdvisory = data.isAdvisory;
				r.updatedAt = new Date(data.updatedAt);
			});
		});
		return EntryMapper.toDomain(toModelShape(model));
	}

	async delete(entryId: string): Promise<void> {
		const collection = this.database.get<WorkEntryModel>('work_entries');
		const found = await collection.query(Q.where('id', entryId)).fetch();
		if (found.length > 0) {
			const model = found[0];
			await this.database.write(async () => {
				await model.markAsDeleted();
			});
		}
	}

	async getById(entryId: string): Promise<WorkEntry | null> {
		const collection = this.database.get<WorkEntryModel>('work_entries');
		const found = await collection.query(Q.where('id', entryId)).fetch();
		return found.length
			? EntryMapper.toDomain(toModelShape(found[0]))
			: null;
	}

	async getForTracker(trackerId: string): Promise<WorkEntry[]> {
		const collection = this.database.get<WorkEntryModel>('work_entries');
		const results = await collection
			.query(Q.where('tracker_id', trackerId))
			.fetch();
		return results.map((m) => EntryMapper.toDomain(toModelShape(m)));
	}

	async getForPeriod(
		userId: string,
		range: DateRange,
		trackerId?: string
	): Promise<WorkEntry[]> {
		const collection = this.database.get<WorkEntryModel>('work_entries');
		const conditions = [
			Q.where('user_id', userId),
			Q.where(
				'date',
				Q.between(range.start.getTime(), range.end.getTime())
			),
		];
		if (trackerId) conditions.push(Q.where('tracker_id', trackerId));
		const results = await collection.query(...conditions).fetch();
		return results.map((m) => EntryMapper.toDomain(toModelShape(m)));
	}
}
