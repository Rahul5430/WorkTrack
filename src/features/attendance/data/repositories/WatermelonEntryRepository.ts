// WatermelonDB entry repository
import { Database, Q } from '@nozbe/watermelondb';

import { logger } from '@/shared/utils/logging';

import { DateRange } from '../../domain/entities/DateRange';
import { WorkEntry } from '../../domain/entities/WorkEntry';
import { IEntryRepository } from '../../domain/ports/IEntryRepository';
import { EntryMapper, WorkEntryModelShape } from '../mappers/EntryMapper';

export class WatermelonEntryRepository implements IEntryRepository {
	constructor(private readonly database: Database) {}

	async create(entry: WorkEntry): Promise<WorkEntry> {
		const collection = this.database.get('work_entries');
		const data = EntryMapper.toModel(entry);
		const created = await collection.create((model) => {
			const record = model as unknown as WorkEntryModelShape;
			record.date = data.date;
			record.status = data.status;
			record.isAdvisory = data.isAdvisory;
			record.notes = data.notes;
			record.createdAt = new Date(data.createdAt);
			record.updatedAt = new Date(data.updatedAt);
			record.userId = data.userId;
			record.trackerId = data.trackerId;
		});
		logger.info('Created work entry');
		return EntryMapper.toDomain(created as unknown as WorkEntryModelShape);
	}

	async update(entry: WorkEntry): Promise<WorkEntry> {
		const collection = this.database.get('work_entries');
		const data = EntryMapper.toModel(entry);
		const found = await collection.query(Q.where('id', entry.id)).fetch();
		if (found.length === 0) return this.create(entry);
		const model = found[0] as unknown as WorkEntryModelShape & {
			update: (
				updater: (record: WorkEntryModelShape) => void
			) => Promise<void>;
		};
		await model.update((record: WorkEntryModelShape) => {
			record.status = data.status;
			record.notes = data.notes;
			record.isAdvisory = data.isAdvisory;
			record.updatedAt = new Date(data.updatedAt);
		});
		return EntryMapper.toDomain(model);
	}

	async delete(entryId: string): Promise<void> {
		const collection = this.database.get('work_entries');
		const found = await collection.query(Q.where('id', entryId)).fetch();
		if (found.length > 0) {
			await (
				found[0] as unknown as { markAsDeleted: () => Promise<void> }
			).markAsDeleted();
		}
	}

	async getById(entryId: string): Promise<WorkEntry | null> {
		const collection = this.database.get('work_entries');
		const found = await collection.query(Q.where('id', entryId)).fetch();
		return found.length
			? EntryMapper.toDomain(found[0] as unknown as WorkEntryModelShape)
			: null;
	}

	async getForTracker(trackerId: string): Promise<WorkEntry[]> {
		const collection = this.database.get('work_entries');
		const results = await collection
			.query(Q.where('tracker_id', trackerId))
			.fetch();
		return results.map((m: unknown) =>
			EntryMapper.toDomain(m as WorkEntryModelShape)
		);
	}

	async getForPeriod(
		userId: string,
		range: DateRange,
		trackerId?: string
	): Promise<WorkEntry[]> {
		const collection = this.database.get('work_entries');
		const conditions = [
			Q.where('user_id', userId),
			Q.where(
				'date',
				Q.between(range.start.getTime(), range.end.getTime())
			),
		];
		if (trackerId) conditions.push(Q.where('tracker_id', trackerId));
		const results = await collection.query(...conditions).fetch();
		return results.map((m: unknown) =>
			EntryMapper.toDomain(m as WorkEntryModelShape)
		);
	}
}
