import {
	TrackerMapper,
	TrackerModelShape,
} from '@/features/attendance/data/mappers/TrackerMapper';
import { Tracker } from '@/features/attendance/domain/entities/Tracker';

describe('TrackerMapper', () => {
	describe('toDomain', () => {
		it('converts model to domain entity', () => {
			const model: TrackerModelShape = {
				id: 'tracker-1',
				name: 'My Tracker',
				description: 'Test description',
				isActive: true,
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: new Date('2024-01-02T00:00:00Z'),
			};

			const entity = TrackerMapper.toDomain(model);

			expect(entity).toBeInstanceOf(Tracker);
			expect(entity.id).toBe('tracker-1');
			expect(entity.name).toBe('My Tracker');
			expect(entity.description).toBe('Test description');
			expect(entity.isActive).toBe(true);
			expect(entity.createdAt).toEqual(new Date('2024-01-01T00:00:00Z'));
			expect(entity.updatedAt).toEqual(new Date('2024-01-02T00:00:00Z'));
		});

		it('handles missing optional description field', () => {
			const model: TrackerModelShape = {
				id: 'tracker-1',
				name: 'My Tracker',
				isActive: false,
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: new Date('2024-01-02T00:00:00Z'),
			};

			const entity = TrackerMapper.toDomain(model);

			expect(entity.description).toBeUndefined();
			expect(entity.isActive).toBe(false);
		});

		it('maps inactive tracker', () => {
			const model: TrackerModelShape = {
				id: 'tracker-1',
				name: 'Inactive Tracker',
				description: 'Description',
				isActive: false,
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: new Date('2024-01-02T00:00:00Z'),
			};

			const entity = TrackerMapper.toDomain(model);

			expect(entity.isActive).toBe(false);
		});
	});

	describe('toModel', () => {
		it('converts domain entity to model', () => {
			const tracker = new Tracker(
				'tracker-1',
				'My Tracker',
				'Test description',
				true,
				new Date('2024-01-01T00:00:00Z'),
				new Date('2024-01-02T00:00:00Z')
			);

			const model = TrackerMapper.toModel(tracker);

			expect(model).toEqual({
				name: 'My Tracker',
				description: 'Test description',
				isActive: true,
				createdAt: new Date('2024-01-01T00:00:00Z').getTime(),
				updatedAt: new Date('2024-01-02T00:00:00Z').getTime(),
			});
		});

		it('handles missing optional description field', () => {
			const tracker = new Tracker(
				'tracker-1',
				'My Tracker',
				undefined,
				false,
				new Date('2024-01-01T00:00:00Z'),
				new Date('2024-01-02T00:00:00Z')
			);

			const model = TrackerMapper.toModel(tracker);

			expect(model.description).toBeUndefined();
			expect(model.isActive).toBe(false);
		});

		it('converts dates to timestamps', () => {
			const createdAt = new Date('2024-01-01T10:30:00Z');
			const updatedAt = new Date('2024-01-02T15:45:00Z');
			const tracker = new Tracker(
				'tracker-1',
				'My Tracker',
				'Description',
				true,
				createdAt,
				updatedAt
			);

			const model = TrackerMapper.toModel(tracker);

			expect(model.createdAt).toBe(createdAt.getTime());
			expect(model.updatedAt).toBe(updatedAt.getTime());
		});
	});
});
