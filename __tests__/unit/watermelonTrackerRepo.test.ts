import { WatermelonTrackerRepository } from '../../src/repositories/watermelonTrackerRepository';
import type { TrackerDTO } from '../../src/types';

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

interface TrackerModelData {
	name: string;
	color: string;
	ownerId: string;
	isDefault: boolean;
	trackerType: string;
}

jest.mock(
	'../../src/mappers/trackerMapper',
	() => ({
		trackerDTOToModelData: (dto: TrackerModelData) => ({
			name: dto.name,
			color: dto.color,
			ownerId: dto.ownerId,
			isDefault: dto.isDefault,
			trackerType: dto.trackerType,
		}),
		trackerModelToDTO: (model: TrackerModelData & { id: string }) => ({
			id: model.id,
			name: model.name,
			color: model.color,
			ownerId: model.ownerId,
			isDefault: model.isDefault,
			trackerType: model.trackerType,
		}),
		trackerModelToFirestore: (model: { id: string }) => ({
			id: model.id,
			createdAt: { toMillis: () => 0 },
		}),
		trackerDTOToFirestore: (dto: { id: string }) => ({
			id: dto.id,
			createdAt: { toMillis: () => 0 },
		}),
	}),
	{ virtual: true }
);

interface TrackerModel {
	_raw: { id?: string };
	id?: string;
	ownerId?: string;
	name?: string;
	color?: string;
	isDefault?: boolean;
	trackerType?: string;
	update: (fn: (m: TrackerModel) => void) => void;
}

const trackers: TrackerModel[] = [];

jest.mock('../../src/db/watermelon', () => {
	const findById = (id: string) => trackers.find((e) => e.id === id) ?? null;
	return {
		database: {
			get: () => ({
				query: () => ({ fetch: async () => trackers }),
				find: async (id: string) =>
					findById(id) ?? Promise.reject(new Error('not found')),
				create: async (fn: (m: TrackerModel) => void) => {
					const m: TrackerModel = { _raw: {}, update: (f) => f(m) };
					fn(m);
					m.id = m._raw.id ?? '';
					trackers.push(m);
				},
			}),
			write: async (fn: () => Promise<void>) => fn(),
		},
		Tracker: class {},
	};
});

describe('WatermelonTrackerRepository', () => {
	beforeEach(() => {
		trackers.length = 0;
	});

	it('creates and lists owned tracker', async () => {
		const repo = new WatermelonTrackerRepository();
		const t: TrackerDTO = {
			id: 't1',
			ownerId: 'u1',
			name: 'Work',
			color: '#000',
			isDefault: true,
			trackerType: 'work',
		};
		await repo.create(t, 'u1');
		const mine = await repo.listOwned('u1');
		expect(mine.find((x) => x.id === 't1')).toBeTruthy();
	});
});
