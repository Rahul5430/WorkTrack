import { WatermelonEntryRepository } from '../../src/repositories/watermelonEntryRepository';
import type { EntryDTO } from '../../src/types';

jest.mock('@react-native-firebase/app', () => ({ getApp: () => ({}) }), {
	virtual: true,
});
jest.mock(
	'@react-native-firebase/firestore',
	() => ({
		Timestamp: {
			fromDate: (d: Date) => ({ toMillis: () => d.getTime() }),
			fromMillis: (ms: number) => ({ toMillis: () => ms }),
		},
	}),
	{ virtual: true }
);

interface EntryModel {
	_raw: { id?: string };
	id?: string;
	update: (fn: (m: EntryModel) => void) => void;
	date?: string;
	status?: string;
	isAdvisory?: boolean;
	trackerId?: string;
	needsSync?: boolean;
	lastModified?: number;
}

const entries: EntryModel[] = [];

jest.mock('../../src/db/watermelon', () => {
	const findById = (id: string) => entries.find((e) => e.id === id) ?? null;
	return {
		database: {
			get: () => ({
				query: () => ({ fetch: async () => entries }),
				find: async (id: string) =>
					findById(id) ?? Promise.reject(new Error('not found')),
				create: async (fn: (m: EntryModel) => void) => {
					const m: EntryModel = { _raw: {}, update: (f) => f(m) };
					fn(m);
					m.id = m._raw.id ?? '';
					entries.push(m);
				},
			}),
			write: async (fn: () => Promise<void>) => fn(),
		},
		WorkTrack: class {},
	};
});

jest.mock('@nozbe/watermelondb', () => ({
	Q: { where: () => ({}), notEq: () => ({}), gte: () => ({}) },
}));

describe('WatermelonEntryRepository', () => {
	beforeEach(() => {
		entries.length = 0;
	});

	it('upserts and marks entry as synced', async () => {
		const repo = new WatermelonEntryRepository();
		const entry: EntryDTO = {
			id: '2025-01-01',
			trackerId: 't1',
			date: '2025-01-01',
			status: 'office',
			isAdvisory: false,
			needsSync: true,
			lastModified: 1,
		};
		await repo.upsertOne(entry);

		// Provide update mutator for created model
		const created = entries.find((e) => e.id === entry.id)!;
		created.update = (fn: (m: EntryModel) => void) => {
			fn(created);
			created.needsSync = false;
		};

		await repo.markSynced([entry]);
		const all = await repo.getAllEntries();
		expect(all.find((e) => e.id === entry.id)?.needsSync).toBe(false);
	});
});
