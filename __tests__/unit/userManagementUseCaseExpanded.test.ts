import { ValidationError } from '../../src/errors';
import type {
	EntryDTO,
	ILocalEntryRepository,
	TrackerDTO,
} from '../../src/types';
import { UserManagementUseCaseImpl } from '../../src/use-cases/userManagementUseCase';

jest.mock('@react-native-async-storage/async-storage', () => ({
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
}));

jest.mock('@react-native-firebase/auth', () => ({
	getAuth: () => ({
		currentUser: { uid: 'user1' },
	}),
}));

describe('UserManagementUseCase (expanded)', () => {
	let useCase: UserManagementUseCaseImpl;
	let mockTrackers: import('../../src/types').ITrackerRepository;
	let mockEntries: ILocalEntryRepository;
	let mockFirebaseEntries: import('../../src/types').IRemoteEntryRepository;
	let mockAsyncStorage: {
		getItem: jest.Mock;
		setItem: jest.Mock;
		removeItem: jest.Mock;
	};

	beforeEach(() => {
		mockTrackers = {
			create: jest.fn(async (tracker: TrackerDTO, userId: string) => {
				void tracker;
				void userId;
			}),
			update: jest.fn(async () => {}),
			listOwned: jest.fn(async (userId: string) => {
				void userId;
				return [] as TrackerDTO[];
			}),
			listSharedWith: jest.fn(async (userId: string) => {
				void userId;
				return [] as TrackerDTO[];
			}),
			ensureExists: jest.fn(async (id: string, ownerId: string) => {
				void id;
				void ownerId;
			}),
			upsertMany: jest.fn(async (trackers: TrackerDTO[]) => {
				void trackers;
			}),
		};
		mockEntries = {
			// IBaseEntryRepository
			upsertMany: jest.fn(
				async (_trackerId: string, _entries: EntryDTO[]) => {
					void _trackerId;
					void _entries;
				}
			),
			upsertOne: jest.fn(async (_entry: EntryDTO) => {
				void _entry;
			}),
			delete: jest.fn(async (_id: string) => {
				void _id;
			}),
			getEntriesForTracker: jest.fn(async (_trackerId: string) => {
				void _trackerId;
				return [] as EntryDTO[];
			}),
			getAllEntries: jest.fn(async () => [] as EntryDTO[]),
			// ILocalEntryRepository
			listUnsynced: jest.fn(async () => [] as EntryDTO[]),
			markSynced: jest.fn(async (_entries: EntryDTO[]) => {
				void _entries;
			}),
			getFailedSyncRecords: jest.fn(async () => [] as EntryDTO[]),
			getRecordsExceedingRetryLimit: jest.fn(async (_limit: number) => {
				void _limit;
				return [] as EntryDTO[];
			}),
		};
		mockFirebaseEntries = {
			upsertMany: jest.fn(
				async (_trackerId: string, _entries: EntryDTO[]) => {
					void _trackerId;
					void _entries;
				}
			),
			upsertOne: jest.fn(async (_entry: EntryDTO) => {
				void _entry;
			}),
			delete: jest.fn(async (_entryId: string) => {
				void _entryId;
			}),
			getEntriesForTracker: jest.fn(async (_trackerId: string) => {
				void _trackerId;
				return [] as EntryDTO[];
			}),
			getAllEntries: jest.fn(async () => [] as EntryDTO[]),
		};
		useCase = new UserManagementUseCaseImpl(
			mockTrackers,
			mockEntries,
			mockFirebaseEntries
		);
		mockAsyncStorage = require('@react-native-async-storage/async-storage');
	});

	describe('ensureUserHasTracker', () => {
		it('returns existing tracker when user has trackers', async () => {
			const existingTracker = {
				id: 'tracker1',
				name: 'Existing',
				ownerId: 'user1',
			};
			(mockTrackers.listOwned as unknown as jest.Mock).mockResolvedValue([
				existingTracker,
			]);

			const result = await useCase.ensureUserHasTracker('user1');

			expect(result).toBe(existingTracker);
			expect(mockTrackers.create).not.toHaveBeenCalled();
		});

		it('creates default tracker when user has no trackers', async () => {
			(mockTrackers.listOwned as unknown as jest.Mock).mockResolvedValue(
				[]
			);
			(mockTrackers.create as unknown as jest.Mock).mockResolvedValue(
				undefined
			);

			const result = await useCase.ensureUserHasTracker('user1');

			expect(result).toMatchObject({
				name: 'Work Tracker',
				color: '#4CAF50',
				isDefault: true,
				trackerType: 'work',
				ownerId: 'user1',
			});
			expect(mockTrackers.create).toHaveBeenCalled();
		});

		it('throws ValidationError for empty userId', async () => {
			await expect(useCase.ensureUserHasTracker('')).rejects.toThrow(
				ValidationError
			);
		});
	});

	describe('getTrackerByOwnerId', () => {
		it('returns first tracker when owner has trackers', async () => {
			const tracker = { id: 'tracker1', ownerId: 'user1' } as TrackerDTO;
			(mockTrackers.listOwned as unknown as jest.Mock).mockResolvedValue([
				tracker,
			]);

			const result = await useCase.getTrackerByOwnerId('user1');

			expect(result).toBe(tracker);
		});

		it('returns null when owner has no trackers', async () => {
			(mockTrackers.listOwned as unknown as jest.Mock).mockResolvedValue(
				[]
			);

			const result = await useCase.getTrackerByOwnerId('user1');

			expect(result).toBeNull();
		});

		it('throws ValidationError for empty ownerId', async () => {
			await expect(useCase.getTrackerByOwnerId('')).rejects.toThrow(
				ValidationError
			);
		});
	});

	describe('getDefaultViewUserId', () => {
		it('returns stored user ID', async () => {
			mockAsyncStorage.getItem.mockResolvedValue('user123');

			const result = await useCase.getDefaultViewUserId();

			expect(result).toBe('user123');
			expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(
				'@default_view_user_id'
			);
		});

		it('returns null on error', async () => {
			mockAsyncStorage.getItem.mockRejectedValue(
				new Error('Storage error')
			);

			const result = await useCase.getDefaultViewUserId();

			expect(result).toBeNull();
		});
	});

	describe('setDefaultViewUserId', () => {
		it('stores user ID when provided', async () => {
			mockAsyncStorage.setItem.mockResolvedValue(undefined);

			await useCase.setDefaultViewUserId('user123');

			expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
				'@default_view_user_id',
				'user123'
			);
		});

		it('removes user ID when null', async () => {
			mockAsyncStorage.removeItem.mockResolvedValue(undefined);

			await useCase.setDefaultViewUserId(null);

			expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
				'@default_view_user_id'
			);
		});

		it('handles storage errors', async () => {
			mockAsyncStorage.setItem.mockRejectedValue(
				new Error('Storage error')
			);

			await expect(
				useCase.setDefaultViewUserId('user123')
			).rejects.toThrow();
		});
	});

	describe('checkAndFixRecordsWithoutTrackerId', () => {
		it('fixes orphaned entries by assigning to default tracker', async () => {
			const orphanedEntry = {
				id: 'bad-id',
				date: '2025-01-01',
				trackerId: '',
				status: 'office',
			} as unknown as EntryDTO;
			(
				mockEntries.getAllEntries as unknown as jest.Mock
			).mockResolvedValue([orphanedEntry]);
			(mockTrackers.listOwned as unknown as jest.Mock).mockResolvedValue(
				[]
			);
			(mockTrackers.create as unknown as jest.Mock).mockResolvedValue(
				undefined
			);

			await useCase.checkAndFixRecordsWithoutTrackerId();

			expect(mockEntries.upsertOne).toHaveBeenCalledWith(
				expect.objectContaining({
					id: '2025-01-01',
					trackerId: expect.stringMatching(/^tracker_user1_/),
				})
			);
		});

		it('cleans up entries with incorrect ID format', async () => {
			const badIdEntry = {
				id: 'random-id-123',
				date: '2025-01-01',
				trackerId: 'tracker1',
				status: 'office',
			} as unknown as EntryDTO;
			(
				mockEntries.getAllEntries as unknown as jest.Mock
			).mockResolvedValue([badIdEntry]);
			(mockEntries.delete as unknown as jest.Mock).mockResolvedValue(
				undefined
			);
			(
				mockFirebaseEntries.delete as unknown as jest.Mock
			).mockResolvedValue(undefined);

			await useCase.checkAndFixRecordsWithoutTrackerId();

			expect(mockEntries.delete).toHaveBeenCalledWith('random-id-123');
			expect(mockFirebaseEntries.delete).toHaveBeenCalledWith(
				'random-id-123'
			);
		});

		it('handles case when no user is authenticated', async () => {
			// Mock auth to return null user
			const auth = require('@react-native-firebase/auth');
			const originalGetAuth = auth.getAuth;
			auth.getAuth = jest.fn(() => ({ currentUser: null }));

			(
				mockEntries.getAllEntries as unknown as jest.Mock
			).mockResolvedValue([
				{ id: '2025-01-01', trackerId: '', status: 'office' },
			]);

			await useCase.checkAndFixRecordsWithoutTrackerId();

			expect(mockEntries.upsertOne).not.toHaveBeenCalled();

			// Restore original
			auth.getAuth = originalGetAuth;
		});
	});

	describe('ensureDatabaseReady', () => {
		it('succeeds when database is ready', async () => {
			(
				mockEntries.listUnsynced as unknown as jest.Mock
			).mockResolvedValue([]);

			await expect(useCase.ensureDatabaseReady()).resolves.not.toThrow();
		});

		it('continues when database check fails', async () => {
			(
				mockEntries.listUnsynced as unknown as jest.Mock
			).mockRejectedValue(new Error('DB error'));

			await expect(useCase.ensureDatabaseReady()).resolves.not.toThrow();
		});
	});
});
