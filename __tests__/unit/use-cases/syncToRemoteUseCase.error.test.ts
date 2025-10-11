import type {
	EntryDTO,
	ILocalEntryRepository,
	IRemoteEntryRepository,
	ITrackerRepository,
} from '../../../src/types';
import { SyncToRemoteUseCaseImpl } from '../../../src/use-cases/syncToRemoteUseCase';

jest.mock('@react-native-firebase/auth', () => ({
	getAuth: () => ({ currentUser: { uid: 'me' } }),
}));

describe('SyncToRemoteUseCase error path', () => {
	it('wraps underlying error and throws SyncError', async () => {
		const local: ILocalEntryRepository = {
			listUnsynced: jest.fn(async () => [
				{
					id: 'd',
					trackerId: 't1',
					date: '2025-01-01',
					status: 'office',
					isAdvisory: false,
					needsSync: true,
					lastModified: Date.now(),
				} as EntryDTO,
			]),
			markSynced: jest.fn(async () => {}),
			upsertMany: jest.fn(),
			upsertOne: jest.fn(),
			delete: jest.fn(),
			getEntriesForTracker: jest.fn(),
			getAllEntries: jest.fn(),
			getFailedSyncRecords: jest.fn(),
			getRecordsExceedingRetryLimit: jest.fn(),
		} as unknown as ILocalEntryRepository;
		const remote: IRemoteEntryRepository = {
			upsertMany: jest.fn(async () => {
				throw new Error('boom');
			}),
			upsertOne: jest.fn(),
			getEntriesForTracker: jest.fn(),
			getAllEntries: jest.fn(),
			delete: jest.fn(),
		} as unknown as IRemoteEntryRepository;
		const trackers: ITrackerRepository = {
			ensureExists: jest.fn(async () => {}),
			listOwned: jest.fn(),
		} as unknown as ITrackerRepository;

		const uc = new SyncToRemoteUseCaseImpl(local, remote, trackers);
		await expect(uc.execute()).rejects.toMatchObject({
			code: 'sync.to_remote_failed',
		});
	});
});
