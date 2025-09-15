import type {
	IShareRepository,
	ITrackerRepository,
	Permission,
	TrackerDTO,
} from '../../src/types';

jest.mock('@react-native-firebase/app', () => ({ getApp: () => ({}) }));
jest.mock('@react-native-firebase/auth', () => ({
	getAuth: () => ({ currentUser: { uid: 'me' } }),
}));
jest.mock('@react-native-firebase/firestore', () => ({
	collection: () => ({}),
	where: () => ({}),
	query: () => ({}),
	getDocs: async () => ({ empty: false, docs: [{ id: 'other' }] }),
}));
// Mock internal services Firestore instance getter
jest.mock('../../src/services', () => ({ getFirestoreInstance: () => ({}) }));

class Shares implements IShareRepository {
	public writes: Array<{
		trackerId: string;
		sharedWithId: string;
		permission: Permission;
		sharedWithEmail?: string;
	}> = [];
	async share(data: {
		trackerId: string;
		sharedWithId: string;
		permission: Permission;
		sharedWithEmail?: string | undefined;
	}): Promise<void> {
		this.writes.push(data);
	}
	async unshare(): Promise<void> {}
	async updatePermission(): Promise<void> {}
}

class Trackers implements ITrackerRepository {
	constructor(private trackers: TrackerDTO[]) {}
	async create(): Promise<void> {}
	async update(): Promise<void> {}
	async listOwned(userId: string): Promise<TrackerDTO[]> {
		return this.trackers.filter((t) => t.ownerId === userId);
	}
	async listSharedWith(): Promise<TrackerDTO[]> {
		return [];
	}
	async ensureExists(): Promise<void> {}
	async upsertMany(): Promise<void> {}
}

describe('ShareUseCase', () => {
	it('prevents sharing with self', async () => {
		const shares = new Shares();
		const trackers = new Trackers([
			{
				id: 't1',
				ownerId: 'me',
				name: 'Work',
				color: '#000',
				isDefault: true,
				trackerType: 'work',
			},
		]);
		const {
			createShareUseCase,
		} = require('../../src/use-cases/shareUseCase');
		const uc = createShareUseCase(shares, trackers);
		const firestore = require('@react-native-firebase/firestore');
		jest.spyOn(firestore, 'getDocs').mockResolvedValueOnce({
			empty: false,
			docs: [{ id: 'me' }],
		});
		await expect(
			uc.shareByEmail('me@example.com', 'read')
		).rejects.toBeTruthy();
	});

	it('shares using default tracker when id not provided', async () => {
		const shares = new Shares();
		const trackers = new Trackers([
			{
				id: 't1',
				ownerId: 'me',
				name: 'Work',
				color: '#000',
				isDefault: true,
				trackerType: 'work',
			},
		]);
		const {
			createShareUseCase,
		} = require('../../src/use-cases/shareUseCase');
		const uc = createShareUseCase(shares, trackers);
		const firestore = require('@react-native-firebase/firestore');
		jest.spyOn(firestore, 'getDocs').mockResolvedValueOnce({
			empty: false,
			docs: [{ id: 'other' }],
		});
		await uc.shareByEmail('other@example.com', 'write');
		expect(shares.writes[0]).toMatchObject({
			trackerId: 't1',
			sharedWithId: 'other',
			permission: 'write',
		});
	});
});
