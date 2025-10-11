jest.mock('@react-native-firebase/app', () => ({ getApp: () => ({}) }));
jest.mock('@react-native-firebase/firestore', () => ({
	Timestamp: {
		fromDate: (d: Date) => ({ toMillis: () => d.getTime() }),
		fromMillis: (ms: number) => ({ toMillis: () => ms }),
	},
}));

// Local stub type to avoid pre-mock imports
interface StubTracker {
	id: string;
	name: string;
	color: string;
	ownerId: string;
	isDefault: boolean;
	trackerType: string;
}

describe('trackerMapper', () => {
	it('throws on missing id in trackerFirestoreToDTO', () => {
		const {
			trackerFirestoreToDTO,
		} = require('../../../src/mappers/trackerMapper');
		const fsData = {
			// id missing
			ownerId: 'u1',
			name: 'My Tracker',
			color: '#fff',
			isDefault: false,
			trackerType: 'work',
			createdAt: { toMillis: () => 0 },
		} as unknown as Parameters<typeof trackerFirestoreToDTO>[0];
		expect(() => trackerFirestoreToDTO(fsData)).toThrow(
			'Tracker ID is required'
		);
	});

	it('converts DTO <-> Firestore', () => {
		const {
			trackerDTOToFirestore,
			trackerFirestoreToDTO,
		} = require('../../../src/mappers/trackerMapper');
		const dto = {
			id: 't1',
			name: 'T',
			color: '#000',
			ownerId: 'u1',
			isDefault: true,
			trackerType: 'work',
		};
		const fs = trackerDTOToFirestore(dto, new Date(0));
		expect(fs.id).toBe('t1');
		expect(fs.createdAt.toMillis()).toBe(0);
		const back = trackerFirestoreToDTO({ ...fs });
		expect(back.ownerId).toBe('u1');
	});

	it('converts DTO <-> model', () => {
		const {
			trackerDTOToModelData,
			trackerModelToDTO,
			trackerModelToFirestore,
		} = require('../../../src/mappers/trackerMapper');
		const dto = {
			id: 't2',
			name: 'Name',
			color: '#111',
			ownerId: 'u2',
			isDefault: false,
			trackerType: 'work_track',
		};
		const modelData = trackerDTOToModelData(dto);
		expect(modelData.ownerId).toBe('u2');
		const model: Partial<StubTracker> = {
			id: 't2',
			name: 'Name',
			color: '#111',
			ownerId: 'u2',
			isDefault: false,
			trackerType: 'work_track',
		};
		const back = trackerModelToDTO(model as unknown as StubTracker);
		expect(back.id).toBe('t2');
		const fs = trackerModelToFirestore(model as unknown as StubTracker);
		expect(fs.id).toBe('t2');
	});

	it('converts Firestore -> model data', () => {
		const {
			trackerFirestoreToModelData,
		} = require('../../../src/mappers/trackerMapper');
		const fs = {
			id: 't3',
			name: 'N',
			color: '#222',
			ownerId: 'u3',
			isDefault: false,
			trackerType: 'work',
			createdAt: { toMillis: () => 1 },
		};
		const model = trackerFirestoreToModelData(fs);
		expect(model.ownerId).toBe('u3');
	});
});
