import { SyncError } from '../../../src/errors';
import { ShareReadUseCaseImpl } from '../../../src/use-cases/shareReadUseCase';

jest.mock('@react-native-firebase/auth', () => ({
	getAuth: () => ({
		currentUser: {
			uid: 'user1',
			displayName: 'Test User',
			email: 'test@example.com',
			photoURL: 'http://photo.com',
		},
	}),
}));

jest.mock('@react-native-firebase/firestore', () => ({
	collectionGroup: () => ({}),
	query: () => ({}),
	where: () => ({}),
	getDocs: jest.fn(),
}));

jest.mock('../../../src/services', () => ({
	getFirestoreInstance: () => ({}),
}));

describe('ShareReadUseCase', () => {
	let useCase: ShareReadUseCaseImpl;
	let mockShares: {
		share: jest.Mock;
		unshare: jest.Mock;
		updatePermission: jest.Mock;
	};
	let mockTrackers: import('../../../src/types').ITrackerRepository;
	let mockGetDocs: jest.Mock;

	beforeEach(() => {
		mockShares = {
			share: jest.fn(),
			unshare: jest.fn(),
			updatePermission: jest.fn(),
		};
		mockTrackers = {
			create: jest.fn(async (tracker, userId) => {
				tracker;
				userId;
			}),
			update: jest.fn(async () => {}),
			listOwned: jest.fn(async (userId: string) => {
				userId;
				return [];
			}),
			listSharedWith: jest.fn(async (userId: string) => {
				userId;
				return [];
			}),
			ensureExists: jest.fn(async (id: string, ownerId: string) => {
				id;
				ownerId;
			}),
			upsertMany: jest.fn(async (trackers) => {
				trackers;
			}),
		};
		useCase = new ShareReadUseCaseImpl(mockShares, mockTrackers);
		mockGetDocs = require('@react-native-firebase/firestore').getDocs;
	});

	it('getMyShares returns shares for owned trackers', async () => {
		const mockDocs = [
			{
				id: 'share1',
				data: () => ({
					sharedWithId: 'user2',
					sharedWithEmail: 'user2@example.com',
					permission: 'read',
				}),
				ref: { path: 'trackers/tracker1/shares/share1' },
			},
		];
		mockGetDocs.mockResolvedValue({ docs: mockDocs });
		(mockTrackers.listOwned as unknown as jest.Mock).mockResolvedValue([
			{ id: 'tracker1', trackerType: 'work' },
		]);

		const result = await useCase.getMyShares();

		expect(result).toHaveLength(1);
		expect(result[0]).toMatchObject({
			id: 'share1',
			sharedWithId: 'user2',
			sharedWithEmail: 'user2@example.com',
			permission: 'read',
			trackerId: 'tracker1',
			ownerId: 'user1',
			ownerName: 'Test User',
			ownerEmail: 'test@example.com',
			ownerPhoto: 'http://photo.com',
			trackerType: 'work',
		});
	});

	it('getMyShares filters out shares for non-owned trackers', async () => {
		const mockDocs = [
			{
				id: 'share1',
				data: () => ({
					sharedWithId: 'user2',
					sharedWithEmail: 'user2@example.com',
					permission: 'read',
				}),
				ref: { path: 'trackers/tracker1/shares/share1' },
			},
		];
		mockGetDocs.mockResolvedValue({ docs: mockDocs });
		(mockTrackers.listOwned as unknown as jest.Mock).mockResolvedValue([
			{ id: 'tracker2', trackerType: 'work' },
		]);

		const result = await useCase.getMyShares();

		expect(result).toHaveLength(0);
	});

	it('getMyShares throws when user not authenticated', async () => {
		// Create a new use case instance with mocked auth
		const auth = require('@react-native-firebase/auth');
		const originalGetAuth = auth.getAuth;
		auth.getAuth = jest.fn(() => ({ currentUser: null }));

		await expect(useCase.getMyShares()).rejects.toThrow(SyncError);

		// Restore original
		auth.getAuth = originalGetAuth;
	});

	it('getMyShares handles Firestore errors', async () => {
		mockGetDocs.mockRejectedValue(new Error('Firestore error'));

		await expect(useCase.getMyShares()).rejects.toThrow(SyncError);
	});

	it('getSharedWithMe returns shares for current user', async () => {
		const mockDocs = [
			{
				id: 'share1',
				data: () => ({
					sharedWithId: 'user1',
					sharedWithEmail: 'user1@example.com',
					permission: 'write',
					ownerId: 'owner1',
					ownerName: 'Owner Name',
					ownerEmail: 'owner@example.com',
					ownerPhoto: 'http://owner.com',
				}),
				ref: { path: 'trackers/tracker1/shares/share1' },
			},
		];
		mockGetDocs.mockResolvedValue({ docs: mockDocs });
		(mockTrackers.listOwned as unknown as jest.Mock).mockResolvedValue([
			{ id: 'tracker1', trackerType: 'work' },
		]);

		const result = await useCase.getSharedWithMe();

		expect(result).toHaveLength(1);
		expect(result[0]).toMatchObject({
			id: 'share1',
			sharedWithId: 'user1',
			sharedWithEmail: 'user1@example.com',
			permission: 'write',
			trackerId: 'tracker1',
			ownerId: 'owner1',
			ownerName: 'Owner Name',
			ownerEmail: 'owner@example.com',
			ownerPhoto: 'http://owner.com',
			trackerType: 'work',
		});
	});

	it('getSharedWithMe handles missing tracker info', async () => {
		const mockDocs = [
			{
				id: 'share1',
				data: () => ({
					sharedWithId: 'user1',
					sharedWithEmail: 'user1@example.com',
					permission: 'read',
					ownerId: 'owner1',
				}),
				ref: { path: 'trackers/tracker1/shares/share1' },
			},
		];
		mockGetDocs.mockResolvedValue({ docs: mockDocs });
		(mockTrackers.listOwned as unknown as jest.Mock).mockResolvedValue([]);

		const result = await useCase.getSharedWithMe();

		expect(result).toHaveLength(1);
		expect(result[0].trackerType).toBe('work_track');
	});

	it('removeShare calls shares.unshare with correct parameters', async () => {
		mockShares.unshare.mockResolvedValue(undefined);

		await useCase.removeShare('user2', 'tracker1');

		expect(mockShares.unshare).toHaveBeenCalledWith('tracker1', 'user2');
	});

	it('removeShare uses default tracker when trackerId not provided', async () => {
		mockShares.unshare.mockResolvedValue(undefined);

		await useCase.removeShare('user2');

		expect(mockShares.unshare).toHaveBeenCalledWith('default', 'user2');
	});

	it('removeShare throws when user not authenticated', async () => {
		// Create a new use case instance with mocked auth
		const auth = require('@react-native-firebase/auth');
		const originalGetAuth = auth.getAuth;
		auth.getAuth = jest.fn(() => ({ currentUser: null }));

		await expect(useCase.removeShare('user2')).rejects.toThrow(SyncError);

		// Restore original
		auth.getAuth = originalGetAuth;
	});

	it('removeShare handles repository errors', async () => {
		mockShares.unshare.mockRejectedValue(new Error('Repository error'));

		await expect(useCase.removeShare('user2')).rejects.toThrow(SyncError);
	});
});
