import { FirebaseTrackerRepository } from '../../../src/repositories/firebaseTrackerRepository';

jest.mock('@react-native-firebase/firestore', () => ({
	collection: () => ({}),
	collectionGroup: () => ({}),
	doc: () => ({}),
	getDoc: jest.fn(),
	getDocs: jest.fn(),
	query: () => ({}),
	setDoc: jest.fn(),
	where: () => ({}),
	Timestamp: {
		fromDate: (d: Date) => ({ toMillis: () => d.getTime() }),
		fromMillis: (ms: number) => ({ toMillis: () => ms }),
	},
}));

jest.mock('../../../src/services', () => ({
	getFirestoreInstance: () => ({}),
}));

jest.mock('../../../src/mappers/trackerMapper', () => ({
	trackerDTOToFirestore: (tracker: {
		id: string;
		ownerId: string;
		name: string;
		color: string;
		isDefault: boolean;
		trackerType: string;
	}) => ({
		...tracker,
		createdAt: { toMillis: () => Date.now() },
	}),
	trackerFirestoreToDTO: (data: unknown) => data,
}));

describe('FirebaseTrackerRepository', () => {
	let repo: FirebaseTrackerRepository;
	let mockGetDoc: jest.Mock;
	let mockSetDoc: jest.Mock;

	beforeEach(() => {
		repo = new FirebaseTrackerRepository();
		mockGetDoc = require('@react-native-firebase/firestore').getDoc;
		mockSetDoc = require('@react-native-firebase/firestore').setDoc;
	});

	describe('ensureExists', () => {
		it('creates default tracker when tracker does not exist', async () => {
			mockGetDoc.mockResolvedValue({ exists: () => false });
			mockSetDoc.mockResolvedValue(undefined);

			await repo.ensureExists('tracker1', 'user1');

			expect(mockSetDoc).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({
					id: 'tracker1',
					ownerId: 'user1',
					name: 'Work Tracker',
					color: '#4CAF50',
					isDefault: true,
					trackerType: 'work',
				})
			);
		});

		it('does not create tracker when it already exists', async () => {
			mockGetDoc.mockResolvedValue({ exists: () => true });

			await repo.ensureExists('tracker1', 'user1');

			expect(mockSetDoc).not.toHaveBeenCalled();
		});

		it('handles Firestore errors during getDoc', async () => {
			mockGetDoc.mockRejectedValue(new Error('Firestore error'));

			await expect(
				repo.ensureExists('tracker1', 'user1')
			).rejects.toThrow();
		});

		it('handles Firestore errors during setDoc', async () => {
			mockGetDoc.mockResolvedValue({ exists: () => false });
			mockSetDoc.mockRejectedValue(new Error('Set error'));

			await expect(
				repo.ensureExists('tracker1', 'user1')
			).rejects.toThrow();
		});
	});

	describe('create', () => {
		it('creates tracker with valid data', async () => {
			const tracker: {
				id: string;
				ownerId: string;
				name: string;
				color: string;
				isDefault: boolean;
				trackerType: string;
			} = {
				id: 'tracker1',
				ownerId: 'user1',
				name: 'Test Tracker',
				color: '#FF0000',
				isDefault: false,
				trackerType: 'work',
			};
			mockSetDoc.mockResolvedValue(undefined);

			await repo.create(tracker, 'user1');

			expect(mockSetDoc).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({
					id: 'tracker1',
					ownerId: 'user1',
					name: 'Test Tracker',
				})
			);
		});

		it('throws error when ownerId does not match userId', async () => {
			const tracker: {
				id: string;
				ownerId: string;
				name: string;
				color: string;
				isDefault: boolean;
				trackerType: string;
			} = {
				id: 'tracker1',
				ownerId: 'user2',
				name: 'Test Tracker',
				color: '#FF0000',
				isDefault: false,
				trackerType: 'work',
			};

			await expect(repo.create(tracker, 'user1')).rejects.toThrow(
				'Tracker owner ID must match current user ID'
			);
		});
	});
});
