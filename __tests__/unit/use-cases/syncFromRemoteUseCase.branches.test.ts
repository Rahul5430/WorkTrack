import { logger } from '../../../src/logging';
import {
	ILocalEntryRepository,
	IRemoteEntryRepository,
	ITrackerRepository,
} from '../../../src/types';
import { SyncFromRemoteUseCaseImpl } from '../../../src/use-cases/syncFromRemoteUseCase';

// Mock the dependencies
jest.mock('@react-native-firebase/auth', () => ({
	getAuth: jest.fn(),
}));

jest.mock('../../../src/logging', () => ({
	logger: {
		debug: jest.fn(),
		error: jest.fn(),
		warn: jest.fn(),
		info: jest.fn(),
	},
}));

describe('SyncFromRemoteUseCase - branch coverage', () => {
	let useCase: SyncFromRemoteUseCaseImpl;
	let mockLocalEntryRepo: jest.Mocked<ILocalEntryRepository>;
	let mockTrackerRepo: jest.Mocked<ITrackerRepository>;
	let mockFirebaseEntryRepo: jest.Mocked<IRemoteEntryRepository>;
	let mockLocalTrackerRepo: jest.Mocked<ITrackerRepository>;
	let mockAuth: unknown;

	beforeEach(() => {
		jest.clearAllMocks();

		mockLocalEntryRepo = {
			upsertMany: jest.fn(),
		} as unknown as jest.Mocked<ILocalEntryRepository>;

		mockTrackerRepo = {
			listOwned: jest.fn(),
			listSharedWith: jest.fn(),
		} as unknown as jest.Mocked<ITrackerRepository>;

		mockFirebaseEntryRepo = {
			getEntriesForTracker: jest.fn(),
		} as unknown as jest.Mocked<IRemoteEntryRepository>;

		mockLocalTrackerRepo = {
			upsertMany: jest.fn(),
		} as unknown as jest.Mocked<ITrackerRepository>;

		mockAuth = {
			currentUser: {
				uid: 'user1',
				displayName: 'Test User',
				email: 'test@example.com',
			},
		};

		require('@react-native-firebase/auth').getAuth.mockReturnValue(
			mockAuth
		);

		useCase = new SyncFromRemoteUseCaseImpl(
			mockLocalEntryRepo,
			mockTrackerRepo,
			mockFirebaseEntryRepo,
			mockLocalTrackerRepo
		);
	});

	describe('execute', () => {
		it('handles error when fetching entries for a tracker', async () => {
			const mockTrackers = [
				{
					id: 'tracker1',
					name: 'Test Tracker 1',
					ownerId: 'user1',
					trackerType: 'work',
					createdAt: Date.now(),
					isDefault: false,
					color: '#000000',
				},
				{
					id: 'tracker2',
					name: 'Test Tracker 2',
					ownerId: 'user1',
					trackerType: 'work',
					createdAt: Date.now(),
					isDefault: false,
					color: '#000000',
				},
			];

			mockTrackerRepo.listOwned.mockResolvedValue(mockTrackers);
			mockTrackerRepo.listSharedWith.mockResolvedValue([]);
			mockLocalTrackerRepo.upsertMany.mockResolvedValue(undefined);

			// Mock getEntriesForTracker to throw an error for tracker1 but succeed for tracker2
			mockFirebaseEntryRepo.getEntriesForTracker
				.mockRejectedValueOnce(new Error('Firestore error'))
				.mockResolvedValueOnce([
					{
						id: 'entry1',
						trackerId: 'tracker2',
						date: '2025-01-01',
						status: 'office',
						isAdvisory: false,
						needsSync: false,
						lastModified: Date.now(),
					},
				]);

			mockLocalEntryRepo.upsertMany.mockResolvedValue(undefined);

			await useCase.execute('user1');

			// Verify that the error was logged
			expect(logger.warn).toHaveBeenCalledWith(
				'Failed to fetch entries for tracker',
				{
					trackerId: 'tracker1',
					error: expect.any(Error),
				}
			);

			// Verify that the successful tracker was still processed
			expect(logger.debug).toHaveBeenCalledWith(
				'Fetched entries for tracker',
				{
					trackerId: 'tracker2',
					count: 1,
				}
			);

			// Verify that the successful entries were still synced
			expect(mockLocalEntryRepo.upsertMany).toHaveBeenCalledWith(
				'tracker2',
				[
					{
						id: 'entry1',
						trackerId: 'tracker2',
						date: '2025-01-01',
						status: 'office',
						isAdvisory: false,
						needsSync: false,
						lastModified: expect.any(Number),
					},
				]
			);
		});

		it('handles error when fetching entries for multiple trackers', async () => {
			const mockTrackers = [
				{
					id: 'tracker1',
					name: 'Test Tracker 1',
					ownerId: 'user1',
					trackerType: 'work',
					createdAt: Date.now(),
					isDefault: false,
					color: '#000000',
				},
				{
					id: 'tracker2',
					name: 'Test Tracker 2',
					ownerId: 'user1',
					trackerType: 'work',
					createdAt: Date.now(),
					isDefault: false,
					color: '#000000',
				},
				{
					id: 'tracker3',
					name: 'Test Tracker 3',
					ownerId: 'user1',
					trackerType: 'work',
					createdAt: Date.now(),
					isDefault: false,
					color: '#000000',
				},
			];

			mockTrackerRepo.listOwned.mockResolvedValue(mockTrackers);
			mockTrackerRepo.listSharedWith.mockResolvedValue([]);
			mockLocalTrackerRepo.upsertMany.mockResolvedValue(undefined);

			// Mock getEntriesForTracker to throw errors for tracker1 and tracker3 but succeed for tracker2
			mockFirebaseEntryRepo.getEntriesForTracker
				.mockRejectedValueOnce(new Error('Firestore error 1'))
				.mockResolvedValueOnce([
					{
						id: 'entry1',
						trackerId: 'tracker2',
						date: '2025-01-01',
						status: 'office',
						isAdvisory: false,
						needsSync: false,
						lastModified: Date.now(),
					},
				])
				.mockRejectedValueOnce(new Error('Firestore error 2'));

			mockLocalEntryRepo.upsertMany.mockResolvedValue(undefined);

			await useCase.execute('user1');

			// Verify that both errors were logged
			expect(logger.warn).toHaveBeenCalledWith(
				'Failed to fetch entries for tracker',
				{
					trackerId: 'tracker1',
					error: expect.any(Error),
				}
			);

			expect(logger.warn).toHaveBeenCalledWith(
				'Failed to fetch entries for tracker',
				{
					trackerId: 'tracker3',
					error: expect.any(Error),
				}
			);

			// Verify that the successful tracker was still processed
			expect(logger.debug).toHaveBeenCalledWith(
				'Fetched entries for tracker',
				{
					trackerId: 'tracker2',
					count: 1,
				}
			);

			// Verify that the successful entries were still synced
			expect(mockLocalEntryRepo.upsertMany).toHaveBeenCalledWith(
				'tracker2',
				[
					{
						id: 'entry1',
						trackerId: 'tracker2',
						date: '2025-01-01',
						status: 'office',
						isAdvisory: false,
						needsSync: false,
						lastModified: expect.any(Number),
					},
				]
			);
		});

		it('handles case when no trackers are found', async () => {
			mockTrackerRepo.listOwned.mockResolvedValue([]);
			mockTrackerRepo.listSharedWith.mockResolvedValue([]);

			await useCase.execute('user1');

			// Verify that no tracker sync was attempted
			expect(mockLocalTrackerRepo.upsertMany).not.toHaveBeenCalled();
			expect(logger.debug).not.toHaveBeenCalledWith(
				'Syncing trackers to local database',
				expect.any(Object)
			);
		});

		it('handles case when no entries are found', async () => {
			const mockTrackers = [
				{
					id: 'tracker1',
					name: 'Test Tracker 1',
					ownerId: 'user1',
					trackerType: 'work',
					createdAt: Date.now(),
					isDefault: false,
					color: '#000000',
				},
			];

			mockTrackerRepo.listOwned.mockResolvedValue(mockTrackers);
			mockTrackerRepo.listSharedWith.mockResolvedValue([]);
			mockLocalTrackerRepo.upsertMany.mockResolvedValue(undefined);

			// Mock getEntriesForTracker to return empty arrays
			mockFirebaseEntryRepo.getEntriesForTracker.mockResolvedValue([]);

			await useCase.execute('user1');

			// Verify that tracker sync was attempted
			expect(mockLocalTrackerRepo.upsertMany).toHaveBeenCalledWith(
				mockTrackers
			);

			// Verify that no entry sync was attempted
			expect(mockLocalEntryRepo.upsertMany).not.toHaveBeenCalled();
			expect(logger.info).not.toHaveBeenCalledWith(
				expect.stringContaining('Synced'),
				expect.any(Object)
			);
		});

		it('handles entries with same trackerId in map', async () => {
			const mockTrackers = [
				{
					id: 'tracker1',
					name: 'Test Tracker 1',
					ownerId: 'user1',
					trackerType: 'work',
					createdAt: Date.now(),
					isDefault: false,
					color: '#000000',
				},
			];

			mockTrackerRepo.listOwned.mockResolvedValue(mockTrackers);
			mockTrackerRepo.listSharedWith.mockResolvedValue([]);
			mockLocalTrackerRepo.upsertMany.mockResolvedValue(undefined);

			// Mock getEntriesForTracker to return multiple entries with same trackerId
			mockFirebaseEntryRepo.getEntriesForTracker.mockResolvedValue([
				{
					id: 'entry1',
					trackerId: 'tracker1',
					date: '2025-01-01',
					status: 'office',
					isAdvisory: false,
					needsSync: false,
					lastModified: Date.now(),
				},
				{
					id: 'entry2',
					trackerId: 'tracker1',
					date: '2025-01-02',
					status: 'home',
					isAdvisory: false,
					needsSync: false,
					lastModified: Date.now(),
				},
			]);

			mockLocalEntryRepo.upsertMany.mockResolvedValue(undefined);

			await useCase.execute('user1');

			// Verify that entries were synced
			expect(mockLocalEntryRepo.upsertMany).toHaveBeenCalledWith(
				'tracker1',
				expect.arrayContaining([
					expect.objectContaining({
						id: 'entry1',
						trackerId: 'tracker1',
					}),
					expect.objectContaining({
						id: 'entry2',
						trackerId: 'tracker1',
					}),
				])
			);
		});
	});
});
