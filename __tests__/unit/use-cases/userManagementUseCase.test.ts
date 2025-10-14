import type {
	EntryDTO,
	ILocalEntryRepository,
	IRemoteEntryRepository,
	ITrackerRepository,
	TrackerDTO,
} from '../../../src/types';
import { createUserManagementUseCase } from '../../../src/use-cases/userManagementUseCase';

class LocalEntries implements ILocalEntryRepository {
	private records: EntryDTO[] = [];
	async upsertMany(): Promise<void> {}
	async upsertOne(): Promise<void> {}
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

class RemoteEntries implements IRemoteEntryRepository {
	async upsertMany(): Promise<void> {}
	async upsertOne(): Promise<void> {}
	async delete(): Promise<void> {}
	async getEntriesForTracker(): Promise<EntryDTO[]> {
		return [];
	}
	async getAllEntries(): Promise<EntryDTO[]> {
		return [];
	}
}

class Trackers implements ITrackerRepository {
	constructor(private records: TrackerDTO[] = []) {}
	async create(t: TrackerDTO): Promise<void> {
		this.records.push(t);
	}
	async update(): Promise<void> {}
	async listOwned(userId: string): Promise<TrackerDTO[]> {
		return this.records.filter((r) => r.ownerId === userId);
	}
	async listSharedWith(): Promise<TrackerDTO[]> {
		return [];
	}
	async ensureExists(): Promise<void> {}
	async upsertMany(): Promise<void> {}
}

describe('UserManagementUseCase', () => {
	it('creates default tracker when none exists', async () => {
		const trackers = new Trackers([]);
		const local = new LocalEntries();
		const remote = new RemoteEntries();
		const uc = createUserManagementUseCase(trackers, local, remote);
		const t = await uc.ensureUserHasTracker('u1');
		expect(t.ownerId).toBe('u1');
		expect(t.isDefault).toBe(true);
	});

	it('getTrackerByOwnerId returns existing tracker', async () => {
		const trackers = new Trackers([
			{
				id: 't1',
				ownerId: 'u2',
				name: 'Work',
				color: '#000',
				isDefault: true,
				trackerType: 'work',
			},
		]);
		const uc = createUserManagementUseCase(
			trackers,
			new LocalEntries(),
			new RemoteEntries()
		);
		const t = await uc.getTrackerByOwnerId('u2');
		expect(t?.id).toBe('t1');
	});

	describe('initializeUserData', () => {
		it('returns existing tracker from local database', async () => {
			const existingTracker = {
				id: 't1',
				ownerId: 'u1',
				name: 'Work',
				color: '#000',
				isDefault: true,
				trackerType: 'work',
			};
			const trackers = new Trackers([existingTracker]);
			const local = new LocalEntries();
			const remote = new RemoteEntries();
			const uc = createUserManagementUseCase(trackers, local, remote);

			const result = await uc.initializeUserData('u1');
			expect(result).toEqual(existingTracker);
		});

		it('creates default tracker for new user', async () => {
			const trackers = new Trackers([]);
			const local = new LocalEntries();
			const remote = new RemoteEntries();
			const uc = createUserManagementUseCase(trackers, local, remote);

			const result = await uc.initializeUserData('u1');
			expect(result.ownerId).toBe('u1');
			expect(result.isDefault).toBe(true);
			expect(result.name).toBe('Work Tracker');
			expect(result.color).toBe('#4CAF50');
			expect(result.trackerType).toBe('work');
		});

		it('creates default tracker for returning user when sync fails', async () => {
			const trackers = new Trackers([]);
			const local = new LocalEntries();
			const remote = new RemoteEntries();
			const uc = createUserManagementUseCase(trackers, local, remote);

			const result = await uc.initializeUserData('u1');
			expect(result.ownerId).toBe('u1');
			expect(result.isDefault).toBe(true);
		});

		it('returns synced tracker for returning user', async () => {
			const syncedTracker = {
				id: 't1',
				ownerId: 'u1',
				name: 'Work',
				color: '#000',
				isDefault: true,
				trackerType: 'work',
			};
			const trackers = new Trackers([syncedTracker]);
			const local = new LocalEntries();
			const remote = new RemoteEntries();
			const uc = createUserManagementUseCase(trackers, local, remote);

			const result = await uc.initializeUserData('u1');
			expect(result).toEqual(syncedTracker);
		});

		it('handles error when checking if user is new', async () => {
			const trackers = new Trackers([]);
			const local = new LocalEntries();
			const remote = new RemoteEntries();
			// Mock getAllEntries to throw error
			remote.getAllEntries = jest
				.fn()
				.mockRejectedValue(new Error('Network error'));
			const uc = createUserManagementUseCase(trackers, local, remote);

			const result = await uc.initializeUserData('u1');
			expect(result.ownerId).toBe('u1');
			expect(result.isDefault).toBe(true);
		});

		it('detects new user when no entries exist', async () => {
			const trackers = new Trackers([]);
			const local = new LocalEntries();
			const remote = new RemoteEntries();
			// Mock getAllEntries to return empty array
			remote.getAllEntries = jest.fn().mockResolvedValue([]);
			const uc = createUserManagementUseCase(trackers, local, remote);

			const result = await uc.initializeUserData('u1');
			expect(result.ownerId).toBe('u1');
			expect(result.isDefault).toBe(true);
		});

		it('detects returning user when entries exist', async () => {
			const trackers = new Trackers([]);
			const local = new LocalEntries();
			const remote = new RemoteEntries();
			// Mock getAllEntries to return entries with user's trackerId
			remote.getAllEntries = jest.fn().mockResolvedValue([
				{
					id: 'e1',
					trackerId: 'tracker_u1_123',
					date: '2025-01-01',
					status: 'office',
					isAdvisory: false,
					needsSync: true,
					lastModified: Date.now(),
				},
			]);
			const uc = createUserManagementUseCase(trackers, local, remote);

			const result = await uc.initializeUserData('u1');
			expect(result.ownerId).toBe('u1');
			expect(result.isDefault).toBe(true);
		});
	});

	describe('getTrackerByOwnerId', () => {
		it('returns null when no tracker found', async () => {
			const trackers = new Trackers([]);
			const local = new LocalEntries();
			const remote = new RemoteEntries();
			const uc = createUserManagementUseCase(trackers, local, remote);

			const result = await uc.getTrackerByOwnerId('u1');
			expect(result).toBeNull();
		});

		it('throws error for empty ownerId', async () => {
			const trackers = new Trackers([]);
			const local = new LocalEntries();
			const remote = new RemoteEntries();
			const uc = createUserManagementUseCase(trackers, local, remote);

			await expect(uc.getTrackerByOwnerId('')).rejects.toThrow();
		});
	});

	describe('ensureUserHasTracker', () => {
		it('throws error for empty userId', async () => {
			const trackers = new Trackers([]);
			const local = new LocalEntries();
			const remote = new RemoteEntries();
			const uc = createUserManagementUseCase(trackers, local, remote);

			await expect(uc.ensureUserHasTracker('')).rejects.toThrow();
		});
	});
});
