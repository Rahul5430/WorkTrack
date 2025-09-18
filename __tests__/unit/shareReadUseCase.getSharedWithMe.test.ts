import { IShareRepository, ITrackerRepository } from '../../src/types';
import { ShareReadUseCaseImpl } from '../../src/use-cases/shareReadUseCase';

// Mock the dependencies
jest.mock('@react-native-firebase/auth', () => ({
	getAuth: jest.fn(),
}));

jest.mock('@react-native-firebase/firestore', () => ({
	collectionGroup: jest.fn(),
	getDocs: jest.fn(),
	query: jest.fn(),
	where: jest.fn(),
}));

jest.mock('../../src/services', () => ({
	getFirestoreInstance: jest.fn(),
}));

jest.mock('../../src/logging', () => ({
	logger: {
		debug: jest.fn(),
		error: jest.fn(),
		warn: jest.fn(),
	},
}));

describe('ShareReadUseCase - getSharedWithMe', () => {
	let useCase: ShareReadUseCaseImpl;
	let mockShareRepo: jest.Mocked<IShareRepository>;
	let mockTrackerRepo: jest.Mocked<ITrackerRepository>;
	let mockAuth: unknown;

	beforeEach(() => {
		jest.clearAllMocks();

		mockShareRepo = {
			share: jest.fn(),
			unshare: jest.fn(),
			updatePermission: jest.fn(),
		} as unknown as jest.Mocked<IShareRepository>;

		mockTrackerRepo = {
			listOwned: jest.fn(),
		} as unknown as jest.Mocked<ITrackerRepository>;

		mockAuth = {
			currentUser: {
				uid: 'user1',
				displayName: 'Test User',
				email: 'test@example.com',
				photoURL: 'https://example.com/photo.jpg',
			},
		};

		require('@react-native-firebase/auth').getAuth.mockReturnValue(
			mockAuth
		);
		require('../../src/services').getFirestoreInstance.mockReturnValue({});

		useCase = new ShareReadUseCaseImpl(mockShareRepo, mockTrackerRepo);
	});

	it('handles case when ownerId is missing from share data', async () => {
		const mockQuerySnapshot = {
			docs: [
				{
					id: 'share1',
					data: () => ({
						sharedWithId: 'user1',
						sharedWithEmail: 'user1@example.com',
						permission: 'read',
						// Missing ownerId
					}),
					ref: {
						path: 'trackers/tracker1/shares/share1',
					},
				},
			],
		};

		require('@react-native-firebase/firestore').query.mockReturnValue({});
		require('@react-native-firebase/firestore').getDocs.mockResolvedValue(
			mockQuerySnapshot
		);
		mockTrackerRepo.listOwned.mockResolvedValue([]);

		const result = await useCase.getSharedWithMe();

		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({
			id: 'share1',
			sharedWithId: 'user1',
			sharedWithEmail: 'user1@example.com',
			permission: 'read',
			trackerId: 'tracker1',
			ownerId: 'unknown',
			ownerName: 'Unknown',
			ownerEmail: 'unknown@example.com',
			ownerPhoto: undefined,
			trackerType: 'work_track',
		});
	});

	it('handles case when ownerName is missing from share data', async () => {
		const mockQuerySnapshot = {
			docs: [
				{
					id: 'share1',
					data: () => ({
						sharedWithId: 'user1',
						sharedWithEmail: 'user1@example.com',
						permission: 'read',
						ownerId: 'owner1',
						// Missing ownerName
						ownerEmail: 'owner@example.com',
					}),
					ref: {
						path: 'trackers/tracker1/shares/share1',
					},
				},
			],
		};

		require('@react-native-firebase/firestore').query.mockReturnValue({});
		require('@react-native-firebase/firestore').getDocs.mockResolvedValue(
			mockQuerySnapshot
		);
		mockTrackerRepo.listOwned.mockResolvedValue([]);

		const result = await useCase.getSharedWithMe();

		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({
			id: 'share1',
			sharedWithId: 'user1',
			sharedWithEmail: 'user1@example.com',
			permission: 'read',
			trackerId: 'tracker1',
			ownerId: 'owner1',
			ownerName: 'Unknown',
			ownerEmail: 'owner@example.com',
			ownerPhoto: undefined,
			trackerType: 'work_track',
		});
	});

	it('handles case when ownerEmail is missing from share data', async () => {
		const mockQuerySnapshot = {
			docs: [
				{
					id: 'share1',
					data: () => ({
						sharedWithId: 'user1',
						sharedWithEmail: 'user1@example.com',
						permission: 'read',
						ownerId: 'owner1',
						ownerName: 'Owner Name',
						// Missing ownerEmail
					}),
					ref: {
						path: 'trackers/tracker1/shares/share1',
					},
				},
			],
		};

		require('@react-native-firebase/firestore').query.mockReturnValue({});
		require('@react-native-firebase/firestore').getDocs.mockResolvedValue(
			mockQuerySnapshot
		);
		mockTrackerRepo.listOwned.mockResolvedValue([]);

		const result = await useCase.getSharedWithMe();

		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({
			id: 'share1',
			sharedWithId: 'user1',
			sharedWithEmail: 'user1@example.com',
			permission: 'read',
			trackerId: 'tracker1',
			ownerId: 'owner1',
			ownerName: 'Owner Name',
			ownerEmail: 'Owner Name', // Falls back to ownerName
			ownerPhoto: undefined,
			trackerType: 'work_track',
		});
	});

	it('handles case when both ownerEmail and ownerName are missing', async () => {
		const mockQuerySnapshot = {
			docs: [
				{
					id: 'share1',
					data: () => ({
						sharedWithId: 'user1',
						sharedWithEmail: 'user1@example.com',
						permission: 'read',
						ownerId: 'owner1',
						// Missing both ownerName and ownerEmail
					}),
					ref: {
						path: 'trackers/tracker1/shares/share1',
					},
				},
			],
		};

		require('@react-native-firebase/firestore').query.mockReturnValue({});
		require('@react-native-firebase/firestore').getDocs.mockResolvedValue(
			mockQuerySnapshot
		);
		mockTrackerRepo.listOwned.mockResolvedValue([]);

		const result = await useCase.getSharedWithMe();

		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({
			id: 'share1',
			sharedWithId: 'user1',
			sharedWithEmail: 'user1@example.com',
			permission: 'read',
			trackerId: 'tracker1',
			ownerId: 'owner1',
			ownerName: 'Unknown',
			ownerEmail: 'unknown@example.com', // Falls back to 'Unknown'
			ownerPhoto: undefined,
			trackerType: 'work_track',
		});
	});

	it('handles error when fetching shares', async () => {
		const mockError = new Error('Firestore error');
		require('@react-native-firebase/firestore').getDocs.mockRejectedValue(
			mockError
		);

		await expect(useCase.getSharedWithMe()).rejects.toThrow(
			'Failed to get shared with me'
		);

		expect(require('../../src/logging').logger.error).toHaveBeenCalledWith(
			'Failed to get shared with me',
			{
				error: mockError,
			}
		);
	});
});
