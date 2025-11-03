import {
	EntryMapper,
	WorkEntryModelShape,
} from '@/features/attendance/data/mappers/EntryMapper';
import { WorkEntry } from '@/features/attendance/domain/entities/WorkEntry';
import { WorkStatus } from '@/features/attendance/domain/entities/WorkStatus';

describe('EntryMapper', () => {
	describe('toDomain', () => {
		it('converts model to domain entity with string date', () => {
			const model: WorkEntryModelShape = {
				id: 'entry-1',
				date: '2024-01-01',
				status: 'office',
				isAdvisory: false,
				notes: 'Test notes',
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: new Date('2024-01-02T00:00:00Z'),
				userId: 'user-1',
				trackerId: 'tracker-1',
			};

			const entity = EntryMapper.toDomain(model);

			expect(entity).toBeInstanceOf(WorkEntry);
			expect(entity.id).toBe('entry-1');
			expect(entity.date).toBe('2024-01-01');
			expect(entity.status).toBeInstanceOf(WorkStatus);
			expect(entity.status.value).toBe('office');
			expect(entity.isAdvisory).toBe(false);
			expect(entity.notes).toBe('Test notes');
			expect(entity.userId).toBe('user-1');
			expect(entity.trackerId).toBe('tracker-1');
			expect(entity.createdAt).toEqual(new Date('2024-01-01T00:00:00Z'));
			expect(entity.updatedAt).toEqual(new Date('2024-01-02T00:00:00Z'));
		});

		it('converts model to domain entity with Date object', () => {
			const date = new Date('2024-01-01T12:00:00Z');
			const model: WorkEntryModelShape = {
				id: 'entry-1',
				date: date,
				status: 'wfh',
				isAdvisory: true,
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: new Date('2024-01-02T00:00:00Z'),
				userId: 'user-1',
				trackerId: 'tracker-1',
			};

			const entity = EntryMapper.toDomain(model);

			// EntryMapper converts Date to ISO string, then WorkEntry.normalizeDate extracts date part
			expect(entity.date).toBe('2024-01-01');
			expect(entity.status.value).toBe('wfh');
			expect(entity.isAdvisory).toBe(true);
		});

		it('handles missing optional notes field', () => {
			const model: WorkEntryModelShape = {
				id: 'entry-1',
				date: '2024-01-01',
				status: 'office',
				isAdvisory: false,
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: new Date('2024-01-02T00:00:00Z'),
				userId: 'user-1',
				trackerId: 'tracker-1',
			};

			const entity = EntryMapper.toDomain(model);

			expect(entity.notes).toBeUndefined();
		});
	});

	describe('toModel', () => {
		it('converts domain entity to model', () => {
			const entry = new WorkEntry(
				'entry-1',
				'user-1',
				'tracker-1',
				'2024-01-01',
				new WorkStatus('office'),
				'Test notes',
				false,
				new Date('2024-01-01T00:00:00Z'),
				new Date('2024-01-02T00:00:00Z')
			);

			const model = EntryMapper.toModel(entry);

			expect(model).toEqual({
				date: '2024-01-01',
				status: 'office',
				isAdvisory: false,
				notes: 'Test notes',
				createdAt: new Date('2024-01-01T00:00:00Z').getTime(),
				updatedAt: new Date('2024-01-02T00:00:00Z').getTime(),
				userId: 'user-1',
				trackerId: 'tracker-1',
			});
		});

		it('handles missing optional notes field', () => {
			const entry = new WorkEntry(
				'entry-1',
				'user-1',
				'tracker-1',
				'2024-01-01',
				new WorkStatus('wfh'),
				undefined,
				true,
				new Date('2024-01-01T00:00:00Z'),
				new Date('2024-01-02T00:00:00Z')
			);

			const model = EntryMapper.toModel(entry);

			expect(model.notes).toBeUndefined();
			expect(model.isAdvisory).toBe(true);
			expect(model.status).toBe('wfh');
		});

		it('converts dates to timestamps', () => {
			const createdAt = new Date('2024-01-01T10:30:00Z');
			const updatedAt = new Date('2024-01-02T15:45:00Z');
			const entry = new WorkEntry(
				'entry-1',
				'user-1',
				'tracker-1',
				'2024-01-01',
				new WorkStatus('office'),
				undefined,
				false,
				createdAt,
				updatedAt
			);

			const model = EntryMapper.toModel(entry);

			expect(model.createdAt).toBe(createdAt.getTime());
			expect(model.updatedAt).toBe(updatedAt.getTime());
		});
	});
});
