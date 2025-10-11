import { IShareRepository, ITrackerRepository } from '../../../src/types';
import { ShareReadUseCaseImpl } from '../../../src/use-cases/shareReadUseCase';

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

jest.mock('../../../src/services', () => ({
	getFirestoreInstance: jest.fn(),
}));

jest.mock('../../../src/logging', () => ({
	logger: {
		debug: jest.fn(),
		error: jest.fn(),
		warn: jest.fn(),
	},
}));

describe('ShareReadUseCase - branch coverage', () => {
	let useCase: ShareReadUseCaseImpl;
	let mockShareRepo: jest.Mocked<IShareRepository>;
	let mockTrackerRepo: jest.Mocked<ITrackerRepository>;
	let mockAuth: {
		currentUser: {
			uid: string;
			displayName: string | null;
			email: string | null;
			photoURL: string | null;
		} | null;
	};

	beforeEach(() => {
		jest.clearAllMocks();

		mockShareRepo = {
			listSharedWith: jest.fn(),
		} as unknown as jest.Mocked<IShareRepository>;

		mockTrackerRepo = {
			listOwned: jest.fn(),
		} as unknown as jest.Mocked<ITrackerRepository>;

		mockAuth = {
			currentUser: null,
		};

		require('@react-native-firebase/auth').getAuth.mockReturnValue(
			mockAuth
		);
		require('../../../src/services').getFirestoreInstance.mockReturnValue(
			{}
		);

		useCase = new ShareReadUseCaseImpl(mockShareRepo, mockTrackerRepo);
	});

	describe('getMyShares', () => {
		it('handles user with missing displayName, email, and photoURL', async () => {
			// Mock user with missing optional fields
			const mockUser = {
				uid: 'user1',
				displayName: null,
				email: null,
				photoURL: null,
			};
			mockAuth.currentUser = mockUser;

			const mockOwnedTrackers = [
				{
					id: 'tracker1',
					name: 'Test Tracker',
					color: '#000000',
					isDefault: false,
					trackerType: 'work',
					ownerId: 'user1',
					createdAt: new Date(),
				},
			];

			// Mock Firestore query result
			const mockQuerySnapshot = {
				docs: [
					{
						id: 'share1',
						data: () => ({
							sharedWithId: 'user2',
							sharedWithEmail: 'user2@example.com',
							permission: 'read',
						}),
						ref: {
							path: 'trackers/tracker1/shares/share1',
						},
					},
				],
			};

			require('@react-native-firebase/firestore').getDocs.mockResolvedValue(
				mockQuerySnapshot
			);
			mockTrackerRepo.listOwned.mockResolvedValue(mockOwnedTrackers);

			const result = await useCase.getMyShares();

			expect(result).toHaveLength(1);
			expect(result[0]).toEqual({
				id: 'share1',
				sharedWithId: 'user2',
				sharedWithEmail: 'user2@example.com',
				permission: 'read',
				trackerId: 'tracker1',
				ownerId: 'user1',
				ownerName: 'Unknown', // Should use fallback
				ownerEmail: 'unknown@example.com', // Should use fallback
				ownerPhoto: undefined, // Should use fallback
				trackerType: 'work',
			});
		});

		it('handles share data with missing owner information', async () => {
			const mockUser = {
				uid: 'user1',
				displayName: 'Test User',
				email: 'test@example.com',
				photoURL: 'https://example.com/photo.jpg',
			};
			mockAuth.currentUser = mockUser;

			// Mock share data with missing owner information
			const mockQuerySnapshot = {
				docs: [
					{
						id: 'share1',
						data: () => ({
							sharedWithId: 'user2',
							sharedWithEmail: 'user2@example.com',
							permission: 'read',
							ownerId: null, // Missing ownerId
							ownerName: null, // Missing ownerName
							ownerEmail: null, // Missing ownerEmail
						}),
						ref: {
							path: 'trackers/tracker1/shares/share1',
						},
					},
				],
			};

			require('@react-native-firebase/firestore').getDocs.mockResolvedValue(
				mockQuerySnapshot
			);
			mockTrackerRepo.listOwned.mockResolvedValue([]);

			const result = await useCase.getMyShares();

			expect(result).toHaveLength(0); // No owned trackers, so no shares
		});
	});

	describe('getSharedWithMe', () => {
		it('handles share data with missing owner information', async () => {
			const mockUser = {
				uid: 'user1',
				displayName: 'Test User',
				email: 'test@example.com',
				photoURL: 'https://example.com/photo.jpg',
			};
			mockAuth.currentUser = mockUser;

			// Mock share data with missing owner information
			const mockQuerySnapshot = {
				docs: [
					{
						id: 'share1',
						data: () => ({
							sharedWithId: 'user1',
							sharedWithEmail: 'user1@example.com',
							permission: 'read',
							ownerId: 'owner1',
							// Missing ownerName, ownerEmail
						}),
						ref: {
							path: 'trackers/tracker1/shares/share1',
						},
					},
				],
			};

			require('@react-native-firebase/firestore').getDocs.mockResolvedValue(
				mockQuerySnapshot
			);
			mockTrackerRepo.listOwned.mockResolvedValue([]); // No owned trackers for ownerId

			const result = await useCase.getSharedWithMe();

			expect(result).toHaveLength(1);
			expect(result[0]).toEqual({
				id: 'share1',
				sharedWithId: 'user1',
				sharedWithEmail: 'user1@example.com',
				permission: 'read',
				trackerId: 'tracker1',
				ownerId: 'owner1',
				ownerName: 'Unknown', // Should fallback to 'Unknown'
				ownerEmail: 'unknown@example.com', // Should fallback to 'unknown@example.com'
				ownerPhoto: undefined,
				trackerType: 'work_track', // Should fallback to 'work_track'
			});
		});

		it('handles share data with ownerEmail and ownerName both present', async () => {
			const mockUser = {
				uid: 'user1',
				displayName: 'Test User',
				email: 'test@example.com',
				photoURL: 'https://example.com/photo.jpg',
			};
			mockAuth.currentUser = mockUser;

			// Mock share data with both ownerEmail and ownerName
			const mockQuerySnapshot = {
				docs: [
					{
						id: 'share1',
						data: () => ({
							sharedWithId: 'user1',
							sharedWithEmail: 'user1@example.com',
							permission: 'read',
							ownerId: 'owner1',
							ownerName: 'Known Owner',
							ownerEmail: 'owner@example.com',
						}),
						ref: {
							path: 'trackers/tracker1/shares/share1',
						},
					},
				],
			};

			require('@react-native-firebase/firestore').getDocs.mockResolvedValue(
				mockQuerySnapshot
			);
			mockTrackerRepo.listOwned.mockResolvedValue([]); // No owned trackers for ownerId

			const result = await useCase.getSharedWithMe();

			expect(result).toHaveLength(1);
			expect(result[0]).toEqual({
				id: 'share1',
				sharedWithId: 'user1',
				sharedWithEmail: 'user1@example.com',
				permission: 'read',
				trackerId: 'tracker1',
				ownerId: 'owner1',
				ownerName: 'Known Owner',
				ownerEmail: 'owner@example.com', // Should use ownerEmail
				ownerPhoto: undefined,
				trackerType: 'work_track', // Should fallback to 'work_track'
			});
		});

		it('handles share data with ownerEmail but no ownerName', async () => {
			const mockUser = {
				uid: 'user1',
				displayName: 'Test User',
				email: 'test@example.com',
				photoURL: 'https://example.com/photo.jpg',
			};
			mockAuth.currentUser = mockUser;

			// Mock share data with ownerEmail but no ownerName
			const mockQuerySnapshot = {
				docs: [
					{
						id: 'share1',
						data: () => ({
							sharedWithId: 'user1',
							sharedWithEmail: 'user1@example.com',
							permission: 'read',
							ownerId: 'owner1',
							ownerEmail: 'owner@example.com',
							// Missing ownerName
						}),
						ref: {
							path: 'trackers/tracker1/shares/share1',
						},
					},
				],
			};

			require('@react-native-firebase/firestore').getDocs.mockResolvedValue(
				mockQuerySnapshot
			);
			mockTrackerRepo.listOwned.mockResolvedValue([]); // No owned trackers for ownerId

			const result = await useCase.getSharedWithMe();

			expect(result).toHaveLength(1);
			expect(result[0]).toEqual({
				id: 'share1',
				sharedWithId: 'user1',
				sharedWithEmail: 'user1@example.com',
				permission: 'read',
				trackerId: 'tracker1',
				ownerId: 'owner1',
				ownerName: 'Unknown', // Should fallback to 'Unknown'
				ownerEmail: 'owner@example.com', // Should use ownerEmail
				ownerPhoto: undefined,
				trackerType: 'work_track', // Should fallback to 'work_track'
			});
		});

		it('handles share data with ownerName but no ownerEmail', async () => {
			const mockUser = {
				uid: 'user1',
				displayName: 'Test User',
				email: 'test@example.com',
				photoURL: 'https://example.com/photo.jpg',
			};
			mockAuth.currentUser = mockUser;

			// Mock share data with ownerName but no ownerEmail
			const mockQuerySnapshot = {
				docs: [
					{
						id: 'share1',
						data: () => ({
							sharedWithId: 'user1',
							sharedWithEmail: 'user1@example.com',
							permission: 'read',
							ownerId: 'owner1',
							ownerName: 'Known Owner',
							// Missing ownerEmail
						}),
						ref: {
							path: 'trackers/tracker1/shares/share1',
						},
					},
				],
			};

			require('@react-native-firebase/firestore').getDocs.mockResolvedValue(
				mockQuerySnapshot
			);
			mockTrackerRepo.listOwned.mockResolvedValue([]); // No owned trackers for ownerId

			const result = await useCase.getSharedWithMe();

			expect(result).toHaveLength(1);
			expect(result[0]).toEqual({
				id: 'share1',
				sharedWithId: 'user1',
				sharedWithEmail: 'user1@example.com',
				permission: 'read',
				trackerId: 'tracker1',
				ownerId: 'owner1',
				ownerName: 'Known Owner',
				ownerEmail: 'Known Owner', // Should use ownerName as fallback
				ownerPhoto: undefined,
				trackerType: 'work_track', // Should fallback to 'work_track'
			});
		});
	});
});
