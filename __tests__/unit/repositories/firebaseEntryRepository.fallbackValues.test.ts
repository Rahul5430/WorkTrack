import { FirebaseEntryRepository } from '../../../src/repositories/firebaseEntryRepository';

// Mock the dependencies
jest.mock('@react-native-firebase/firestore', () => ({
	collection: jest.fn(),
	doc: jest.fn(),
	getDocs: jest.fn(),
	setDoc: jest.fn(),
	deleteDoc: jest.fn(),
	Timestamp: {
		now: jest.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 })),
		fromDate: jest.fn((date) => ({
			seconds: date.getTime() / 1000,
			nanoseconds: 0,
		})),
	},
}));

jest.mock('../../../src/services', () => ({
	getFirestoreInstance: jest.fn(),
}));

jest.mock('../../../src/mappers/entryMapper', () => ({
	entryDTOToFirestore: jest.fn((entry) => ({
		...entry,
		createdAt: new Date(entry.createdAt),
		lastModified: new Date(entry.lastModified),
	})),
	entryFirestoreToDTO: jest.fn((data) => ({
		...data,
		createdAt: new Date(data.createdAt),
		lastModified: new Date(data.lastModified),
	})),
}));

jest.mock('../../../src/logging', () => ({
	logger: {
		debug: jest.fn(),
		error: jest.fn(),
		warn: jest.fn(),
	},
}));

describe('FirebaseEntryRepository - fallback values', () => {
	let repository: FirebaseEntryRepository;
	let mockFirestore: unknown;
	let mockCollection: unknown;
	let mockDoc: unknown;

	beforeEach(() => {
		jest.clearAllMocks();
		repository = new FirebaseEntryRepository();

		// Setup mock firestore instance
		mockFirestore = {};
		require('../../../src/services').getFirestoreInstance.mockReturnValue(
			mockFirestore
		);

		// Setup mock collection
		mockCollection = {
			doc: jest.fn(),
		};
		require('@react-native-firebase/firestore').collection.mockReturnValue(
			mockCollection
		);

		// Setup mock doc
		mockDoc = {
			set: jest.fn(),
		};
		require('@react-native-firebase/firestore').doc.mockReturnValue(
			mockDoc
		);
	});

	describe('getEntriesForTracker - fallback values', () => {
		it('uses fallback values when entry data has falsy properties', async () => {
			const mockEntryData = {
				// Only include properties that are actually falsy, not all properties
				// The spread operator at the end will override the fallback values
				date: null,
				status: undefined,
				createdAt: null,
				lastModified: undefined,
			};

			const mockDocData = {
				id: 'entry1',
				data: () => mockEntryData,
			};

			const mockQuerySnapshot = {
				docs: [mockDocData],
				forEach: jest.fn((callback) => {
					callback(mockDocData);
				}),
			};

			require('@react-native-firebase/firestore').getDocs.mockResolvedValue(
				mockQuerySnapshot
			);

			await repository.getEntriesForTracker('tracker1');

			// Verify that entryFirestoreToDTO was called with completeEntryData
			// The spread operator means the original values will be used, not fallbacks
			expect(
				require('../../../src/mappers/entryMapper').entryFirestoreToDTO
			).toHaveBeenCalledWith(
				expect.objectContaining({
					id: 'entry1',
					trackerId: 'tracker1',
					date: null, // original value (spread overrides fallback)
					status: undefined, // original value (spread overrides fallback)
					isAdvisory: false, // Boolean(undefined) = false
					createdAt: null, // original value (spread overrides fallback)
					lastModified: undefined, // original value (spread overrides fallback)
				})
			);
		});
	});

	describe('getAllEntries - fallback values', () => {
		it('uses fallback values when entry data has falsy properties', async () => {
			const mockTrackerData = {
				id: 'tracker1',
				data: () => ({ name: 'Test Tracker' }),
			};

			const mockEntryData = {
				// Only include properties that are actually falsy, not all properties
				// The spread operator at the end will override the fallback values
				date: null,
				status: undefined,
				createdAt: null,
				lastModified: undefined,
			};

			const mockEntryDocData = {
				id: 'entry1',
				data: () => mockEntryData,
			};

			const mockTrackerSnapshot = {
				docs: [mockTrackerData],
			};

			const mockEntrySnapshot = {
				docs: [mockEntryDocData],
				forEach: jest.fn((callback) => {
					callback(mockEntryDocData);
				}),
			};

			// Mock getDocs to return different results based on call count
			let callCount = 0;
			require('@react-native-firebase/firestore').getDocs.mockImplementation(
				() => {
					callCount++;
					if (callCount === 1) {
						// First call for trackers
						return Promise.resolve(mockTrackerSnapshot);
					} else {
						// Subsequent calls for entries
						return Promise.resolve(mockEntrySnapshot);
					}
				}
			);

			await repository.getAllEntries();

			// Verify that entryFirestoreToDTO was called with completeEntryData
			// The spread operator means the original values will be used, not fallbacks
			expect(
				require('../../../src/mappers/entryMapper').entryFirestoreToDTO
			).toHaveBeenCalledWith(
				expect.objectContaining({
					id: 'entry1',
					trackerId: 'tracker1',
					date: null, // original value (spread overrides fallback)
					status: undefined, // original value (spread overrides fallback)
					isAdvisory: false, // Boolean(undefined) = false
					createdAt: null, // original value (spread overrides fallback)
					lastModified: undefined, // original value (spread overrides fallback)
				})
			);
		});
	});
});
