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
		info: jest.fn(),
	},
}));

describe('ShareUseCase - unauthenticated user', () => {
	let useCase: ShareUseCaseImpl;
	let mockShareRepo: jest.Mocked<IShareRepository>;
	let mockTrackerRepo: jest.Mocked<ITrackerRepository>;

	beforeEach(() => {
		jest.clearAllMocks();

		mockShareRepo = {
			share: jest.fn(),
		} as unknown as jest.Mocked<IShareRepository>;

		mockTrackerRepo = {
			listOwned: jest.fn(),
		} as unknown as jest.Mocked<ITrackerRepository>;

		require('../../../src/services').getFirestoreInstance.mockReturnValue(
			{}
		);

		useCase = new ShareUseCaseImpl(mockShareRepo, mockTrackerRepo);
	});

	it('throws SyncError when user is not authenticated in shareByEmail', async () => {
		// Mock getAuth to return null currentUser
		require('@react-native-firebase/auth').getAuth.mockReturnValue({
			currentUser: null,
		});

		await expect(
			useCase.shareByEmail('test@example.com', 'read')
		).rejects.toThrow('User not authenticated');

		// Verify the error details
		await expect(
			useCase.shareByEmail('test@example.com', 'read')
		).rejects.toMatchObject({
			message: 'User not authenticated',
			code: 'auth.unauthenticated',
			retryable: false,
		});

		// Verify that no repository methods were called
		expect(mockShareRepo.share).not.toHaveBeenCalled();
		expect(mockTrackerRepo.listOwned).not.toHaveBeenCalled();
	});

	it('throws SyncError when user is not authenticated in updateSharePermission', async () => {
		// Mock getAuth to return null currentUser
		require('@react-native-firebase/auth').getAuth.mockReturnValue({
			currentUser: null,
		});

		await expect(
			useCase.updateSharePermission('user1', 'read')
		).rejects.toThrow('User not authenticated');

		// Verify the error details
		await expect(
			useCase.updateSharePermission('user1', 'read')
		).rejects.toMatchObject({
			message: 'User not authenticated',
			code: 'auth.unauthenticated',
			retryable: false,
		});

		// Verify that no repository methods were called
		expect(mockShareRepo.share).not.toHaveBeenCalled();
		expect(mockTrackerRepo.listOwned).not.toHaveBeenCalled();
	});
});
