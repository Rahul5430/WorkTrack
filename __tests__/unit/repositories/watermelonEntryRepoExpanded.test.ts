import { WatermelonEntryRepository } from '../../../src/repositories/watermelonEntryRepository';

// Mock WatermelonDB in module mock below

jest.mock('../../../src/db/watermelon', () => ({
	database: {
		write: jest.fn(),
		get: jest.fn(() => ({
			query: jest.fn(() => ({
				fetch: jest.fn(),
			})),
			find: jest.fn(),
			create: jest.fn(),
		})),
	},
}));

jest.mock('@nozbe/watermelondb', () => ({
	Q: {
		where: jest.fn(),
	},
}));

jest.mock('../../../src/mappers/entryMapper', () => ({
	entryDTOToModelData: (entry: {
		id: string;
		trackerId: string;
		date: string;
		status: string;
		isAdvisory: boolean;
		needsSync?: boolean;
		lastModified?: number;
	}) => ({
		...entry,
		needsSync: entry.needsSync ?? true,
	}),
	entryModelToDTO: (model: {
		id: string;
		trackerId: string;
		date: string;
		status: string;
		isAdvisory: boolean;
		needsSync: boolean;
		lastModified: number;
	}) => ({
		id: model.id,
		trackerId: model.trackerId,
		date: model.date,
		status: model.status,
		isAdvisory: model.isAdvisory,
		needsSync: model.needsSync,
		lastModified: model.lastModified,
	}),
}));

describe('WatermelonEntryRepository (expanded)', () => {
	let repo: WatermelonEntryRepository;

	beforeEach(() => {
		repo = new WatermelonEntryRepository();
		jest.clearAllMocks();
		// Reset mock implementations
		const { database } = require('../../../src/db/watermelon');
		database.write.mockImplementation(
			async (fn: () => Promise<void> | void) => {
				await fn();
			}
		);
	});

	describe('upsertMany', () => {
		it('creates new entries when they do not exist', async () => {
			const entries = [
				{
					id: '2025-01-01',
					trackerId: 'tracker1',
					date: '2025-01-01',
					status: 'office',
					isAdvisory: false,
					needsSync: true,
					lastModified: Date.now(),
				},
			];
			const mockCollection = {
				query: jest.fn(() => ({ fetch: jest.fn() })),
				find: jest.fn().mockRejectedValue(new Error('Not found')),
				create: jest.fn(),
			};
			const { database } = require('../../../src/db/watermelon');
			database.get.mockReturnValue(mockCollection);

			await repo.upsertMany('tracker1', entries);

			expect(mockCollection.create).toHaveBeenCalledWith(
				expect.any(Function)
			);
		});

		it('updates existing entries', async () => {
			const entries = [
				{
					id: '2025-01-01',
					trackerId: 'tracker1',
					date: '2025-01-01',
					status: 'home',
					isAdvisory: true,
					needsSync: true,
					lastModified: Date.now(),
				},
			];
			const mockEntry = {
				update: jest.fn(),
			};
			const mockCollection = {
				query: jest.fn(() => ({ fetch: jest.fn() })),
				find: jest.fn().mockResolvedValue(mockEntry),
				create: jest.fn(),
			};
			const { database } = require('../../../src/db/watermelon');
			database.get.mockReturnValue(mockCollection);

			await repo.upsertMany('tracker1', entries);

			expect(mockEntry.update).toHaveBeenCalledWith(expect.any(Function));
		});

		it('handles database write errors', async () => {
			const entries = [
				{
					id: '2025-01-01',
					trackerId: 'tracker1',
					date: '2025-01-01',
					status: 'office',
					isAdvisory: false,
					needsSync: true,
					lastModified: Date.now(),
				},
			];
			const { database } = require('../../../src/db/watermelon');
			database.write.mockRejectedValue(new Error('Write error'));

			await expect(repo.upsertMany('tracker1', entries)).rejects.toThrow(
				'Write error'
			);
		});
	});

	describe('markSynced', () => {
		it('marks entries as synced', async () => {
			const entries = [
				{
					id: '2025-01-01',
					trackerId: 'tracker1',
					date: '2025-01-01',
					status: 'office',
					isAdvisory: false,
					needsSync: true,
					lastModified: Date.now(),
				},
			];
			const mockEntry = {
				update: jest.fn(),
			};
			const mockCollection = {
				query: jest.fn(() => ({ fetch: jest.fn() })),
				find: jest.fn().mockResolvedValue(mockEntry),
				create: jest.fn(),
			};
			const { database } = require('../../../src/db/watermelon');
			database.get.mockReturnValue(mockCollection);

			await repo.markSynced(entries);

			expect(mockEntry.update).toHaveBeenCalledWith(expect.any(Function));
		});

		it('handles missing entries gracefully', async () => {
			const entries = [
				{
					id: '2025-01-01',
					trackerId: 'tracker1',
					date: '2025-01-01',
					status: 'office',
					isAdvisory: false,
					needsSync: true,
					lastModified: Date.now(),
				},
			];
			const mockCollection = {
				query: jest.fn(() => ({ fetch: jest.fn() })),
				find: jest.fn().mockRejectedValue(new Error('Not found')),
				create: jest.fn(),
			};
			const { database } = require('../../../src/db/watermelon');
			database.get.mockReturnValue(mockCollection);

			await expect(repo.markSynced(entries)).rejects.toThrow('Not found');
		});

		it('handles database write errors', async () => {
			const entries = [
				{
					id: '2025-01-01',
					trackerId: 'tracker1',
					date: '2025-01-01',
					status: 'office',
					isAdvisory: false,
					needsSync: true,
					lastModified: Date.now(),
				},
			];
			const { database } = require('../../../src/db/watermelon');
			database.write.mockRejectedValue(new Error('Write error'));

			await expect(repo.markSynced(entries)).rejects.toThrow(
				'Write error'
			);
		});
	});

	describe('listUnsynced', () => {
		it('returns unsynced entries', async () => {
			const mockEntries = [
				{
					id: '2025-01-01',
					trackerId: 'tracker1',
					date: '2025-01-01',
					status: 'office',
					isAdvisory: false,
					needsSync: true,
					lastModified: Date.now(),
				},
			];
			const mockQuery = {
				fetch: jest.fn().mockResolvedValue(mockEntries),
			};
			const mockCollection = {
				query: jest.fn().mockReturnValue(mockQuery),
				find: jest.fn(),
				create: jest.fn(),
			};
			const { database } = require('../../../src/db/watermelon');
			database.get.mockReturnValue(mockCollection);

			const result = await repo.listUnsynced();

			expect(result).toHaveLength(1);
			expect(result[0]).toMatchObject({
				id: '2025-01-01',
				trackerId: 'tracker1',
				status: 'office',
			});
		});

		it('handles database query errors', async () => {
			const mockQuery = {
				fetch: jest.fn().mockRejectedValue(new Error('Query error')),
			};
			const mockCollection = {
				query: jest.fn().mockReturnValue(mockQuery),
				find: jest.fn(),
				create: jest.fn(),
			};

			let promise: Promise<unknown> | undefined;
			let restore: (() => void) | undefined;
			jest.isolateModules(() => {
				const { database } = require('../../../src/db/watermelon');
				database.get.mockReturnValue(mockCollection);
				const logging = require('../../../src/logging');
				const errorSpy = jest
					.spyOn(logging.logger, 'error')
					.mockImplementation(() => {});
				restore = () => errorSpy.mockRestore();
				const {
					WatermelonEntryRepository: LocalRepo,
				} = require('../../../src/repositories/watermelonEntryRepository');
				const localRepo = new LocalRepo();
				promise = localRepo.listUnsynced();
			});

			try {
				await expect(promise as Promise<unknown>).rejects.toMatchObject(
					{
						name: 'SyncError',
					}
				);
			} finally {
				if (restore) restore();
			}
		});
	});
});
