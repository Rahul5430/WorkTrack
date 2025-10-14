import { jest } from '@jest/globals';

import type { EntryDTO } from '../../../src/types';

describe('SyncToRemoteUseCase edge lines', () => {
	afterEach(() => {
		jest.clearAllMocks();
		jest.resetModules();
	});

	it('execute throws SyncError when user not authenticated (line 53)', async () => {
		await jest.isolateModules(async () => {
			jest.doMock('@react-native-firebase/auth', () => ({
				getAuth: () => ({
					currentUser: null,
				}),
			}));
			jest.doMock('../../../src/errors', () => ({
				SyncError: class SyncError extends Error {
					context?: Record<string, unknown>;
					constructor(
						message: string,
						context: Record<string, unknown>
					) {
						super(message);
						this.name = 'SyncError';
						this.context = context;
					}
				},
			}));

			const {
				SyncToRemoteUseCaseImpl,
			} = require('../../../src/use-cases/syncToRemoteUseCase');

			// Mock repositories
			const mockLocalEntryRepository = {
				listUnsynced: jest
					.fn<() => Promise<EntryDTO[]>>()
					.mockResolvedValue([
						{
							id: 'test-entry',
							trackerId: 'test-tracker',
							date: '2025-01-01',
							status: 'office',
							isAdvisory: false,
							needsSync: true,
							lastModified: Date.now(),
						},
					]),
				upsertOne: jest.fn(),
				upsertMany: jest.fn(),
				delete: jest.fn(),
				markSynced: jest.fn(),
				getFailedSyncRecords: jest
					.fn<() => Promise<EntryDTO[]>>()
					.mockResolvedValue([]),
				getRecordsExceedingRetryLimit: jest
					.fn<() => Promise<EntryDTO[]>>()
					.mockResolvedValue([]),
				getEntriesForTracker: jest.fn(),
				getAllEntries: jest.fn(),
			};

			const mockFirebaseEntryRepository = {
				upsertMany: jest.fn(),
				getEntriesForTracker: jest.fn(),
			};

			const mockTrackerRepository = {
				create: jest.fn(),
				update: jest.fn(),
				listOwned: jest.fn(),
				listSharedWith: jest.fn(),
				ensureExists: jest.fn(),
				upsertMany: jest.fn(),
			};

			const useCase = new SyncToRemoteUseCaseImpl(
				mockLocalEntryRepository,
				mockFirebaseEntryRepository,
				mockTrackerRepository
			);

			await expect(useCase.execute()).rejects.toMatchObject({
				name: 'SyncError',
			});
		});
	});
});
