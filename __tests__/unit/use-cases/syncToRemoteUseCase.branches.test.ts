import { SyncError } from '../../../src/errors';
import {
	ILocalEntryRepository,
	IRemoteEntryRepository,
	ITrackerRepository,
} from '../../../src/types';
import { SyncToRemoteUseCaseImpl } from '../../../src/use-cases/syncToRemoteUseCase';

// Mock the dependencies
jest.mock('../../../src/repositories', () => ({
	FirebaseEntryRepository: jest.fn(),
	FirebaseTrackerRepository: jest.fn(),
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

describe('SyncToRemoteUseCase - branch coverage', () => {
	let useCase: SyncToRemoteUseCaseImpl;
	let mockEntryRepo: jest.Mocked<ILocalEntryRepository>;
	let mockTrackerRepo: jest.Mocked<ITrackerRepository>;

	beforeEach(() => {
		jest.clearAllMocks();

		mockEntryRepo = {
			listUnsynced: jest.fn(),
			upsertMany: jest.fn(),
			markSynced: jest.fn(),
		} as unknown as jest.Mocked<ILocalEntryRepository>;

		mockTrackerRepo = {
			ensureExists: jest.fn(),
		} as unknown as jest.Mocked<ITrackerRepository>;

		require('../../../src/repositories').FirebaseEntryRepository.mockReturnValue(
			mockEntryRepo
		);
		require('../../../src/repositories').FirebaseTrackerRepository.mockReturnValue(
			mockTrackerRepo
		);
		require('../../../src/services').getFirestoreInstance.mockReturnValue(
			{}
		);

		useCase = new SyncToRemoteUseCaseImpl(
			mockEntryRepo,
			mockEntryRepo as jest.Mocked<IRemoteEntryRepository>,
			mockTrackerRepo
		);
	});

	describe('execute', () => {
		it('handles Error instance in catch block', async () => {
			const mockError = new Error('Test error message');

			mockEntryRepo.listUnsynced.mockResolvedValue([
				{
					id: 'entry1',
					trackerId: 'tracker1',
					date: '2025-01-01',
					status: 'office',
					isAdvisory: false,
					needsSync: true,
					lastModified: Date.now(),
				},
			]);

			mockTrackerRepo.ensureExists.mockResolvedValue(undefined);
			mockEntryRepo.upsertMany.mockRejectedValue(mockError);

			await expect(useCase.execute()).rejects.toThrow(SyncError);
			await expect(useCase.execute()).rejects.toThrow(
				'Failed to sync to remote: Test error message'
			);

			// Verify that the error handling branches were executed
			expect(
				require('../../../src/logging').logger.error
			).toHaveBeenCalledWith('Failed to sync entries to remote', {
				error: mockError,
			});
			expect(
				require('../../../src/logging').logger.warn
			).toHaveBeenCalledWith(
				'Marking entries with sync error for retry',
				{ error: 'Test error message' }
			);
		});

		it('handles non-Error instance in catch block', async () => {
			const mockError = 'String error';

			mockEntryRepo.listUnsynced.mockResolvedValue([
				{
					id: 'entry1',
					trackerId: 'tracker1',
					date: '2025-01-01',
					status: 'office',
					isAdvisory: false,
					needsSync: true,
					lastModified: Date.now(),
				},
			]);

			mockTrackerRepo.ensureExists.mockResolvedValue(undefined);
			mockEntryRepo.upsertMany.mockRejectedValue(mockError);

			await expect(useCase.execute()).rejects.toThrow(SyncError);
			await expect(useCase.execute()).rejects.toThrow(
				'Failed to sync to remote: Unknown error'
			);

			// Verify that the error handling branches were executed
			expect(
				require('../../../src/logging').logger.error
			).toHaveBeenCalledWith('Failed to sync entries to remote', {
				error: mockError,
			});
			// For non-Error instances, warn is not called
			expect(
				require('../../../src/logging').logger.warn
			).not.toHaveBeenCalled();
		});
	});
});
