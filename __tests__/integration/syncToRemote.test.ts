import type { EntryDTO, ILocalEntryRepository } from '../../src/types';
import type { SyncUseCase } from '../../src/use-cases';

// Reset modules so our mocks apply cleanly
jest.resetModules();

// Minimal app mock
jest.doMock('@react-native-firebase/app', () => ({ getApp: () => ({}) }), {
	virtual: true,
});

// In-memory Firestore mock to validate paths and payloads
interface StoredDoc {
	path: string;
	data: Record<string, unknown>;
}
const writes: StoredDoc[] = [];

type CollectionRef = { __path: string };

describe('Sync to Firestore emulator', () => {
	beforeEach(() => {
		// Fresh firestore mock per test
		writes.length = 0;
		jest.doMock(
			'@react-native-firebase/firestore',
			() => {
				const connectFirestoreEmulator = () => {};
				const getFirestore = () => ({
					/* token */
				});
				const collection = (
					_db: unknown,
					...segments: string[]
				): CollectionRef => ({
					__path: segments.join('/'),
				});
				const doc = (
					base: unknown | CollectionRef,
					...segments: string[]
				): { __path: string } => {
					if (
						typeof base === 'object' &&
						base !== null &&
						'__path' in (base as CollectionRef)
					) {
						return {
							__path: `${(base as CollectionRef).__path}/${segments.join('/')}`,
						};
					}
					return { __path: segments.join('/') };
				};
				const setDoc = (
					ref: { __path: string },
					data: Record<string, unknown>
				) => {
					writes.push({ path: ref.__path, data });
					return Promise.resolve();
				};
				const getDoc = async (ref: { __path: string }) => {
					ref;
					return { exists: () => false };
				};
				const getDocs = async () => ({
					docs: [] as unknown[],
				});
				const query = () => ({
					/* noop */
				});
				const where = () => ({
					/* noop */
				});
				const Timestamp = {
					fromDate: (d: Date) => ({ toMillis: () => d.getTime() }),
					fromMillis: (ms: number) => ({ toMillis: () => ms }),
				};
				return {
					connectFirestoreEmulator,
					getFirestore,
					collection,
					doc,
					setDoc,
					getDoc,
					getDocs,
					query,
					where,
					Timestamp,
					FirebaseFirestoreTypes: { Module: class {} },
				};
			},
			{ virtual: true }
		);
	});

	it('uploads local unsynced entries and marks them synced', async () => {
		// Load after mocks
		const { createDefaultContainer } = require('../../src/di/container');
		const {
			FirebaseEntryRepository,
			FirebaseTrackerRepository,
		} = require('../../src/repositories');
		const { createSyncUseCase } = require('../../src/use-cases');
		const {
			SyncToRemoteUseCaseImpl,
		} = require('../../src/use-cases/syncToRemoteUseCase');

		const container = createDefaultContainer();

		// Replace the local entries repo with in-memory implementation, and rewire sync to use it
		const local = new InMemoryLocalEntries();
		container.entries = local;

		// Seed one unsynced entry
		const trackerId = 'tracker_test_1';
		const entry: EntryDTO = {
			id: '2025-01-01',
			trackerId,
			date: '2025-01-01',
			status: 'office',
			isAdvisory: false,
			needsSync: true,
			lastModified: Date.now(),
		};
		await local.upsertOne(entry);

		// Sanity checks on resolved deps
		expect(container.firebaseEntries).toBeInstanceOf(
			FirebaseEntryRepository
		);
		expect(container.trackers).toBeInstanceOf(FirebaseTrackerRepository);

		// Rebuild sync use case with our in-memory entries and existing remote deps
		const customSyncTo = new SyncToRemoteUseCaseImpl(
			local,
			container.firebaseEntries,
			container.trackers
		);
		const noOpFromRemote = { execute: async () => {} };
		const sync: SyncUseCase = createSyncUseCase(
			customSyncTo,
			noOpFromRemote
		);

		// Execute sync (to remote first)
		await sync.execute();

		// Verify a write occurred under trackers/{trackerId}/entries/{id}
		const targetPath = `trackers/${trackerId}/entries/${entry.id}`;
		expect(writes.some((w) => w.path === targetPath)).toBe(true);

		// Verify local entry marked as synced
		const after = await local.getEntriesForTracker(trackerId);
		expect(after.find((e) => e.id === entry.id)?.needsSync).toBe(false);
	});
});

// Helper to create an in-memory local entries repository
class InMemoryLocalEntries implements ILocalEntryRepository {
	private records: EntryDTO[] = [];

	async upsertOne(entry: EntryDTO): Promise<void> {
		const idx = this.records.findIndex((e) => e.id === entry.id);
		if (idx >= 0) this.records[idx] = entry;
		else this.records.push(entry);
	}
	async upsertMany(trackerId: string, entries: EntryDTO[]): Promise<void> {
		trackerId;
		for (const e of entries) await this.upsertOne(e);
	}
	async delete(_entryId: string): Promise<void> {
		this.records = this.records.filter((e) => e.id !== _entryId);
	}
	async listUnsynced(): Promise<EntryDTO[]> {
		return this.records.filter((e) => e.needsSync);
	}
	async markSynced(entries: EntryDTO[]): Promise<void> {
		const ids = new Set(entries.map((e) => e.id));
		this.records = this.records.map((e) =>
			ids.has(e.id)
				? { ...e, needsSync: false, lastModified: e.lastModified }
				: e
		);
	}
	async getFailedSyncRecords(): Promise<EntryDTO[]> {
		return [];
	}
	async getRecordsExceedingRetryLimit(): Promise<EntryDTO[]> {
		return [];
	}
	async getEntriesForTracker(trackerId: string): Promise<EntryDTO[]> {
		return this.records.filter((e) => e.trackerId === trackerId);
	}
	async listUnsyncedForTracker(): Promise<EntryDTO[]> {
		return [];
	}
	async getAllEntries(): Promise<EntryDTO[]> {
		return this.records;
	}
}
