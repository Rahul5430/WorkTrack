import type {
	EntryDTO,
	ILocalEntryRepository,
	IRemoteEntryRepository,
	ITrackerRepository,
	TrackerDTO,
} from '../../src/types';
import { createUserManagementUseCase } from '../../src/use-cases/userManagementUseCase';

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
});
