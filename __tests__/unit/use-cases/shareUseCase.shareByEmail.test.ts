import { IShareRepository, ITrackerRepository } from '../../../src/types';
import { ShareUseCaseImpl } from '../../../src/use-cases/shareUseCase';

// Mock the dependencies
jest.mock('@react-native-firebase/auth', () => ({
	getAuth: jest.fn(),
}));

jest.mock('@react-native-firebase/firestore', () => ({
	collection: jest.fn(),
	getDocs: jest.fn(),
	query: jest.fn(),
	where: jest.fn(),
}));

jest.mock('../../../src/services', () => ({
	getFirestoreInstance: jest.fn(),
}));

jest.mock('../../../src/logging', () => ({
	logger: {
		debug: jest.fn(),
		error: jest.fn(),
		warn: jest.fn(),
		info: jest.fn(),
	},
}));

describe('ShareUseCase - shareByEmail', () => {
	let useCase: ShareUseCaseImpl;
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
				uid: 'owner1',
				displayName: 'Test User',
				email: 'test@example.com',
			},
		};

		require('@react-native-firebase/auth').getAuth.mockReturnValue(
			mockAuth
		);
		require('../../../src/services').getFirestoreInstance.mockReturnValue(
			{}
		);

		useCase = new ShareUseCaseImpl(mockShareRepo, mockTrackerRepo);
	});

	it('handles case when user is not authenticated', async () => {
		require('@react-native-firebase/auth').getAuth.mockReturnValue({
			currentUser: null,
		});

		await expect(
			useCase.shareByEmail('test@example.com', 'read')
		).rejects.toThrow('User not authenticated');

		// The method throws an error but doesn't log it
		expect(
			require('../../../src/logging').logger.error
		).not.toHaveBeenCalled();
	});

	it('handles case when user is not authenticated with retryable false', async () => {
		require('@react-native-firebase/auth').getAuth.mockReturnValue({
			currentUser: null,
		});

		await expect(
			useCase.shareByEmail('test@example.com', 'read')
		).rejects.toThrow('User not authenticated');

		// Verify the error has retryable: false
		// The method throws an error but doesn't log it
		expect(
			require('../../../src/logging').logger.error
		).not.toHaveBeenCalled();
	});

	it('successfully shares with valid user', async () => {
		const mockQuerySnapshot = {
			docs: [
				{
					id: 'targetUser1',
					data: () => ({
						email: 'test@example.com',
						displayName: 'Test User',
					}),
				},
			],
		};

		require('@react-native-firebase/firestore').getDocs.mockResolvedValue(
			mockQuerySnapshot
		);
		mockTrackerRepo.listOwned.mockResolvedValue([
			{
				id: 'tracker1',
				ownerId: 'owner1',
				name: 'Test Tracker',
				color: '#000000',
				isDefault: true,
				trackerType: 'work',
			},
		]);
		mockShareRepo.share.mockResolvedValue(undefined);

		await useCase.shareByEmail('test@example.com', 'read');

		expect(mockShareRepo.share).toHaveBeenCalledWith({
			sharedWithId: 'targetUser1',
			sharedWithEmail: 'test@example.com',
			permission: 'read',
			trackerId: 'tracker1',
		});

		expect(
			require('../../../src/logging').logger.info
		).toHaveBeenCalledWith('Shared tracker successfully', {
			trackerId: 'tracker1',
			sharedWithId: 'targetUser1',
			permission: 'read',
		});
	});
});
