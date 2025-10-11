jest.mock('@react-native-firebase/app', () => ({ getApp: () => ({}) }));
jest.mock('@react-native-firebase/firestore', () => ({
	Timestamp: {
		fromDate: (d: Date) => ({ toMillis: () => d.getTime() }),
		fromMillis: (ms: number) => ({ toMillis: () => ms }),
	},
}));

// Local stub type to avoid pre-mock imports
interface StubSharedTracker {
	trackerId: string;
	sharedWith: string;
	permission: 'read' | 'write';
	createdAt: Date;
}

describe('shareMapper', () => {
	it('converts DTO <-> Firestore', () => {
		const {
			shareDTOToFirestore,
			shareFirestoreToDTO,
		} = require('../../../src/mappers/shareMapper');
		const dto = {
			trackerId: 't1',
			sharedWithId: 'u2',
			permission: 'write' as const,
			sharedWithEmail: 'a@b.com',
		};
		const fs = shareDTOToFirestore(dto, new Date(0));
		expect(typeof fs.createdAt.toMillis()).toBe('number');
		const back = shareFirestoreToDTO(fs, 't1');
		expect(back.sharedWithId).toBe('u2');
	});

	it('converts DTO <-> model', () => {
		const {
			shareDTOToModelData,
			shareModelToDTO,
			shareModelToFirestore,
		} = require('../../../src/mappers/shareMapper');
		const dto = {
			trackerId: 't2',
			sharedWithId: 'u9',
			permission: 'read' as const,
		};
		const modelData = shareDTOToModelData(dto);
		expect(modelData.sharedWith).toBe('u9');
		const model: Partial<StubSharedTracker> = {
			trackerId: 't2',
			sharedWith: 'u9',
			permission: 'read',
			createdAt: new Date(0),
		};
		const back = shareModelToDTO(model as unknown as StubSharedTracker);
		expect(back.permission).toBe('read');
		const fs = shareModelToFirestore(model as unknown as StubSharedTracker);
		expect(typeof fs.createdAt.toMillis()).toBe('number');
	});

	it('Firestore -> model data preserves permission', () => {
		const {
			shareFirestoreToModelData,
		} = require('../../../src/mappers/shareMapper');
		const fs = {
			sharedWithId: 'u7',
			permission: 'write' as const,
			sharedWithEmail: 'x@y.com',
			createdAt: { toMillis: () => 123 },
		};
		const model = shareFirestoreToModelData(fs, 't7');
		expect(model.permission).toBe('write');
	});
});
