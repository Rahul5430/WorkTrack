import { getFirestoreInstance } from '../../../src/services';
import type { EntryDTO } from '../../../src/types';

type RepoAPI = {
	upsertMany: (trackerId: string, entries: EntryDTO[]) => Promise<void>;
	getEntriesForTracker: (trackerId: string) => Promise<EntryDTO[]>;
	getAllEntries: () => Promise<EntryDTO[]>;
	delete: (entryId: string) => Promise<void>;
};

jest.mock('../../../src/services', () => ({
	getFirestoreInstance: jest.fn(),
}));

const mockDb = {} as unknown as object;

describe('FirebaseEntryRepository (isolated)', () => {
	beforeEach(() => {
		(getFirestoreInstance as unknown as jest.Mock).mockReturnValue(mockDb);
		jest.resetModules();
		jest.clearAllMocks();
	});

	it('upsertMany sets docs with merge', async () => {
		const collection = jest.fn(() => ({}));
		const doc = jest.fn(() => ({}));
		const setDoc = jest.fn(async () => {});
		const Timestamp = {
			fromDate: (d: Date) => ({ toMillis: () => d.getTime() }),
			fromMillis: (ms: number) => ({ toMillis: () => ms }),
		};
		let repo: RepoAPI;
		jest.isolateModules(() => {
			jest.doMock('../../../src/mappers/entryMapper', () => {
				type FirestoreEntry = {
					id?: string;
					trackerId?: string;
					date?: string;
					status?: string;
					isAdvisory?: boolean;
					needsSync?: boolean;
					lastModified?: number | { toMillis: () => number };
					createdAt?: number | { toMillis: () => number };
				};
				const toMillis = (
					v?: number | { toMillis: () => number }
				): number => {
					if (typeof v === 'number') return v;
					if (v && typeof v.toMillis === 'function')
						return v.toMillis();
					return Date.now();
				};
				return {
					entryDTOToFirestore: (e: EntryDTO) => ({ ...e }),
					entryFirestoreToDTO: (d: FirestoreEntry): EntryDTO => ({
						id: d.id ?? '',
						trackerId: d.trackerId ?? 't1',
						date: d.date ?? '',
						status: (d.status as EntryDTO['status']) ?? 'office',
						isAdvisory: Boolean(d.isAdvisory ?? false),
						needsSync: Boolean(d.needsSync ?? false),
						lastModified: toMillis(d.lastModified),
					}),
				};
			});
			jest.doMock('@react-native-firebase/firestore', () => ({
				collection,
				doc,
				setDoc,
				Timestamp,
			}));
			const {
				FirebaseEntryRepository,
			} = require('../../../src/repositories/firebaseEntryRepository');
			repo = new FirebaseEntryRepository() as RepoAPI;
		});
		const entries: EntryDTO[] = [
			{
				id: '2025-01-01',
				trackerId: 't1',
				date: '2025-01-01',
				status: 'office',
				isAdvisory: false,
				needsSync: true,
				lastModified: Date.now(),
			},
		];
		await repo!.upsertMany('t1', entries);
		expect(collection).toHaveBeenCalled();
		expect(doc).toHaveBeenCalled();
		expect(setDoc).toHaveBeenCalledWith(
			expect.any(Object),
			expect.objectContaining({ status: 'office' }),
			{ merge: true }
		);
	});

	it('upsertMany throws SyncError on failure', async () => {
		const collection = jest.fn(() => ({}));
		const doc = jest.fn(() => ({}));
		const setDoc = jest.fn(async () => {
			throw new Error('firestore set error');
		});
		let repo!: RepoAPI;
		jest.isolateModules(() => {
			jest.doMock('../../../src/mappers/entryMapper', () => {
				type FirestoreEntry = {
					id?: string;
					trackerId?: string;
					date?: string;
					status?: string;
					isAdvisory?: boolean;
					needsSync?: boolean;
					lastModified?: number | { toMillis: () => number };
					createdAt?: number | { toMillis: () => number };
				};
				const toMillis = (
					v?: number | { toMillis: () => number }
				): number => {
					if (typeof v === 'number') return v;
					if (v && typeof v.toMillis === 'function')
						return v.toMillis();
					return Date.now();
				};
				return {
					entryDTOToFirestore: (e: EntryDTO) => ({ ...e }),
					entryFirestoreToDTO: (d: FirestoreEntry): EntryDTO => ({
						id: d.id ?? '',
						trackerId: d.trackerId ?? 't1',
						date: d.date ?? '',
						status: (d.status as EntryDTO['status']) ?? 'office',
						isAdvisory: Boolean(d.isAdvisory ?? false),
						needsSync: Boolean(d.needsSync ?? false),
						lastModified: toMillis(d.lastModified),
					}),
				};
			});
			jest.doMock('@react-native-firebase/firestore', () => ({
				collection,
				doc,
				setDoc,
			}));
			const {
				FirebaseEntryRepository,
			} = require('../../../src/repositories/firebaseEntryRepository');
			repo = new FirebaseEntryRepository() as RepoAPI;
		});
		await expect(
			repo!.upsertMany('t1', [
				{
					id: '2025-01-01',
					trackerId: 't1',
					date: '2025-01-01',
					status: 'office',
					isAdvisory: false,
					needsSync: true,
					lastModified: Date.now(),
				},
			])
		).rejects.toMatchObject({ code: 'firestore.upsert_failed' });
	});

	it('getEntriesForTracker returns mapped entries and handles permission denied', async () => {
		const collection = jest.fn(() => ({}));
		const docs = [
			{
				id: '2025-01-01',
				data: () => ({
					date: '2025-01-01',
					status: 'office',
					isAdvisory: false,
					createdAt: { toMillis: () => Date.now() },
					lastModified: { toMillis: () => Date.now() },
				}),
			},
		];
		let phase = 0;
		const getDocs = jest.fn(async () => {
			if (phase === 0) {
				return {
					forEach: (
						cb: (d: {
							id: string;
							data: () => Record<string, unknown>;
						}) => void
					) => docs.forEach(cb),
				};
			}
			throw { code: 'firestore/permission-denied' };
		});
		let repo: RepoAPI;
		jest.isolateModules(() => {
			jest.doMock('../../../src/mappers/entryMapper', () => {
				type FirestoreEntry = {
					id?: string;
					trackerId?: string;
					date?: string;
					status?: string;
					isAdvisory?: boolean;
					needsSync?: boolean;
					lastModified?: number | { toMillis: () => number };
					createdAt?: number | { toMillis: () => number };
				};
				const toMillis = (
					v?: number | { toMillis: () => number }
				): number => {
					if (typeof v === 'number') return v;
					if (v && typeof v.toMillis === 'function')
						return v.toMillis();
					return Date.now();
				};
				return {
					entryDTOToFirestore: (e: EntryDTO) => ({ ...e }),
					entryFirestoreToDTO: (d: FirestoreEntry): EntryDTO => ({
						id: d.id ?? '',
						trackerId: d.trackerId ?? 't1',
						date: d.date ?? '',
						status: (d.status as EntryDTO['status']) ?? 'office',
						isAdvisory: Boolean(d.isAdvisory ?? false),
						needsSync: Boolean(d.needsSync ?? false),
						lastModified: toMillis(d.lastModified),
					}),
				};
			});
			jest.doMock('@react-native-firebase/firestore', () => ({
				collection,
				getDocs,
				Timestamp: {
					fromDate: (d: Date) => ({ toMillis: () => d.getTime() }),
					fromMillis: (ms: number) => ({ toMillis: () => ms }),
				},
			}));
			const {
				FirebaseEntryRepository,
			} = require('../../../src/repositories/firebaseEntryRepository');
			repo = new FirebaseEntryRepository() as RepoAPI;
		});
		const ok = await repo!.getEntriesForTracker('t1');
		expect(ok).toHaveLength(1);
		phase = 1;
		const empty = await repo!.getEntriesForTracker('t1');
		expect(empty).toEqual([]);
	});

	it('getAllEntries aggregates and errors', async () => {
		const collection = jest.fn(() => ({}));
		const trackerDocs = [{ id: 't1' }];
		const entryDocs = [
			{
				id: '2025-01-01',
				data: () => ({ date: '2025-01-01', status: 'office' }),
			},
		];
		let mode: 'ok' | 'entries' | 'permDenied' | 'err' = 'ok';
		const getDocs = jest.fn(async () => {
			if (mode === 'ok') {
				mode = 'entries';
				return { docs: trackerDocs };
			}
			if (mode === 'entries') {
				mode = 'permDenied';
				return {
					forEach: (
						cb: (d: {
							id: string;
							data: () => Record<string, unknown>;
						}) => void
					) => entryDocs.forEach(cb),
				};
			}
			if (mode === 'permDenied') {
				// simulate permission denied on getDocs
				mode = 'err';
				throw { code: 'firestore/permission-denied' };
			}
			throw new Error('boom');
		});
		let repo: RepoAPI;
		jest.isolateModules(() => {
			jest.doMock('../../../src/mappers/entryMapper', () => {
				type FirestoreEntry = {
					id?: string;
					trackerId?: string;
					date?: string;
					status?: string;
					isAdvisory?: boolean;
					needsSync?: boolean;
					lastModified?: number | { toMillis: () => number };
					createdAt?: number | { toMillis: () => number };
				};
				const toMillis = (
					v?: number | { toMillis: () => number }
				): number => {
					if (typeof v === 'number') return v;
					if (v && typeof v.toMillis === 'function')
						return v.toMillis();
					return Date.now();
				};
				return {
					entryDTOToFirestore: (e: EntryDTO) => ({ ...e }),
					entryFirestoreToDTO: (d: FirestoreEntry): EntryDTO => ({
						id: d.id ?? '',
						trackerId: d.trackerId ?? 't1',
						date: d.date ?? '',
						status: (d.status as EntryDTO['status']) ?? 'office',
						isAdvisory: Boolean(d.isAdvisory ?? false),
						needsSync: Boolean(d.needsSync ?? false),
						lastModified: toMillis(d.lastModified),
					}),
				};
			});
			jest.doMock('@react-native-firebase/firestore', () => ({
				collection,
				getDocs,
			}));
			const {
				FirebaseEntryRepository,
			} = require('../../../src/repositories/firebaseEntryRepository');
			repo = new FirebaseEntryRepository() as RepoAPI;
		});
		const aggregated = await repo!.getAllEntries();
		expect(aggregated).toHaveLength(1);
		const permDenied = await repo!.getAllEntries();
		expect(permDenied).toEqual([]);
		await expect(repo!.getAllEntries()).rejects.toMatchObject({
			code: 'firestore.fetch_failed',
		});
	});

	it('delete tries across trackers and handles failures', async () => {
		const collection = jest.fn(() => ({}));
		const trackers = [{ id: 't1' }];
		const getDocs = jest.fn(async () => ({ docs: trackers }));
		const doc = jest.fn(() => ({}));
		const deleteDoc = jest.fn(async () => {});
		let repo!: RepoAPI;
		jest.isolateModules(() => {
			jest.doMock('../../../src/mappers/entryMapper', () => {
				type FirestoreEntry = {
					id?: string;
					trackerId?: string;
					date?: string;
					status?: string;
					isAdvisory?: boolean;
					needsSync?: boolean;
					lastModified?: number | { toMillis: () => number };
					createdAt?: number | { toMillis: () => number };
				};
				const toMillis = (
					v?: number | { toMillis: () => number }
				): number => {
					if (typeof v === 'number') return v;
					if (v && typeof v.toMillis === 'function')
						return v.toMillis();
					return Date.now();
				};
				return {
					entryDTOToFirestore: (e: EntryDTO) => ({ ...e }),
					entryFirestoreToDTO: (d: FirestoreEntry): EntryDTO => ({
						id: d.id ?? '',
						trackerId: d.trackerId ?? 't1',
						date: d.date ?? '',
						status: (d.status as EntryDTO['status']) ?? 'office',
						isAdvisory: Boolean(d.isAdvisory ?? false),
						needsSync: Boolean(d.needsSync ?? false),
						lastModified: toMillis(d.lastModified),
					}),
				};
			});
			jest.doMock('@react-native-firebase/firestore', () => ({
				collection,
				getDocs,
				doc,
				deleteDoc,
			}));
			const {
				FirebaseEntryRepository,
			} = require('../../../src/repositories/firebaseEntryRepository');
			repo = new FirebaseEntryRepository() as RepoAPI;
		});
		await expect(repo.delete('2025-01-01')).resolves.toBeUndefined();
		(getDocs as unknown as jest.Mock).mockRejectedValueOnce(
			new Error('boom')
		);
		await expect(repo.delete('x')).rejects.toMatchObject({
			code: 'firestore.delete_failed',
		});
	});
});
