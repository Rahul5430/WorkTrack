import { SyncFromRemoteUseCaseImpl } from '../src/use-cases/syncFromRemoteUseCase';
import { SyncToRemoteUseCaseImpl } from '../src/use-cases/syncToRemoteUseCase';
import { SyncUseCaseImpl } from '../src/use-cases/syncUseCase';

describe('use-cases', () => {
	it('sync orchestrates to-then-from', async () => {
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
