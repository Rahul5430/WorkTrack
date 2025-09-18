import {
	collectionGroup,
	doc,
	getDoc,
	getDocs,
	query,
	setDoc,
	where,
} from '@react-native-firebase/firestore';

import { FirebaseTrackerRepository } from '../../src/repositories/firebaseTrackerRepository';
import { getFirestoreInstance } from '../../src/services';

// Mock dependencies
jest.mock('../../src/services', () => ({
	getFirestoreInstance: jest.fn(),
}));

jest.mock('@react-native-firebase/firestore', () => ({
	doc: jest.fn(),
	getDoc: jest.fn(),
	setDoc: jest.fn(),
	getDocs: jest.fn(),
	collectionGroup: jest.fn(),
	where: jest.fn(),
	query: jest.fn(),
}));

jest.mock('../../src/mappers/trackerMapper', () => ({
	trackerDTOToFirestore: jest.fn((data) => data),
}));

describe('FirebaseTrackerRepository - exists branch', () => {
	let repository: FirebaseTrackerRepository;
	let mockFirestore: unknown;
	let mockDoc: unknown;

	beforeEach(() => {
		jest.clearAllMocks();

		mockDoc = {
			id: 'tracker1',
		};

		mockFirestore = {};

		(getFirestoreInstance as jest.Mock).mockReturnValue(mockFirestore);
		(doc as jest.Mock).mockReturnValue(mockDoc);
		(getDoc as jest.Mock).mockResolvedValue({
			exists: jest.fn(),
		});
		(setDoc as jest.Mock).mockResolvedValue(undefined);

		repository = new FirebaseTrackerRepository();
	});

	describe('ensureExists', () => {
		it('should handle case when tracker does not exist', async () => {
			// Mock tracker snapshot that does not exist
			const mockTrackerSnapshot = {
				exists: jest.fn().mockReturnValue(false),
			};

			(getDoc as jest.Mock).mockResolvedValue(mockTrackerSnapshot);

			await repository.ensureExists('tracker1', 'user1');

			// Verify that getDoc was called
			expect(getDoc).toHaveBeenCalledWith(mockDoc);

			// Verify that exists() was called and returned false
			expect(mockTrackerSnapshot.exists).toHaveBeenCalled();

			// Verify that setDoc was called to create the tracker
			expect(setDoc).toHaveBeenCalled();
		});

		it('should handle case when tracker exists', async () => {
			// Mock tracker snapshot that exists
			const mockTrackerSnapshot = {
				exists: jest.fn().mockReturnValue(true),
			};

			(getDoc as jest.Mock).mockResolvedValue(mockTrackerSnapshot);

			await repository.ensureExists('tracker1', 'user1');

			// Verify that getDoc was called
			expect(getDoc).toHaveBeenCalledWith(mockDoc);

			// Verify that exists() was called and returned true
			expect(mockTrackerSnapshot.exists).toHaveBeenCalled();

			// Verify that setDoc was NOT called since tracker already exists
			expect(setDoc).not.toHaveBeenCalled();
		});
	});

	describe('listSharedWith', () => {
		it('should handle case when tracker snapshot does not exist', async () => {
			// Mock collectionGroup and getDocs for shares query
			const mockSharesQuery = {
				docs: [
					{
						ref: { path: 'trackers/tracker1/shares/share1' },
					},
				],
			};

			// Mock query and related functions
			(query as jest.Mock).mockReturnValue(mockSharesQuery);
			(getDocs as jest.Mock).mockResolvedValue(mockSharesQuery);
			(collectionGroup as jest.Mock).mockReturnValue({
				where: jest.fn().mockReturnValue(mockSharesQuery),
			});
			(where as jest.Mock).mockReturnValue(mockSharesQuery);

			// Mock tracker snapshot that does not exist
			const mockTrackerSnapshot = {
				exists: jest.fn().mockReturnValue(false),
			};

			(getDoc as jest.Mock).mockResolvedValue(mockTrackerSnapshot);

			const result = await repository.listSharedWith('user1');

			// Verify that getDoc was called for the tracker
			expect(getDoc).toHaveBeenCalledWith(mockDoc);

			// Verify that exists() was called and returned false
			expect(mockTrackerSnapshot.exists).toHaveBeenCalled();

			// Should return empty array since tracker doesn't exist
			expect(result).toEqual([]);
		});
	});
});
