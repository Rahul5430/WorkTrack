import type {
	EntryDTO,
	ILocalEntryRepository,
	ITrackerRepository,
	TrackerDTO,
} from '../../src/types';
import type { SyncUseCase } from '../../src/use-cases';

describe('Sync from Firestore emulator to local', () => {
	it('pulls remote tracker + entry and persists locally', async () => {
		// Remote data to be exposed by stubs
		const userId = 'test-user';
		const tracker: TrackerDTO = {
			id: 'tracker_remote_1',
			name: 'Remote Tracker',
			color: '#123456',
			ownerId: userId,
			isDefault: false,
			trackerType: 'work',
		};
		const entry: EntryDTO = {
			id: '2025-02-01',
			trackerId: tracker.id,
			date: '2025-02-01',
			status: 'office',
			isAdvisory: false,
			needsSync: false,
			lastModified: Date.now(),
		};

		// Load after base mocks
		const { createDefaultContainer } = require('../../src/di/container');
		const { createSyncUseCase } = require('../../src/use-cases');
		const {
			SyncFromRemoteUseCaseImpl,
		} = require('../../src/use-cases/syncFromRemoteUseCase');

		// Local in-memory implementations
		class LocalEntries implements ILocalEntryRepository {
			private records: EntryDTO[] = [];
			async upsertMany(
				_trackerId: string,
				entries: EntryDTO[]
			): Promise<void> {
				for (const e of entries) await this.upsertOne(e);
			}
			async upsertOne(e: EntryDTO): Promise<void> {
				const i = this.records.findIndex((r) => r.id === e.id);
				if (i >= 0) this.records[i] = e;
				else this.records.push(e);
			}
			async delete(entryId: string): Promise<void> {
				this.records = this.records.filter((r) => r.id !== entryId);
			}
			async getEntriesForTracker(trackerId: string): Promise<EntryDTO[]> {
				return this.records.filter((r) => r.trackerId === trackerId);
			}
			async getAllEntries(): Promise<EntryDTO[]> {
				return this.records;
			}
			async listUnsynced(): Promise<EntryDTO[]> {
				return this.records.filter((e) => e.needsSync);
			}
			async markSynced(entries: EntryDTO[]): Promise<void> {
				const ids = new Set(entries.map((e) => e.id));
				this.records = this.records.map((e) =>
					ids.has(e.id) ? { ...e, needsSync: false } : e
				);
			}
			async getFailedSyncRecords(): Promise<EntryDTO[]> {
				return [];
			}
			async getRecordsExceedingRetryLimit(
				_limit: number
			): Promise<EntryDTO[]> {
				void _limit;
				return [];
			}
		}

		class LocalTrackers implements ITrackerRepository {
			private records: TrackerDTO[] = [];
			async create(t: TrackerDTO): Promise<void> {
				this.records.push(t);
			}
			async update(
				t: Partial<TrackerDTO> & { id: string }
			): Promise<void> {
				this.records = this.records.map((r) =>
					r.id === t.id ? ({ ...r, ...t } as TrackerDTO) : r
				);
			}
			async listOwned(ownerId: string): Promise<TrackerDTO[]> {
				return this.records.filter((r) => r.ownerId === ownerId);
			}
			async listSharedWith(_userId: string): Promise<TrackerDTO[]> {
				void _userId;
				return [];
			}
			async ensureExists(id: string, ownerId: string): Promise<void> {
				if (!this.records.find((r) => r.id === id)) {
					this.records.push({ ...tracker, id, ownerId });
				}
			}
			async upsertMany(ts: TrackerDTO[]): Promise<void> {
				for (const t of ts) {
					const i = this.records.findIndex((r) => r.id === t.id);
					if (i >= 0) this.records[i] = t;
					else this.records.push(t);
				}
			}
		}

		// Remote stubs
		class RemoteTrackers implements ITrackerRepository {
			async create(): Promise<void> {
				/* not used */
			}
			async update(): Promise<void> {
				/* not used */
			}
			async listOwned(ownerId: string): Promise<TrackerDTO[]> {
				return ownerId === userId ? [tracker] : [];
			}
			async listSharedWith(_userId: string): Promise<TrackerDTO[]> {
				void _userId;
				return [];
			}
			async ensureExists(): Promise<void> {
				/* not used */
			}
			async upsertMany(): Promise<void> {
				/* not used */
			}
		}
		class RemoteEntries {
			async upsertMany(): Promise<void> {
				/* not used */
			}
			async upsertOne(): Promise<void> {
				/* not used */
			}
			async delete(): Promise<void> {
				/* not used */
			}
			async getEntriesForTracker(trackerId: string): Promise<EntryDTO[]> {
				return trackerId === tracker.id ? [entry] : [];
			}
			async getAllEntries(): Promise<EntryDTO[]> {
				return [entry];
			}
		}

		const container = createDefaultContainer();

		// Inject locals and remotes
		const localEntries = new LocalEntries();
		const localTrackers = new LocalTrackers();
		const remoteTrackers = new RemoteTrackers();
		const remoteEntries = new RemoteEntries();

		container.entries = localEntries;
		container.localTrackers = localTrackers;
		container.trackers = remoteTrackers;
		container.firebaseEntries = remoteEntries;

		// Build sync use case using our injected repos
		const {
			SyncToRemoteUseCaseImpl,
		} = require('../../src/use-cases/syncToRemoteUseCase');
		const toRemote = new SyncToRemoteUseCaseImpl(
			localEntries,
			remoteEntries,
			remoteTrackers
		);
		const fromRemote = new SyncFromRemoteUseCaseImpl(
			localEntries,
			remoteTrackers,
			remoteEntries,
			localTrackers
		);
		const sync: SyncUseCase = createSyncUseCase(toRemote, fromRemote);

		await sync.execute();

		// Validate local state
		const localOwned = await localTrackers.listOwned(userId);
		expect(localOwned.find((t) => t.id === tracker.id)).toBeTruthy();
		const localEntriesForTracker = await localEntries.getEntriesForTracker(
			tracker.id
		);
		expect(
			localEntriesForTracker.find((e) => e.id === entry.id)
		).toBeTruthy();
		expect(
			localEntriesForTracker.find((e) => e.id === entry.id)?.needsSync
		).toBe(false);
	});
});
