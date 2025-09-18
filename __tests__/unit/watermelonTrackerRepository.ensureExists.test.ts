import { WatermelonTrackerRepository } from '../../src/repositories/watermelonTrackerRepository';

// Mock the dependencies
jest.mock('../../src/db/watermelon', () => ({
	database: {
		write: jest.fn(),
		get: jest.fn(() => ({
			find: jest.fn(),
			create: jest.fn(),
		})),
	},
}));

jest.mock('../../src/mappers/trackerMapper', () => ({
	trackerDTOToModelData: jest.fn((tracker) => ({
		...tracker,
		createdAt: new Date(tracker.createdAt),
	})),
}));

jest.mock('../../src/logging', () => ({
	logger: {
		debug: jest.fn(),
		error: jest.fn(),
		warn: jest.fn(),
	},
}));

describe('WatermelonTrackerRepository - ensureExists', () => {
	let repository: WatermelonTrackerRepository;
	let mockDatabase: unknown;
	let mockTrackerCollection: {
		find: jest.Mock;
		create: jest.Mock;
	};

	beforeEach(() => {
		jest.clearAllMocks();
		repository = new WatermelonTrackerRepository();

		// Setup mock database
		mockDatabase = {
			write: jest.fn(),
			get: jest.fn(),
		};
		require('../../src/db/watermelon').database = mockDatabase;

		// Setup mock tracker collection
		mockTrackerCollection = {
			find: jest.fn(),
			create: jest.fn(),
		};
		require('../../src/db/watermelon').database.get.mockReturnValue(
			mockTrackerCollection
		);
	});

	it('creates default tracker when tracker does not exist', async () => {
		// Mock find to return null (tracker doesn't exist)
		mockTrackerCollection.find.mockResolvedValue(null);
		require('../../src/db/watermelon').database.write.mockImplementation(
			async (callback: () => Promise<void>) => {
				await callback();
			}
		);

		await repository.ensureExists('tracker1', 'user1');

		expect(
			require('../../src/db/watermelon').database.write
		).toHaveBeenCalled();
		expect(mockTrackerCollection.find).toHaveBeenCalledWith('tracker1');
		expect(mockTrackerCollection.create).toHaveBeenCalled();
		expect(require('../../src/logging').logger.debug).toHaveBeenCalledWith(
			'Created default tracker in WatermelonDB',
			expect.objectContaining({
				trackerId: 'tracker1',
				ownerId: 'user1',
			})
		);
	});

	it('does nothing when tracker already exists', async () => {
		// Mock find to return existing tracker
		const existingTracker = { id: 'tracker1', ownerId: 'user1' };
		mockTrackerCollection.find.mockResolvedValue(existingTracker);

		await repository.ensureExists('tracker1', 'user1');

		expect(
			require('../../src/db/watermelon').database.write
		).not.toHaveBeenCalled();
		expect(mockTrackerCollection.create).not.toHaveBeenCalled();
		// No debug log when tracker already exists
		expect(
			require('../../src/logging').logger.debug
		).not.toHaveBeenCalled();
	});

	it('handles error when creating tracker', async () => {
		const mockError = new Error('Database error');
		// Mock the database.write to throw an error
		require('../../src/db/watermelon').database.write.mockRejectedValue(
			mockError
		);

		await expect(
			repository.ensureExists('tracker1', 'user1')
		).rejects.toThrow('Failed to ensure tracker exists');

		expect(require('../../src/logging').logger.error).toHaveBeenCalledWith(
			'Failed to ensure tracker exists in WatermelonDB',
			expect.objectContaining({
				error: expect.any(Error), // The error will be a SyncError wrapping the original
				trackerId: 'tracker1',
				ownerId: 'user1',
			})
		);
	});
});
