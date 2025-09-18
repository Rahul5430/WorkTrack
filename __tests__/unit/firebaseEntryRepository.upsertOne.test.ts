import { FirebaseEntryRepository } from '../../src/repositories/firebaseEntryRepository';
import { EntryDTO } from '../../src/types';

// Mock the dependencies
jest.mock('@react-native-firebase/firestore', () => ({
	collection: jest.fn(),
	doc: jest.fn(),
	setDoc: jest.fn(),
}));

jest.mock('../../src/services', () => ({
	getFirestoreInstance: jest.fn(),
}));

jest.mock('../../src/mappers/entryMapper', () => ({
	entryDTOToFirestore: jest.fn((entry) => ({
		...entry,
		createdAt: new Date(entry.createdAt),
		lastModified: new Date(entry.lastModified),
	})),
}));

jest.mock('../../src/logging', () => ({
	logger: {
		debug: jest.fn(),
		error: jest.fn(),
		warn: jest.fn(),
	},
}));

describe('FirebaseEntryRepository - upsertOne', () => {
	let repository: FirebaseEntryRepository;
	let mockFirestore: unknown;
	let mockCollection: unknown;
	let mockDoc: unknown;

	beforeEach(() => {
		jest.clearAllMocks();
		repository = new FirebaseEntryRepository();

		// Setup mock firestore instance
		mockFirestore = {};
		require('../../src/services').getFirestoreInstance.mockReturnValue(
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

	it('successfully upserts a single entry', async () => {
		require('@react-native-firebase/firestore').setDoc.mockResolvedValue(
			undefined
		);

		const entry: EntryDTO = {
			id: 'entry1',
			trackerId: 'tracker1',
			date: '2025-01-01',
			status: 'office',
			isAdvisory: false,
			needsSync: true,
			lastModified: Date.now(),
		};

		await repository.upsertOne(entry);

		expect(
			require('@react-native-firebase/firestore').collection
		).toHaveBeenCalledWith(
			mockFirestore,
			'trackers',
			'tracker1',
			'entries'
		);
		expect(
			require('@react-native-firebase/firestore').doc
		).toHaveBeenCalledWith(mockCollection, 'entry1');
		expect(
			require('@react-native-firebase/firestore').setDoc
		).toHaveBeenCalled();
		expect(require('../../src/logging').logger.debug).toHaveBeenCalledWith(
			'Successfully upserted entries to Firestore',
			{
				trackerId: 'tracker1',
				count: 1,
			}
		);
	});

	it('handles upsert error by throwing SyncError', async () => {
		const mockError = new Error('Firestore error');
		require('@react-native-firebase/firestore').setDoc.mockRejectedValue(
			mockError
		);

		const entry: EntryDTO = {
			id: 'entry1',
			trackerId: 'tracker1',
			date: '2025-01-01',
			status: 'office',
			isAdvisory: false,
			needsSync: true,
			lastModified: Date.now(),
		};

		await expect(repository.upsertOne(entry)).rejects.toThrow(
			'Failed to upsert entries to Firestore'
		);

		expect(require('../../src/logging').logger.error).toHaveBeenCalledWith(
			'Failed to upsert entries to Firestore',
			{
				error: mockError,
				trackerId: 'tracker1',
				count: 1,
			}
		);
	});
});
