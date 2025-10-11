import {
	ILocalEntryRepository,
	IRemoteEntryRepository,
	ITrackerRepository,
} from '../../../src/types';
import { UserManagementUseCaseImpl } from '../../../src/use-cases/userManagementUseCase';

// Mock the dependencies
jest.mock('../../../src/repositories', () => ({
	WatermelonEntryRepository: jest.fn(),
	WatermelonTrackerRepository: jest.fn(),
}));

jest.mock('../../../src/logging', () => ({
	logger: {
		debug: jest.fn(),
		error: jest.fn(),
		warn: jest.fn(),
		info: jest.fn(),
	},
}));

describe('UserManagementUseCase - checkAndFixRecordsWithoutTrackerId', () => {
	let useCase: UserManagementUseCaseImpl;
	let mockTrackerRepo: jest.Mocked<ITrackerRepository>;
	let mockEntryRepo: jest.Mocked<ILocalEntryRepository>;
	let mockFirebaseEntryRepo: jest.Mocked<IRemoteEntryRepository>;

	beforeEach(() => {
		jest.clearAllMocks();

		mockTrackerRepo = {
			listOwned: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			listSharedWith: jest.fn(),
			ensureExists: jest.fn(),
			upsertMany: jest.fn(),
		} as unknown as jest.Mocked<ITrackerRepository>;

		mockEntryRepo = {
			listUnsynced: jest.fn(),
			markSynced: jest.fn(),
			getFailedSyncRecords: jest.fn(),
			getRecordsExceedingRetryLimit: jest.fn(),
			upsertOne: jest.fn(),
			upsertMany: jest.fn(),
			delete: jest.fn(),
			getEntriesForTracker: jest.fn(),
			getAllEntries: jest.fn(),
		} as unknown as jest.Mocked<ILocalEntryRepository>;

		mockFirebaseEntryRepo = {
			upsertMany: jest.fn(),
			upsertOne: jest.fn(),
			delete: jest.fn(),
			getEntriesForTracker: jest.fn(),
			getAllEntries: jest.fn(),
		} as unknown as jest.Mocked<IRemoteEntryRepository>;

		useCase = new UserManagementUseCaseImpl(
			mockTrackerRepo,
			mockEntryRepo,
			mockFirebaseEntryRepo
		);
	});

	it('handles error when deleting entry with incorrect ID format', async () => {
		// Mock entries with incorrect ID format
		const entriesWithIncorrectId = [
			{
				id: 'invalid-id-format',
				trackerId: 'tracker1',
				date: '2025-01-01',
				status: 'office',
				isAdvisory: false,
				needsSync: true,
				lastModified: Date.now(),
			},
		];

		mockEntryRepo.getAllEntries.mockResolvedValue(entriesWithIncorrectId);
		mockEntryRepo.delete.mockRejectedValue(new Error('Delete failed'));

		await useCase.checkAndFixRecordsWithoutTrackerId();

		expect(mockEntryRepo.getAllEntries).toHaveBeenCalled();
		expect(mockEntryRepo.delete).toHaveBeenCalledWith('invalid-id-format');
		expect(
			require('../../../src/logging').logger.error
		).toHaveBeenCalledWith('Failed to cleanup entry with incorrect ID', {
			entryId: 'invalid-id-format',
			error: expect.any(Error),
		});
	});

	it('successfully cleans up entries with correct ID format', async () => {
		// Mock entries with correct ID format (should not be deleted)
		const entriesWithCorrectId = [
			{
				id: '2025-01-01', // Valid date format
				trackerId: 'tracker1',
				date: '2025-01-01',
				status: 'office',
				isAdvisory: false,
				needsSync: true,
				lastModified: Date.now(),
			},
		];

		mockEntryRepo.getAllEntries.mockResolvedValue(entriesWithCorrectId);

		await useCase.checkAndFixRecordsWithoutTrackerId();

		expect(mockEntryRepo.getAllEntries).toHaveBeenCalled();
		expect(mockEntryRepo.delete).not.toHaveBeenCalled();
		expect(
			require('../../../src/logging').logger.info
		).toHaveBeenCalledWith('No entries with incorrect ID format found');
	});

	it('handles mixed entries with some incorrect ID formats', async () => {
		const mixedEntries = [
			{
				id: '2025-01-01', // Valid date format
				trackerId: 'tracker1',
				date: '2025-01-01',
				status: 'office',
				isAdvisory: false,
				needsSync: true,
				lastModified: Date.now(),
			},
			{
				id: 'invalid-id', // Invalid format
				trackerId: 'tracker1',
				date: '2025-01-02',
				status: 'home',
				isAdvisory: false,
				needsSync: true,
				lastModified: Date.now(),
			},
		];

		mockEntryRepo.getAllEntries.mockResolvedValue(mixedEntries);
		mockEntryRepo.delete.mockResolvedValue(undefined);

		await useCase.checkAndFixRecordsWithoutTrackerId();

		expect(mockEntryRepo.getAllEntries).toHaveBeenCalled();
		expect(mockEntryRepo.delete).toHaveBeenCalledWith('invalid-id');
		expect(
			require('../../../src/logging').logger.info
		).toHaveBeenCalledWith(
			'Successfully cleaned up entries with incorrect ID format',
			{ cleanedCount: 1 }
		);
	});
});
