import { Database, Q } from '@nozbe/watermelondb';

import { WorkEntryModelShape } from '@/features/attendance/data/mappers/EntryMapper';
import { WatermelonEntryRepository } from '@/features/attendance/data/repositories/WatermelonEntryRepository';
import { DateRange } from '@/features/attendance/domain/entities/DateRange';
import { WorkEntry } from '@/features/attendance/domain/entities/WorkEntry';
import { WorkStatus } from '@/features/attendance/domain/entities/WorkStatus';

// Mock Q.between - WatermelonDB may not have this method, but the code uses it
if (!Q.between) {
	Object.defineProperty(Q, 'between', {
		value: jest.fn((start: number, end: number) => ['between', start, end]),
		writable: true,
		configurable: true,
	});
}

describe('WatermelonEntryRepository', () => {
	let database: jest.Mocked<Database>;
	let repository: WatermelonEntryRepository;
	let collection: jest.Mocked<
		ReturnType<Database['get']> & {
			create: jest.Mock;
			query: jest.Mock;
		}
	>;
	let queryBuilder: {
		fetch: jest.Mock;
	};

	beforeEach(() => {
		queryBuilder = {
			fetch: jest.fn().mockResolvedValue([]),
		};

		collection = {
			create: jest.fn(),
			query: jest.fn().mockReturnValue(queryBuilder),
		} as unknown as jest.Mocked<
			ReturnType<Database['get']> & {
				create: jest.Mock;
				query: jest.Mock;
			}
		>;

		database = {
			get: jest.fn().mockReturnValue(collection),
		} as unknown as jest.Mocked<Database>;

		repository = new WatermelonEntryRepository(database);
	});

	describe('create', () => {
		it('creates a new work entry', async () => {
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

			const mockModel = {
				id: 'entry-1',
				date: '2024-01-01',
				status: 'office',
				isAdvisory: false,
				notes: 'Test notes',
				userId: 'user-1',
				trackerId: 'tracker-1',
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: new Date('2024-01-02T00:00:00Z'),
			} as unknown as WorkEntryModelShape;

			collection.create.mockImplementation((cb) => {
				cb(mockModel);
				return Promise.resolve(mockModel);
			});

			const result = await repository.create(entry);

			expect(database.get).toHaveBeenCalledWith('work_entries');
			expect(collection.create).toHaveBeenCalled();
			expect(result).toBeInstanceOf(WorkEntry);
			expect(result.id).toBe('entry-1');
			expect(result.date).toBe('2024-01-01');
			expect(result.status.value).toBe('office');
		});
	});

	describe('update', () => {
		it('updates existing entry', async () => {
			const entry = new WorkEntry(
				'entry-1',
				'user-1',
				'tracker-1',
				'2024-01-01',
				new WorkStatus('wfh'),
				'Updated notes',
				true,
				new Date('2024-01-01T00:00:00Z'),
				new Date('2024-01-03T00:00:00Z')
			);

			const mockModel = {
				id: 'entry-1',
				date: '2024-01-01',
				status: 'wfh',
				isAdvisory: true,
				notes: 'Updated notes',
				userId: 'user-1',
				trackerId: 'tracker-1',
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: new Date('2024-01-03T00:00:00Z'),
				update: jest.fn().mockImplementation((cb) => {
					cb(mockModel);
					return Promise.resolve();
				}),
			} as unknown as WorkEntryModelShape & {
				update: (
					cb: (record: WorkEntryModelShape) => void
				) => Promise<void>;
			};

			queryBuilder.fetch.mockResolvedValueOnce([mockModel]);

			const result = await repository.update(entry);

			expect(collection.query).toHaveBeenCalledWith(
				Q.where('id', 'entry-1')
			);
			expect(queryBuilder.fetch).toHaveBeenCalled();
			expect(mockModel.update).toHaveBeenCalled();
			expect(result).toBeInstanceOf(WorkEntry);
			expect(result.status.value).toBe('wfh');
		});

		it('creates entry if not found during update', async () => {
			const entry = new WorkEntry(
				'entry-1',
				'user-1',
				'tracker-1',
				'2024-01-01',
				new WorkStatus('office')
			);

			queryBuilder.fetch.mockResolvedValueOnce([]);

			const mockModel = {
				id: 'entry-1',
				date: '2024-01-01',
				status: 'office',
				isAdvisory: false,
				userId: 'user-1',
				trackerId: 'tracker-1',
				createdAt: new Date(),
				updatedAt: new Date(),
			} as unknown as WorkEntryModelShape;

			collection.create.mockImplementation((cb) => {
				cb(mockModel);
				return Promise.resolve(mockModel);
			});

			const result = await repository.update(entry);

			expect(collection.create).toHaveBeenCalled();
			expect(result).toBeInstanceOf(WorkEntry);
		});
	});

	describe('delete', () => {
		it('marks entry as deleted when found', async () => {
			const mockModel = {
				markAsDeleted: jest.fn().mockResolvedValue(undefined),
			} as unknown as { markAsDeleted: () => Promise<void> };

			queryBuilder.fetch.mockResolvedValueOnce([mockModel]);

			await repository.delete('entry-1');

			expect(collection.query).toHaveBeenCalledWith(
				Q.where('id', 'entry-1')
			);
			expect(mockModel.markAsDeleted).toHaveBeenCalled();
		});

		it('does nothing when entry not found', async () => {
			queryBuilder.fetch.mockResolvedValueOnce([]);

			await repository.delete('entry-1');

			expect(collection.query).toHaveBeenCalledWith(
				Q.where('id', 'entry-1')
			);
		});
	});

	describe('getById', () => {
		it('returns entry when found', async () => {
			const mockModel = {
				id: 'entry-1',
				date: '2024-01-01',
				status: 'office',
				isAdvisory: false,
				userId: 'user-1',
				trackerId: 'tracker-1',
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: new Date('2024-01-02T00:00:00Z'),
			} as unknown as WorkEntryModelShape;

			queryBuilder.fetch.mockResolvedValueOnce([mockModel]);

			const result = await repository.getById('entry-1');

			expect(collection.query).toHaveBeenCalledWith(
				Q.where('id', 'entry-1')
			);
			expect(result).toBeInstanceOf(WorkEntry);
			expect(result?.id).toBe('entry-1');
		});

		it('returns null when entry not found', async () => {
			queryBuilder.fetch.mockResolvedValueOnce([]);

			const result = await repository.getById('entry-1');

			expect(result).toBeNull();
		});
	});

	describe('getForTracker', () => {
		it('returns entries for tracker', async () => {
			const mockModels = [
				{
					id: 'entry-1',
					date: '2024-01-01',
					status: 'office',
					isAdvisory: false,
					userId: 'user-1',
					trackerId: 'tracker-1',
					createdAt: new Date('2024-01-01T00:00:00Z'),
					updatedAt: new Date('2024-01-02T00:00:00Z'),
				},
				{
					id: 'entry-2',
					date: '2024-01-02',
					status: 'wfh',
					isAdvisory: true,
					userId: 'user-1',
					trackerId: 'tracker-1',
					createdAt: new Date('2024-01-02T00:00:00Z'),
					updatedAt: new Date('2024-01-03T00:00:00Z'),
				},
			] as unknown as WorkEntryModelShape[];

			queryBuilder.fetch.mockResolvedValueOnce(mockModels);

			const result = await repository.getForTracker('tracker-1');

			expect(collection.query).toHaveBeenCalledWith(
				Q.where('tracker_id', 'tracker-1')
			);
			expect(result).toHaveLength(2);
			expect(result[0]).toBeInstanceOf(WorkEntry);
			expect(result[1]).toBeInstanceOf(WorkEntry);
		});

		it('returns empty array when no entries found', async () => {
			queryBuilder.fetch.mockResolvedValueOnce([]);

			const result = await repository.getForTracker('tracker-1');

			expect(result).toEqual([]);
		});
	});

	describe('getForPeriod', () => {
		it('returns entries for period without tracker filter', async () => {
			const range = new DateRange(
				new Date('2024-01-01T00:00:00Z'),
				new Date('2024-01-31T23:59:59Z')
			);

			const mockModels = [
				{
					id: 'entry-1',
					date: '2024-01-15',
					status: 'office',
					isAdvisory: false,
					userId: 'user-1',
					trackerId: 'tracker-1',
					createdAt: new Date('2024-01-15T00:00:00Z'),
					updatedAt: new Date('2024-01-16T00:00:00Z'),
				},
			] as unknown as WorkEntryModelShape[];

			queryBuilder.fetch.mockResolvedValueOnce(mockModels);

			const result = await repository.getForPeriod('user-1', range);

			expect(collection.query).toHaveBeenCalled();
			const queryCalls = collection.query.mock.calls;
			expect(queryCalls.length).toBeGreaterThan(0);
			expect(queryBuilder.fetch).toHaveBeenCalled();
			expect(result).toHaveLength(1);
		});

		it('returns entries for period with tracker filter', async () => {
			const range = new DateRange(
				new Date('2024-01-01T00:00:00Z'),
				new Date('2024-01-31T23:59:59Z')
			);

			const mockModels = [
				{
					id: 'entry-1',
					date: '2024-01-15',
					status: 'office',
					isAdvisory: false,
					userId: 'user-1',
					trackerId: 'tracker-1',
					createdAt: new Date('2024-01-15T00:00:00Z'),
					updatedAt: new Date('2024-01-16T00:00:00Z'),
				},
			] as unknown as WorkEntryModelShape[];

			queryBuilder.fetch.mockResolvedValueOnce(mockModels);

			const result = await repository.getForPeriod(
				'user-1',
				range,
				'tracker-1'
			);

			expect(collection.query).toHaveBeenCalled();
			const queryCalls = collection.query.mock.calls;
			expect(queryCalls.length).toBeGreaterThan(0);
			expect(queryBuilder.fetch).toHaveBeenCalled();
			expect(result).toHaveLength(1);
		});

		it('returns empty array when no entries match period', async () => {
			const range = new DateRange(
				new Date('2024-02-01T00:00:00Z'),
				new Date('2024-02-28T23:59:59Z')
			);

			queryBuilder.fetch.mockResolvedValueOnce([]);

			const result = await repository.getForPeriod('user-1', range);

			expect(result).toEqual([]);
		});

		it('returns entries with tracker filter when trackerId is provided', async () => {
			const range = new DateRange(
				new Date('2024-01-01T00:00:00Z'),
				new Date('2024-01-31T23:59:59Z')
			);

			const mockModels = [
				{
					id: 'entry-1',
					date: '2024-01-15',
					status: 'office',
					isAdvisory: false,
					userId: 'user-1',
					trackerId: 'tracker-1',
					createdAt: new Date('2024-01-15T00:00:00Z'),
					updatedAt: new Date('2024-01-16T00:00:00Z'),
				},
				{
					id: 'entry-2',
					date: '2024-01-16',
					status: 'wfh',
					isAdvisory: true,
					notes: 'Test notes',
					userId: 'user-1',
					trackerId: 'tracker-1',
					createdAt: new Date('2024-01-16T00:00:00Z'),
					updatedAt: new Date('2024-01-17T00:00:00Z'),
				},
			] as unknown as WorkEntryModelShape[];

			queryBuilder.fetch.mockResolvedValueOnce(mockModels);

			const result = await repository.getForPeriod(
				'user-1',
				range,
				'tracker-1'
			);

			expect(result).toHaveLength(2);
			expect(result[0]).toBeInstanceOf(WorkEntry);
			expect(result[1]).toBeInstanceOf(WorkEntry);
		});
	});
});
