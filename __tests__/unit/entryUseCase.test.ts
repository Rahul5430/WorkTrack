import type { EntryDTO, ILocalEntryRepository } from '../../src/types';
import { createEntryUseCase } from '../../src/use-cases/entryUseCase';

class Local implements ILocalEntryRepository {
	private records: EntryDTO[] = [];
	async upsertMany(): Promise<void> {}
	async upsertOne(e: EntryDTO): Promise<void> {
		this.records.push(e);
	}
	async delete(): Promise<void> {}
	async getEntriesForTracker(trackerId: string): Promise<EntryDTO[]> {
		return this.records.filter((r) => r.trackerId === trackerId);
	}
	async getAllEntries(): Promise<EntryDTO[]> {
		return this.records;
	}
	async listUnsynced(): Promise<EntryDTO[]> {
		return [];
	}
	async markSynced(): Promise<void> {}
	async getFailedSyncRecords(): Promise<EntryDTO[]> {
		return [];
	}
	async getRecordsExceedingRetryLimit(): Promise<EntryDTO[]> {
		return [];
	}
}

describe('EntryUseCase', () => {
	it('validates and creates or updates entry', async () => {
		const local = new Local();
		const uc = createEntryUseCase(local);
		await uc.createOrUpdateEntry({
			trackerId: 't1',
			date: '2025-01-01',
			status: 'office',
			isAdvisory: false,
		});
		const all = await local.getAllEntries();
		expect(all).toHaveLength(1);
		expect(all[0].needsSync).toBe(true);
	});

	it('throws on invalid data', async () => {
		const local = new Local();
		const uc = createEntryUseCase(local);
		// Invalid because trackerId and date are empty
		await expect(
			uc.createOrUpdateEntry({
				trackerId: '',
				date: '',
				status: 'office',
				isAdvisory: false,
			})
		).rejects.toBeTruthy();
	});

	it('should get entries for tracker', async () => {
		const local = new Local();
		const uc = createEntryUseCase(local);

		const mockEntries: EntryDTO[] = [
			{
				id: 'entry1',
				trackerId: 'tracker1',
				date: '2025-01-01',
				status: 'office',
				isAdvisory: false,
				needsSync: true,
				lastModified: Date.now(),
			},
		];

		// Mock the repository method
		jest.spyOn(local, 'getEntriesForTracker').mockResolvedValue(
			mockEntries
		);

		const result = await uc.getEntriesForTracker('tracker1');

		expect(local.getEntriesForTracker).toHaveBeenCalledWith('tracker1');
		expect(result).toEqual(mockEntries);
	});
});

// Sync orchestrator (migrated from legacy usecases.test.ts)
describe('SyncUseCase orchestrator', () => {
	it('executes toRemote then fromRemote without errors', async () => {
		const {
			SyncToRemoteUseCaseImpl,
		} = require('../../src/use-cases/syncToRemoteUseCase');
		const {
			SyncFromRemoteUseCaseImpl,
		} = require('../../src/use-cases/syncFromRemoteUseCase');
		const { SyncUseCaseImpl } = require('../../src/use-cases/syncUseCase');

		const entryRepo = {
			listUnsynced: jest.fn().mockResolvedValue([]),
			upsertMany: jest.fn(),
			upsertOne: jest.fn(),
			delete: jest.fn(),
			markSynced: jest.fn(),
			getFailedSyncRecords: jest.fn().mockResolvedValue([]),
			getRecordsExceedingRetryLimit: jest.fn().mockResolvedValue([]),
			getEntriesForTracker: jest.fn().mockResolvedValue([]),
			getAllEntries: jest.fn().mockResolvedValue([]),
		};
		const trackerRepo = {
			create: jest.fn(),
			update: jest.fn(),
			listOwned: jest.fn().mockResolvedValue([]),
			listSharedWith: jest.fn().mockResolvedValue([]),
			ensureExists: jest.fn(),
			upsertMany: jest.fn(),
		};
		const toRemote = new SyncToRemoteUseCaseImpl(
			entryRepo,
			entryRepo,
			trackerRepo
		);
		const fromRemote = new SyncFromRemoteUseCaseImpl(
			entryRepo,
			trackerRepo,
			entryRepo,
			trackerRepo
		);
		const sync = new SyncUseCaseImpl(toRemote, fromRemote);
		await expect(sync.execute()).resolves.toBeUndefined();
	});
});
