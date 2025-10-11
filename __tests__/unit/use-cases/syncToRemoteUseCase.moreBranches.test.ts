import { SyncError } from '../../../src/errors';
import {
	EntryDTO,
	ILocalEntryRepository,
	IRemoteEntryRepository,
	ITrackerRepository,
} from '../../../src/types';
import { SyncToRemoteUseCaseImpl } from '../../../src/use-cases/syncToRemoteUseCase';

jest.mock('../../../src/logging', () => {
	const debug = jest.fn();
	const info = jest.fn();
	const warn = jest.fn();
	const error = jest.fn();
	return { logger: { debug, info, warn, error } };
});

jest.mock('@react-native-firebase/auth', () => ({
	getAuth: () => ({ currentUser: { uid: 'user1' } }),
}));

const makeLocal = (
	overrides?: Partial<ILocalEntryRepository>
): ILocalEntryRepository => ({
	upsertMany: jest.fn(),
	upsertOne: jest.fn(),
	delete: jest.fn(),
	getEntriesForTracker: jest.fn(async () => []),
	getAllEntries: jest.fn(async () => []),
	listUnsynced: jest.fn(async () => []),
	markSynced: jest.fn(async () => undefined),
	getFailedSyncRecords: jest.fn(async () => []),
	getRecordsExceedingRetryLimit: jest.fn(async () => []),
	...overrides,
});

const makeRemote = (
	overrides?: Partial<IRemoteEntryRepository>
): IRemoteEntryRepository => ({
	upsertMany: jest.fn(async () => undefined),
	upsertOne: jest.fn(),
	delete: jest.fn(),
	getEntriesForTracker: jest.fn(async () => []),
	getAllEntries: jest.fn(async () => []),
	...overrides,
});

const makeTracker = (
	overrides?: Partial<ITrackerRepository>
): ITrackerRepository => ({
	create: jest.fn(),
	update: jest.fn(),
	listOwned: jest.fn(),
	listSharedWith: jest.fn(),
	ensureExists: jest.fn(async () => undefined),
	upsertMany: jest.fn(),
	...overrides,
});

describe('SyncToRemoteUseCaseImpl - branches', () => {
	const entry = (trackerId: string, date: string): EntryDTO => ({
		id: date,
		trackerId,
		date,
		status: 'office',
		isAdvisory: false,
		needsSync: true,
		lastModified: 1,
	});

	it('returns early when there are no unsynced entries', async () => {
		const local = makeLocal({ listUnsynced: jest.fn(async () => []) });
		const remote = makeRemote();
		const tracker = makeTracker();
		const useCase = new SyncToRemoteUseCaseImpl(local, remote, tracker);
		await expect(useCase.execute()).resolves.toBeUndefined();
	});

	it('ensures trackers, groups entries, upserts and marks synced (happy path)', async () => {
		const unsynced = [
			entry('t1', '2025-01-01'),
			entry('t1', '2025-01-02'),
			entry('t2', '2025-01-03'),
		];
		const local = makeLocal({
			listUnsynced: jest.fn(async () => unsynced),
		});
		const markSynced = local.markSynced as jest.Mock;
		const remote = makeRemote();
		const upsertMany = remote.upsertMany as jest.Mock;
		const tracker = makeTracker();
		const ensureExists = tracker.ensureExists as jest.Mock;
		const useCase = new SyncToRemoteUseCaseImpl(local, remote, tracker);

		await useCase.execute();

		expect(ensureExists).toHaveBeenCalledWith('t1', 'user1');
		expect(ensureExists).toHaveBeenCalledWith('t2', 'user1');
		expect(upsertMany).toHaveBeenCalledTimes(2);
		expect(markSynced).toHaveBeenCalledWith(unsynced);
	});

	it('throws SyncError when user is unauthenticated', async () => {
		// Mock auth to return null user
		const auth = require('@react-native-firebase/auth');
		const originalGetAuth = auth.getAuth;
		auth.getAuth = jest.fn(() => ({ currentUser: null }));

		const local = makeLocal({
			listUnsynced: jest.fn(async () => [entry('t1', '2025-01-01')]),
		});
		const remote = makeRemote();
		const tracker = makeTracker();
		const useCase = new SyncToRemoteUseCaseImpl(local, remote, tracker);

		await expect(useCase.execute()).rejects.toBeInstanceOf(SyncError);

		// Restore original mock
		auth.getAuth = originalGetAuth;
	});

	it('propagates error as SyncError when remote upsert fails', async () => {
		const unsynced = [entry('t1', '2025-01-01')];
		const local = makeLocal({
			listUnsynced: jest.fn(async () => unsynced),
		});
		const remote = makeRemote({
			upsertMany: jest.fn(async () => {
				throw new Error('boom');
			}),
		});
		const tracker = makeTracker();
		const useCase = new SyncToRemoteUseCaseImpl(local, remote, tracker);
		await expect(useCase.execute()).rejects.toBeInstanceOf(SyncError);
	});
});
