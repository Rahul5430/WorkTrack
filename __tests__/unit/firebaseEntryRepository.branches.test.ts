import { FirebaseEntryRepository } from '../../src/repositories/firebaseEntryRepository';
import { EntryDTO } from '../../src/types';

// Mock the dependencies
jest.mock('@react-native-firebase/firestore', () => ({
	collection: jest.fn(),
	doc: jest.fn(),
	getDocs: jest.fn(),
	setDoc: jest.fn(),
	deleteDoc: jest.fn(),
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
	entryFirestoreToDTO: jest.fn((data) => ({
		...data,
		createdAt: new Date(data.createdAt),
		lastModified: new Date(data.lastModified),
	})),
}));

jest.mock('../../src/logging', () => ({
	logger: {
		debug: jest.fn(),
		error: jest.fn(),
		warn: jest.fn(),
	},
}));

type MockDoc = {
	id: string;
	data: () => unknown;
};

type MockQuerySnapshot = {
	docs: MockDoc[];
	forEach: jest.Mock;
};

describe('FirebaseEntryRepository - branch coverage', () => {
	let repository: FirebaseEntryRepository;
	let mockFirestore: unknown;
	let mockCollection: unknown;
	let mockDoc: unknown;
	let mockQuerySnapshot: MockQuerySnapshot;

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

		// Setup mock query snapshot
		mockQuerySnapshot = {
			docs: [],
			forEach: jest.fn(),
		};
		require('@react-native-firebase/firestore').getDocs.mockResolvedValue(
			mockQuerySnapshot
		);
	});

	describe('getEntriesForTracker', () => {
		it('handles permission denied errors by returning empty array', async () => {
			const mockError = Object.assign(new Error('Permission denied'), {
				code: 'firestore/permission-denied',
			});
			require('@react-native-firebase/firestore').getDocs.mockRejectedValue(
				mockError
			);

			const result = await repository.getEntriesForTracker('tracker1');

			expect(result).toEqual([]);
			expect(
				require('../../src/logging').logger.warn
			).toHaveBeenCalledWith(
				'Permission denied for entries, returning empty array',
				{ trackerId: 'tracker1' }
			);
		});

		it('handles generic errors by throwing SyncError', async () => {
			const mockError = new Error('Generic Firestore error');
			require('@react-native-firebase/firestore').getDocs.mockRejectedValue(
				mockError
			);

			await expect(
				repository.getEntriesForTracker('tracker1')
			).rejects.toThrow('Failed to fetch entries from Firestore');
		});

		it('successfully fetches entries', async () => {
			const mockEntryData = {
				id: 'entry1',
				date: '2025-01-01',
				status: 'office',
				isAdvisory: false,
				createdAt: new Date(),
				lastModified: new Date(),
			};

			const mockDocData = {
				id: 'entry1',
				data: () => mockEntryData,
			};

			mockQuerySnapshot.docs = [mockDocData];
			mockQuerySnapshot.forEach.mockImplementation(
				(callback: (doc: MockDoc) => void) => {
					callback(mockDocData);
				}
			);

			const result = await repository.getEntriesForTracker('tracker1');

			expect(result).toHaveLength(1);
			expect(
				require('../../src/logging').logger.debug
			).toHaveBeenCalledWith('Fetched entries from Firestore', {
				trackerId: 'tracker1',
				count: 1,
			});
		});
	});

	describe('getAllEntries', () => {
		it('handles permission denied errors by returning empty array', async () => {
			const mockError = Object.assign(new Error('Permission denied'), {
				code: 'firestore/permission-denied',
			});
			require('@react-native-firebase/firestore').getDocs.mockRejectedValue(
				mockError
			);

			const result = await repository.getAllEntries();

			expect(result).toEqual([]);
			expect(
				require('../../src/logging').logger.warn
			).toHaveBeenCalledWith(
				'Permission denied for entries, returning empty array'
			);
		});

		it('handles generic errors by throwing SyncError', async () => {
			const mockError = new Error('Generic Firestore error');
			require('@react-native-firebase/firestore').getDocs.mockRejectedValue(
				mockError
			);

			await expect(repository.getAllEntries()).rejects.toThrow(
				'Failed to fetch all entries from Firestore'
			);
		});

		it('successfully fetches all entries', async () => {
			const mockTrackerData = {
				id: 'tracker1',
				data: () => ({ name: 'Test Tracker' }),
			};

			const mockEntryData = {
				id: 'entry1',
				data: () => ({
					date: '2025-01-01',
					status: 'office',
					isAdvisory: false,
					lastModified: new Date(),
				}),
			};

			const mockTrackerSnapshot = {
				docs: [mockTrackerData],
			};

			const mockEntrySnapshot = {
				docs: [mockEntryData],
				forEach: jest.fn((callback) => {
					callback(mockEntryData);
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

			const result = await repository.getAllEntries();

			expect(result).toHaveLength(1);
			expect(
				require('../../src/logging').logger.debug
			).toHaveBeenCalledWith('Fetched all entries from Firestore', {
				count: 1,
				trackersCount: 1,
			});
		});
	});

	describe('delete', () => {
		it('handles entry not found in any tracker', async () => {
			const mockTrackerData = {
				id: 'tracker1',
				data: () => ({ name: 'Test Tracker' }),
			};

			const mockTrackerSnapshot = {
				docs: [mockTrackerData],
			};

			require('@react-native-firebase/firestore').getDocs.mockResolvedValue(
				mockTrackerSnapshot
			);
			require('@react-native-firebase/firestore').deleteDoc.mockRejectedValue(
				new Error('Not found')
			);

			await repository.delete('nonexistent-entry');

			expect(
				require('../../src/logging').logger.debug
			).toHaveBeenCalledWith('Entry not found in any Firebase tracker', {
				entryId: 'nonexistent-entry',
			});
		});

		it('successfully deletes entry from first matching tracker', async () => {
			const mockTrackerData = {
				id: 'tracker1',
				data: () => ({ name: 'Test Tracker' }),
			};

			const mockTrackerSnapshot = {
				docs: [mockTrackerData],
			};

			require('@react-native-firebase/firestore').getDocs.mockResolvedValue(
				mockTrackerSnapshot
			);
			require('@react-native-firebase/firestore').deleteDoc.mockResolvedValue(
				undefined
			);

			await repository.delete('entry1');

			expect(
				require('@react-native-firebase/firestore').deleteDoc
			).toHaveBeenCalled();
			expect(
				require('../../src/logging').logger.debug
			).toHaveBeenCalledWith('Successfully deleted entry from Firebase', {
				entryId: 'entry1',
				trackerId: 'tracker1',
			});
		});

		it('handles generic errors by throwing SyncError', async () => {
			const mockError = new Error('Generic Firestore error');
			require('@react-native-firebase/firestore').getDocs.mockRejectedValue(
				mockError
			);

			await expect(repository.delete('entry1')).rejects.toThrow(
				'Failed to delete entry from Firebase'
			);
		});

		it('handles multiple trackers with entry not found in first', async () => {
			const mockTrackerData1 = {
				id: 'tracker1',
				data: () => ({ name: 'Test Tracker 1' }),
			};
			const mockTrackerData2 = {
				id: 'tracker2',
				data: () => ({ name: 'Test Tracker 2' }),
			};

			const mockTrackerSnapshot = {
				docs: [mockTrackerData1, mockTrackerData2],
			};

			require('@react-native-firebase/firestore').getDocs.mockResolvedValue(
				mockTrackerSnapshot
			);

			// First deleteDoc call fails, second succeeds
			require('@react-native-firebase/firestore')
				.deleteDoc.mockRejectedValueOnce(
					new Error('Not found in tracker1')
				)
				.mockResolvedValueOnce(undefined);

			await repository.delete('entry1');

			expect(
				require('@react-native-firebase/firestore').deleteDoc
			).toHaveBeenCalledTimes(2);
			expect(
				require('../../src/logging').logger.debug
			).toHaveBeenCalledWith('Successfully deleted entry from Firebase', {
				entryId: 'entry1',
				trackerId: 'tracker2',
			});
		});
	});

	describe('upsertMany', () => {
		it('handles upsert errors by throwing SyncError', async () => {
			const mockError = new Error('Firestore error');
			require('@react-native-firebase/firestore').setDoc.mockRejectedValue(
				mockError
			);

			const entries: EntryDTO[] = [
				{
					id: 'entry1',
					trackerId: 'tracker1',
					date: '2025-01-01',
					status: 'office',
					isAdvisory: false,
					needsSync: true,
					lastModified: Date.now(),
				},
			];

			await expect(
				repository.upsertMany('tracker1', entries)
			).rejects.toThrow('Failed to upsert entries to Firestore');
		});

		it('successfully upserts entries', async () => {
			require('@react-native-firebase/firestore').setDoc.mockResolvedValue(
				undefined
			);

			const entries: EntryDTO[] = [
				{
					id: 'entry1',
					trackerId: 'tracker1',
					date: '2025-01-01',
					status: 'office',
					isAdvisory: false,
					needsSync: true,
					lastModified: Date.now(),
				},
			];

			await repository.upsertMany('tracker1', entries);

			expect(
				require('@react-native-firebase/firestore').setDoc
			).toHaveBeenCalled();
			expect(
				require('../../src/logging').logger.debug
			).toHaveBeenCalledWith(
				'Successfully upserted entries to Firestore',
				{ trackerId: 'tracker1', count: 1 }
			);
		});
	});
});
