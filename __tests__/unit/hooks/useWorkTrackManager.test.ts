import { getAuth } from '@react-native-firebase/auth';
import { act, renderHook } from '@testing-library/react-native';

import { createDefaultContainer } from '../../../src/di/container';
import { SyncError } from '../../../src/errors';
import { useAppSelector } from '../../../src/hooks/redux';
import { useWorkTrackManager } from '../../../src/hooks/useWorkTrackManager';
import { logger } from '../../../src/logging';

// Mock dependencies
jest.mock('@react-native-firebase/auth', () => ({
	getAuth: jest.fn(),
}));
jest.mock('../../../src/di/container');
jest.mock('../../../src/logging');
jest.mock('../../../src/hooks/redux');

const mockGetAuth = getAuth as jest.MockedFunction<typeof getAuth>;
const mockCreateDefaultContainer =
	createDefaultContainer as jest.MockedFunction<
		typeof createDefaultContainer
	>;
const mockUseAppSelector = useAppSelector as jest.MockedFunction<
	typeof useAppSelector
>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('useWorkTrackManager', () => {
	const mockContainer = {
		sync: {
			execute: jest.fn(),
			getSyncStatus: jest.fn(),
		},
		share: {
			shareByEmail: jest.fn(),
			updateSharePermission: jest.fn(),
		},
		shareRead: {
			getSharedWithMe: jest.fn(),
		},
		userManagement: {
			cleanupEntries: jest.fn(),
		},
		entry: {
			createOrUpdate: jest.fn(),
			getByTracker: jest.fn(),
		},
		localTrackers: {
			listOwned: jest.fn(),
			listSharedWith: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
		},
		trackers: {
			create: jest.fn(),
			update: jest.fn(),
		},
	};

	const mockCurrentUser = {
		id: 'user123',
		email: 'test@example.com',
		name: 'Test User',
	};

	beforeEach(() => {
		jest.clearAllMocks();
		jest.useFakeTimers();

		mockCreateDefaultContainer.mockReturnValue(
			mockContainer as unknown as ReturnType<
				typeof createDefaultContainer
			>
		);
		mockUseAppSelector.mockReturnValue(mockCurrentUser);
		mockGetAuth.mockReturnValue({
			currentUser: mockCurrentUser,
		} as unknown as ReturnType<typeof getAuth>);
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('should return manager with all methods', () => {
		const { result } = renderHook(() => useWorkTrackManager());

		expect(result.current).toMatchObject({
			sync: expect.any(Function),
			share: expect.any(Function),
			getSyncStatus: expect.any(Function),
			startPeriodicSync: expect.any(Function),
			stopPeriodicSync: expect.any(Function),
			triggerSync: expect.any(Function),
			syncFromRemote: expect.any(Function),
			getMyTrackers: expect.any(Function),
			getSharedTrackers: expect.any(Function),
			createTracker: expect.any(Function),
			updateTracker: expect.any(Function),
			updateSharePermission: expect.any(Function),
			shareRead: expect.any(Object),
			userManagement: expect.any(Object),
			entry: expect.any(Object),
		});
	});

	it('should execute sync', async () => {
		const { result } = renderHook(() => useWorkTrackManager());

		await act(async () => {
			await result.current.sync();
		});

		expect(mockContainer.sync.execute).toHaveBeenCalled();
	});

	it('should share by email', async () => {
		const { result } = renderHook(() => useWorkTrackManager());

		await act(async () => {
			await result.current.share(
				'test@example.com',
				'read',
				'tracker123'
			);
		});

		expect(mockContainer.share.shareByEmail).toHaveBeenCalledWith(
			'test@example.com',
			'read',
			'tracker123'
		);
	});

	it('should update share permission', async () => {
		const { result } = renderHook(() => useWorkTrackManager());

		await act(async () => {
			await result.current.updateSharePermission(
				'user123',
				'write',
				'tracker123'
			);
		});

		expect(mockContainer.share.updateSharePermission).toHaveBeenCalledWith(
			'user123',
			'write',
			'tracker123'
		);
	});

	it('should get sync status', async () => {
		const mockSyncStatus = { isSyncing: false, lastSync: new Date() };
		mockContainer.sync.getSyncStatus.mockResolvedValue(mockSyncStatus);

		const { result } = renderHook(() => useWorkTrackManager());

		let syncStatus;
		await act(async () => {
			syncStatus = await result.current.getSyncStatus();
		});

		expect(syncStatus).toBe(mockSyncStatus);
		expect(mockContainer.sync.getSyncStatus).toHaveBeenCalled();
	});

	it('should start periodic sync', async () => {
		const { result } = renderHook(() => useWorkTrackManager());

		await act(async () => {
			await result.current.startPeriodicSync(1000);
		});

		expect(mockLogger.info).toHaveBeenCalledWith('Starting periodic sync', {
			intervalMs: 1000,
		});
		expect(mockContainer.sync.execute).toHaveBeenCalledTimes(1);

		// Fast-forward timer to trigger periodic sync
		act(() => {
			jest.advanceTimersByTime(1000);
		});

		expect(mockContainer.sync.execute).toHaveBeenCalledTimes(2);
	});

	it('should not start periodic sync if already active', async () => {
		const { result } = renderHook(() => useWorkTrackManager());

		await act(async () => {
			await result.current.startPeriodicSync(1000);
			await result.current.startPeriodicSync(1000);
		});

		expect(mockLogger.warn).toHaveBeenCalledWith(
			'Periodic sync is already active'
		);
	});

	it('should not start periodic sync without user', async () => {
		mockUseAppSelector.mockReturnValue(null);

		const { result } = renderHook(() => useWorkTrackManager());

		await act(async () => {
			await result.current.startPeriodicSync(1000);
		});

		expect(mockLogger.warn).toHaveBeenCalledWith(
			'Cannot start periodic sync: user not authenticated'
		);
		expect(mockContainer.sync.execute).not.toHaveBeenCalled();
	});

	it('should stop periodic sync', async () => {
		const { result } = renderHook(() => useWorkTrackManager());

		await act(async () => {
			await result.current.startPeriodicSync(1000);
			result.current.stopPeriodicSync();
		});

		expect(mockLogger.info).toHaveBeenCalledWith('Stopping periodic sync');
		expect(mockLogger.debug).toHaveBeenCalledWith('Periodic sync stopped');
	});

	it('should warn when stopping inactive periodic sync', async () => {
		const { result } = renderHook(() => useWorkTrackManager());

		act(() => {
			result.current.stopPeriodicSync();
		});

		expect(mockLogger.warn).toHaveBeenCalledWith(
			'Periodic sync is not active'
		);
	});

	it('should get current user id', async () => {
		const { result } = renderHook(() => useWorkTrackManager());

		await act(async () => {
			await result.current.getMyTrackers();
		});

		expect(mockContainer.localTrackers.listOwned).toHaveBeenCalledWith(
			'user123'
		);
	});

	it('should throw error when user not authenticated', async () => {
		mockUseAppSelector.mockReturnValue(null);

		const { result } = renderHook(() => useWorkTrackManager());

		await expect(async () => {
			await act(async () => {
				await result.current.getMyTrackers();
			});
		}).rejects.toThrow(SyncError);
	});

	it('should create tracker with owner id', async () => {
		const mockTracker = {
			id: 'tracker123',
			name: 'Test Tracker',
			color: '#000000',
			isDefault: false,
			trackerType: 'work' as const,
		};

		const { result } = renderHook(() => useWorkTrackManager());

		await act(async () => {
			await result.current.createTracker(mockTracker);
		});

		const expectedTracker = { ...mockTracker, ownerId: 'user123' };
		expect(mockContainer.localTrackers.create).toHaveBeenCalledWith(
			expectedTracker,
			'user123'
		);
		expect(mockContainer.trackers.create).toHaveBeenCalledWith(
			expectedTracker,
			'user123'
		);
	});

	it('should update tracker', async () => {
		const mockTracker = {
			id: 'tracker123',
			name: 'Updated Tracker',
		};

		const { result } = renderHook(() => useWorkTrackManager());

		await act(async () => {
			await result.current.updateTracker(mockTracker);
		});

		expect(mockContainer.localTrackers.update).toHaveBeenCalledWith(
			mockTracker,
			'user123'
		);
		expect(mockContainer.trackers.update).toHaveBeenCalledWith(
			mockTracker,
			'user123'
		);
	});

	it('should cleanup on unmount', () => {
		const { unmount } = renderHook(() => useWorkTrackManager());

		unmount();

		// This test mainly ensures the cleanup function doesn't throw
		// The actual cleanup is tested implicitly through other tests
	});
});
