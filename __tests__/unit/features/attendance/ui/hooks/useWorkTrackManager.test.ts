// migrated to V2 structure
import { getAuth } from '@react-native-firebase/auth';
import { configureStore } from '@reduxjs/toolkit';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Provider } from 'react-redux';

import { useDI } from '@/app/providers/DIProvider';
import { userSlice } from '@/app/store/reducers/userSlice';
import { AttendanceServiceIdentifiers } from '@/features/attendance/di';
import { Tracker } from '@/features/attendance/domain/entities/Tracker';
import { WorkEntry } from '@/features/attendance/domain/entities/WorkEntry';
import { WorkStatus } from '@/features/attendance/domain/entities/WorkStatus';
import { useWorkTrackManager } from '@/features/attendance/ui/hooks/useWorkTrackManager';
import { AuthServiceIdentifiers } from '@/features/auth/di';
import { User } from '@/features/auth/domain/entities/User';
import { SharingServiceIdentifiers } from '@/features/sharing/di';
import { Permission } from '@/features/sharing/domain/entities/Permission';
import { Share } from '@/features/sharing/domain/entities/Share';
import { SyncServiceIdentifiers } from '@/features/sync/di';
import { SyncOperation } from '@/features/sync/domain/entities/SyncOperation';

// Mock dependencies
jest.mock('@/app/providers/DIProvider', () => ({
	useDI: jest.fn(),
}));

jest.mock('@react-native-firebase/auth', () => ({
	getAuth: jest.fn(),
}));

jest.mock('@/shared/utils/logging', () => ({
	logger: {
		info: jest.fn(),
		warn: jest.fn(),
		error: jest.fn(),
		debug: jest.fn(),
	},
}));

describe('useWorkTrackManager', () => {
	let store: ReturnType<typeof configureStore>;
	let mockContainer: {
		resolve: jest.Mock;
	};
	let mockCreateEntryUseCase: { execute: jest.Mock };
	let mockUpdateEntryUseCase: { execute: jest.Mock };
	let mockGetEntriesForTrackerUseCase: { execute: jest.Mock };
	let mockTrackerRepository: {
		getAllForUser: jest.Mock;
		getById: jest.Mock;
		create: jest.Mock;
		update: jest.Mock;
	};
	let mockSyncManager: {
		processNow: jest.Mock;
		running: boolean;
	};
	let mockShareTrackerUseCase: { execute: jest.Mock };
	let mockUpdatePermissionUseCase: { execute: jest.Mock };
	let mockGetSharedWithMeUseCase: { execute: jest.Mock };
	let mockSyncQueueRepository: { getAll: jest.Mock };
	let mockNetworkMonitor: { isOnline: jest.Mock };
	let mockAuthRepository: {
		getUserByEmail: jest.Mock;
		getUserById: jest.Mock;
	};
	let mockAuth: { currentUser: { uid: string } | null };

	beforeEach(() => {
		jest.clearAllMocks();
		jest.useFakeTimers({
			legacyFakeTimers: false,
		});

		store = configureStore({
			reducer: {
				user: userSlice.reducer,
			},
		});

		mockCreateEntryUseCase = { execute: jest.fn() };
		mockUpdateEntryUseCase = { execute: jest.fn() };
		mockGetEntriesForTrackerUseCase = { execute: jest.fn() };
		mockTrackerRepository = {
			getAllForUser: jest.fn(),
			getById: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
		};
		mockSyncManager = {
			processNow: jest.fn().mockResolvedValue(undefined),
			running: false,
		};
		mockShareTrackerUseCase = { execute: jest.fn() };
		mockUpdatePermissionUseCase = { execute: jest.fn() };
		mockGetSharedWithMeUseCase = { execute: jest.fn() };
		mockSyncQueueRepository = { getAll: jest.fn() };
		mockNetworkMonitor = { isOnline: jest.fn().mockResolvedValue(true) };
		mockAuthRepository = {
			getUserByEmail: jest.fn(),
			getUserById: jest.fn(),
		};
		mockAuth = { currentUser: { uid: 'user-1' } };

		(getAuth as jest.Mock).mockReturnValue(mockAuth);

		mockContainer = {
			resolve: jest.fn((identifier) => {
				if (identifier === AttendanceServiceIdentifiers.CREATE_ENTRY) {
					return mockCreateEntryUseCase;
				}
				if (identifier === AttendanceServiceIdentifiers.UPDATE_ENTRY) {
					return mockUpdateEntryUseCase;
				}
				if (
					identifier ===
					AttendanceServiceIdentifiers.GET_ENTRIES_FOR_TRACKER
				) {
					return mockGetEntriesForTrackerUseCase;
				}
				if (
					identifier ===
					AttendanceServiceIdentifiers.TRACKER_REPOSITORY
				) {
					return mockTrackerRepository;
				}
				if (identifier === SyncServiceIdentifiers.SYNC_MANAGER) {
					return mockSyncManager;
				}
				if (identifier === SharingServiceIdentifiers.SHARE_TRACKER) {
					return mockShareTrackerUseCase;
				}
				if (
					identifier === SharingServiceIdentifiers.UPDATE_PERMISSION
				) {
					return mockUpdatePermissionUseCase;
				}
				if (
					identifier === SharingServiceIdentifiers.GET_SHARED_WITH_ME
				) {
					return mockGetSharedWithMeUseCase;
				}
				if (
					identifier === SyncServiceIdentifiers.SYNC_QUEUE_REPOSITORY
				) {
					return mockSyncQueueRepository;
				}
				if (identifier === SyncServiceIdentifiers.NETWORK_MONITOR) {
					return mockNetworkMonitor;
				}
				if (identifier === AuthServiceIdentifiers.AUTH_REPOSITORY) {
					return mockAuthRepository;
				}
				return null;
			}),
		};

		(useDI as jest.Mock).mockReturnValue(mockContainer);
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	const wrapper = ({ children }: { children: React.ReactNode }) =>
		React.createElement(
			Provider,
			{ store } as React.ComponentProps<typeof Provider>,
			children
		);

	describe('initialization', () => {
		it('should return WorkTrackManager interface', () => {
			const user = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			act(() => {
				store.dispatch(userSlice.actions.setUser(user));
			});

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			expect(result.current.userManagement).toBeDefined();
			expect(result.current.entry).toBeDefined();
			expect(result.current.triggerSync).toBeDefined();
			expect(result.current.sync).toBeDefined();
			expect(result.current.syncFromRemote).toBeDefined();
			expect(result.current.getSyncStatus).toBeDefined();
			expect(result.current.startPeriodicSync).toBeDefined();
			expect(result.current.stopPeriodicSync).toBeDefined();
			expect(result.current.share).toBeDefined();
			expect(result.current.updateSharePermission).toBeDefined();
			expect(result.current.getMyTrackers).toBeDefined();
			expect(result.current.getSharedTrackers).toBeDefined();
			expect(result.current.createTracker).toBeDefined();
			expect(result.current.updateTracker).toBeDefined();
		});
	});

	describe('getCurrentUserId', () => {
		it('should throw error when user is not authenticated', async () => {
			act(() => {
				store.dispatch(userSlice.actions.setUser(null));
			});

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			await expect(
				async () => await result.current.getMyTrackers()
			).rejects.toThrow('User not authenticated');
		});

		it('should return userId when user is authenticated', async () => {
			const user = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			act(() => {
				store.dispatch(userSlice.actions.setUser(user));
			});

			mockTrackerRepository.getAllForUser.mockResolvedValue([]);

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			await act(async () => {
				await result.current.getMyTrackers();
			});

			expect(mockTrackerRepository.getAllForUser).toHaveBeenCalledWith(
				'user-1'
			);
		});
	});

	describe('sync operations', () => {
		it('should call syncManager.processNow for sync', async () => {
			const user = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			act(() => {
				store.dispatch(userSlice.actions.setUser(user));
			});

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			await act(async () => {
				await result.current.sync();
			});

			expect(mockSyncManager.processNow).toHaveBeenCalled();
		});

		it('should call syncManager.processNow for triggerSync', async () => {
			const user = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			act(() => {
				store.dispatch(userSlice.actions.setUser(user));
			});

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			await act(async () => {
				await result.current.triggerSync();
			});

			expect(mockSyncManager.processNow).toHaveBeenCalled();
		});

		it('should throw error when syncFromRemote called without authenticated user', async () => {
			mockAuth.currentUser = null;

			const user = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			act(() => {
				store.dispatch(userSlice.actions.setUser(user));
			});

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			await expect(
				async () => await result.current.syncFromRemote()
			).rejects.toThrow('User not authenticated');
		});

		it('should call syncManager.processNow for syncFromRemote when authenticated', async () => {
			mockAuth.currentUser = { uid: 'user-1' };
			const user = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			act(() => {
				store.dispatch(userSlice.actions.setUser(user));
			});

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			await act(async () => {
				await result.current.syncFromRemote();
			});

			expect(mockSyncManager.processNow).toHaveBeenCalled();
		});

		it('should return sync status', async () => {
			mockSyncManager.running = true;
			mockNetworkMonitor.isOnline.mockResolvedValue(true);

			const user = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			act(() => {
				store.dispatch(userSlice.actions.setUser(user));
			});

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			const status = await act(async () => {
				return await result.current.getSyncStatus();
			});

			expect(status).toEqual({
				isSyncing: true,
				isOnline: true,
				lastSyncTime: expect.any(Number),
			});
		});

		it('should return offline status when network is offline', async () => {
			mockSyncManager.running = false;
			mockNetworkMonitor.isOnline.mockResolvedValue(false);

			const user = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			act(() => {
				store.dispatch(userSlice.actions.setUser(user));
			});

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			const status = await act(async () => {
				return await result.current.getSyncStatus();
			});

			expect(status).toEqual({
				isSyncing: false,
				isOnline: false,
				lastSyncTime: expect.any(Number),
			});
		});
	});

	describe('periodic sync', () => {
		it('should start periodic sync with default interval', async () => {
			const user = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			act(() => {
				store.dispatch(userSlice.actions.setUser(user));
			});

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			await act(async () => {
				await result.current.startPeriodicSync();
			});

			expect(mockSyncManager.processNow).toHaveBeenCalled();
			// Verify interval was set (useFakeTimers handles this)
			expect(jest.getTimerCount()).toBeGreaterThan(0);
		});

		it('should start periodic sync with custom interval', async () => {
			const user = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			act(() => {
				store.dispatch(userSlice.actions.setUser(user));
			});

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			await act(async () => {
				await result.current.startPeriodicSync(60000);
			});

			// Verify interval was set (useFakeTimers handles this)
			expect(jest.getTimerCount()).toBeGreaterThan(0);
		});

		it('should not start periodic sync if already active', async () => {
			const user = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			act(() => {
				store.dispatch(userSlice.actions.setUser(user));
			});

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			// Start first time
			await act(async () => {
				await result.current.startPeriodicSync();
			});

			mockSyncManager.processNow.mockClear();

			// Try to start again
			await act(async () => {
				await result.current.startPeriodicSync();
			});

			// Should not call processNow again (only initial sync)
			expect(mockSyncManager.processNow).not.toHaveBeenCalled();
		});

		it('should not start periodic sync if user is not authenticated', async () => {
			act(() => {
				store.dispatch(userSlice.actions.setUser(null));
			});

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			await act(async () => {
				await result.current.startPeriodicSync();
			});

			expect(mockSyncManager.processNow).not.toHaveBeenCalled();
		});

		it('should stop periodic sync', async () => {
			const user = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			act(() => {
				store.dispatch(userSlice.actions.setUser(user));
			});

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			await act(async () => {
				await result.current.startPeriodicSync();
			});

			const timerCountBefore = jest.getTimerCount();

			act(() => {
				result.current.stopPeriodicSync();
			});

			// Verify timer was cleared
			expect(jest.getTimerCount()).toBeLessThan(timerCountBefore);
		});

		it('should warn when stopping periodic sync that is not active', () => {
			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			act(() => {
				result.current.stopPeriodicSync();
			});

			// Should not throw, just warn
			// No timer should be cleared if sync wasn't active
			expect(jest.getTimerCount()).toBe(0);
		});

		it('should cleanup interval on unmount', async () => {
			const user = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			act(() => {
				store.dispatch(userSlice.actions.setUser(user));
			});

			const { result, unmount } = renderHook(
				() => useWorkTrackManager(),
				{ wrapper }
			);

			await act(async () => {
				await result.current.startPeriodicSync();
			});

			const timerCountBefore = jest.getTimerCount();
			expect(timerCountBefore).toBeGreaterThan(0);

			unmount();

			// Verify timer was cleared on unmount
			expect(jest.getTimerCount()).toBeLessThan(timerCountBefore);
		});

		it('should handle initial sync failure gracefully', async () => {
			const user = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			act(() => {
				store.dispatch(userSlice.actions.setUser(user));
			});

			mockSyncManager.processNow.mockRejectedValueOnce(
				new Error('Initial sync failed')
			);

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			await act(async () => {
				await result.current.startPeriodicSync();
			});

			// Should still set up interval even if initial sync fails
			// Timer should be set up despite initial sync failure
			expect(jest.getTimerCount()).toBeGreaterThan(0);
		});

		it('should handle periodic sync interval failures gracefully', async () => {
			const user = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			act(() => {
				store.dispatch(userSlice.actions.setUser(user));
			});

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			await act(async () => {
				await result.current.startPeriodicSync(1000);
			});

			// Clear the successful initial call
			mockSyncManager.processNow.mockClear();

			// Make the next call fail
			mockSyncManager.processNow.mockRejectedValueOnce(
				new Error('Sync failed')
			);

			// Advance timer to trigger interval
			act(() => {
				jest.advanceTimersByTime(1000);
			});

			await waitFor(() => {
				expect(mockSyncManager.processNow).toHaveBeenCalled();
			});

			// Should not throw, just log error
			expect(mockSyncManager.processNow).toHaveBeenCalled();
		});

		it('should not run interval callback if periodic sync is stopped', async () => {
			const user = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			act(() => {
				store.dispatch(userSlice.actions.setUser(user));
			});

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			await act(async () => {
				await result.current.startPeriodicSync(1000);
			});

			act(() => {
				result.current.stopPeriodicSync();
			});

			mockSyncManager.processNow.mockClear();

			// Advance timer
			act(() => {
				jest.advanceTimersByTime(1000);
			});

			// Should not call processNow because sync is stopped
			expect(mockSyncManager.processNow).not.toHaveBeenCalled();
		});
	});

	describe('sharing operations', () => {
		it('should share tracker with user by email', async () => {
			const user = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			act(() => {
				store.dispatch(userSlice.actions.setUser(user));
			});

			const sharedWithUser = new User(
				'shared-user-1',
				'shared@example.com',
				'Shared User'
			);
			mockAuthRepository.getUserByEmail.mockResolvedValue(sharedWithUser);

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			const permission = new Permission('write');
			await act(async () => {
				await result.current.share('shared@example.com', permission);
			});

			expect(mockAuthRepository.getUserByEmail).toHaveBeenCalledWith(
				'shared@example.com'
			);
			expect(mockShareTrackerUseCase.execute).toHaveBeenCalled();
		});

		it('should use trackerId when provided for sharing', async () => {
			const user = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			act(() => {
				store.dispatch(userSlice.actions.setUser(user));
			});

			const sharedWithUser = new User(
				'shared-user-1',
				'shared@example.com',
				'Shared User'
			);
			mockAuthRepository.getUserByEmail.mockResolvedValue(sharedWithUser);

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			const permission = new Permission('read');
			await act(async () => {
				await result.current.share(
					'shared@example.com',
					permission,
					'tracker-123'
				);
			});

			expect(mockShareTrackerUseCase.execute).toHaveBeenCalled();
			const shareArg = mockShareTrackerUseCase.execute.mock
				.calls[0][0] as Share;
			expect(shareArg.trackerId).toBe('tracker-123');
		});

		it('should use userId as trackerId when trackerId not provided', async () => {
			const user = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			act(() => {
				store.dispatch(userSlice.actions.setUser(user));
			});

			const sharedWithUser = new User(
				'shared-user-1',
				'shared@example.com',
				'Shared User'
			);
			mockAuthRepository.getUserByEmail.mockResolvedValue(sharedWithUser);

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			const permission = new Permission('read');
			await act(async () => {
				await result.current.share('shared@example.com', permission);
			});

			const shareArg = mockShareTrackerUseCase.execute.mock
				.calls[0][0] as Share;
			expect(shareArg.trackerId).toBe('user-1');
		});

		it('should throw error when user not found by email', async () => {
			const user = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			act(() => {
				store.dispatch(userSlice.actions.setUser(user));
			});

			mockAuthRepository.getUserByEmail.mockResolvedValue(null);

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			const permission = new Permission('read');
			await expect(
				async () =>
					await result.current.share(
						'nonexistent@example.com',
						permission
					)
			).rejects.toThrow(
				'User with email nonexistent@example.com not found. They must be signed up to receive shares.'
			);
		});

		it('should update share permission', async () => {
			const user = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			act(() => {
				store.dispatch(userSlice.actions.setUser(user));
			});

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			const permission = new Permission('write');
			await act(async () => {
				await result.current.updateSharePermission(
					'shared-user-1',
					permission
				);
			});

			expect(mockUpdatePermissionUseCase.execute).toHaveBeenCalledWith(
				'shared-user-1',
				permission
			);
		});
	});

	describe('tracker operations', () => {
		it('should get my trackers', async () => {
			const user = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			act(() => {
				store.dispatch(userSlice.actions.setUser(user));
			});

			const tracker1 = new Tracker('tracker-1', 'Tracker 1', '', true);
			const tracker2 = new Tracker('tracker-2', 'Tracker 2', '', true);
			mockTrackerRepository.getAllForUser.mockResolvedValue([
				tracker1,
				tracker2,
			]);

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			const trackers = await act(async () => {
				return await result.current.getMyTrackers();
			});

			expect(trackers).toEqual([
				{ id: 'tracker-1', name: 'Tracker 1' },
				{ id: 'tracker-2', name: 'Tracker 2' },
			]);
		});

		it('should get shared trackers', async () => {
			const user = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			act(() => {
				store.dispatch(userSlice.actions.setUser(user));
			});

			const share1 = new Share(
				'share-1',
				'tracker-1',
				'user-1',
				new Permission('read')
			);
			const share2 = new Share(
				'share-2',
				'tracker-2',
				'user-1',
				new Permission('write')
			);
			mockGetSharedWithMeUseCase.execute.mockResolvedValue([
				share1,
				share2,
			]);

			const tracker1 = new Tracker(
				'tracker-1',
				'Shared Tracker 1',
				'',
				true
			);
			const tracker2 = new Tracker(
				'tracker-2',
				'Shared Tracker 2',
				'',
				true
			);
			mockTrackerRepository.getById
				.mockResolvedValueOnce(tracker1)
				.mockResolvedValueOnce(tracker2);

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			const trackers = await act(async () => {
				return await result.current.getSharedTrackers();
			});

			expect(trackers).toEqual([
				{ id: 'tracker-1', name: 'Shared Tracker 1' },
				{ id: 'tracker-2', name: 'Shared Tracker 2' },
			]);
		});

		it('should filter out null trackers from shared trackers', async () => {
			const user = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			act(() => {
				store.dispatch(userSlice.actions.setUser(user));
			});

			const share1 = new Share(
				'share-1',
				'tracker-1',
				'user-1',
				new Permission('read')
			);
			const share2 = new Share(
				'share-2',
				'tracker-2',
				'user-1',
				new Permission('write')
			);
			mockGetSharedWithMeUseCase.execute.mockResolvedValue([
				share1,
				share2,
			]);

			mockTrackerRepository.getById
				.mockResolvedValueOnce(null)
				.mockResolvedValueOnce(
					new Tracker('tracker-2', 'Tracker 2', '', true)
				);

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			const trackers = await act(async () => {
				return await result.current.getSharedTrackers();
			});

			expect(trackers).toEqual([{ id: 'tracker-2', name: 'Tracker 2' }]);
		});

		it('should handle duplicate tracker IDs in shared trackers', async () => {
			const user = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			act(() => {
				store.dispatch(userSlice.actions.setUser(user));
			});

			const share1 = new Share(
				'share-1',
				'tracker-1',
				'user-1',
				new Permission('read')
			);
			const share2 = new Share(
				'share-2',
				'tracker-1',
				'user-1',
				new Permission('write')
			);
			mockGetSharedWithMeUseCase.execute.mockResolvedValue([
				share1,
				share2,
			]);

			const tracker1 = new Tracker('tracker-1', 'Tracker 1', '', true);
			mockTrackerRepository.getById.mockResolvedValue(tracker1);

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			const trackers = await act(async () => {
				return await result.current.getSharedTrackers();
			});

			// Should only get tracker once (unique tracker IDs)
			expect(trackers).toEqual([{ id: 'tracker-1', name: 'Tracker 1' }]);
			expect(mockTrackerRepository.getById).toHaveBeenCalledTimes(1);
		});

		it('should create tracker', async () => {
			const tracker = new Tracker('tracker-1', 'New Tracker', '', true);
			mockTrackerRepository.create.mockResolvedValue(tracker);

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			const created = await act(async () => {
				return await result.current.createTracker({
					name: 'New Tracker',
				});
			});

			expect(mockTrackerRepository.create).toHaveBeenCalled();
			expect(created).toEqual({ id: 'tracker-1', name: 'New Tracker' });
		});

		it('should update tracker', async () => {
			const existing = new Tracker(
				'tracker-1',
				'Old Name',
				'Old Desc',
				true
			);
			const updated = new Tracker(
				'tracker-1',
				'New Name',
				'Old Desc',
				true,
				existing.createdAt,
				new Date()
			);
			mockTrackerRepository.getById.mockResolvedValue(existing);
			mockTrackerRepository.update.mockResolvedValue(updated);

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			const resultTracker = await act(async () => {
				return await result.current.updateTracker({
					id: 'tracker-1',
					name: 'New Name',
				});
			});

			expect(resultTracker).toEqual({
				id: 'tracker-1',
				name: 'New Name',
			});
		});

		it('should throw error when updating non-existent tracker', async () => {
			mockTrackerRepository.getById.mockResolvedValue(null);

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			await expect(
				async () =>
					await result.current.updateTracker({
						id: 'nonexistent',
						name: 'New Name',
					})
			).rejects.toThrow('Tracker with id nonexistent not found');
		});
	});

	describe('user management operations', () => {
		it('should return existing tracker when user already has one', async () => {
			const existingTracker = new Tracker(
				'tracker-1',
				'Existing Tracker',
				'',
				true
			);
			mockTrackerRepository.getAllForUser.mockResolvedValue([
				existingTracker,
			]);

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			const tracker = await act(async () => {
				return await result.current.userManagement.initializeUserData(
					'user-1'
				);
			});

			expect(tracker).toEqual({
				id: 'tracker-1',
				name: 'Existing Tracker',
			});
			expect(mockTrackerRepository.create).not.toHaveBeenCalled();
		});

		it('should create default tracker when user has none', async () => {
			mockTrackerRepository.getAllForUser.mockResolvedValue([]);
			const newTracker = new Tracker(
				'tracker-new',
				'My WorkTrack',
				'Default work tracker',
				true
			);
			mockTrackerRepository.create.mockResolvedValue(newTracker);

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			const tracker = await act(async () => {
				return await result.current.userManagement.initializeUserData(
					'user-1'
				);
			});

			expect(tracker).toEqual({
				id: 'tracker-new',
				name: 'My WorkTrack',
			});
			expect(mockTrackerRepository.create).toHaveBeenCalled();
		});

		it('should ensure user has tracker (alias for initializeUserData)', async () => {
			mockTrackerRepository.getAllForUser.mockResolvedValue([]);
			const newTracker = new Tracker(
				'tracker-new',
				'My WorkTrack',
				'Default work tracker',
				true
			);
			mockTrackerRepository.create.mockResolvedValue(newTracker);

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			const tracker = await act(async () => {
				return await result.current.userManagement.ensureUserHasTracker(
					'user-1'
				);
			});

			expect(tracker).toEqual({
				id: 'tracker-new',
				name: 'My WorkTrack',
			});
		});

		it('should get tracker by owner ID', async () => {
			const tracker = new Tracker('tracker-1', 'Owner Tracker', '', true);
			mockTrackerRepository.getAllForUser.mockResolvedValue([tracker]);

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			const resultTracker = await act(async () => {
				return await result.current.userManagement.getTrackerByOwnerId(
					'owner-1'
				);
			});

			expect(resultTracker).toEqual({
				id: 'tracker-1',
				name: 'Owner Tracker',
			});
		});

		it('should return null when owner has no trackers', async () => {
			mockTrackerRepository.getAllForUser.mockResolvedValue([]);

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			const resultTracker = await act(async () => {
				return await result.current.userManagement.getTrackerByOwnerId(
					'owner-1'
				);
			});

			expect(resultTracker).toBeNull();
		});
	});

	describe('entry operations', () => {
		it('should get entries for tracker', async () => {
			const entry1 = new WorkEntry(
				'entry-1',
				'user-1',
				'tracker-1',
				'2024-01-01',
				new WorkStatus('office')
			);
			const entry2 = new WorkEntry(
				'entry-2',
				'user-1',
				'tracker-1',
				'2024-01-02',
				new WorkStatus('wfh')
			);
			mockGetEntriesForTrackerUseCase.execute.mockResolvedValue([
				entry1,
				entry2,
			]);

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			const entries = await act(async () => {
				return await result.current.entry.getEntriesForTracker(
					'tracker-1'
				);
			});

			// The hook returns EntryInfo values using canonical statuses
			expect(entries).toHaveLength(2);
			expect(entries[0]).toMatchObject({
				date: '2024-01-01',
				status: 'office',
			});
			expect(entries[1]).toMatchObject({
				date: '2024-01-02',
				status: 'wfh',
			});
		});

		it('should create new entry when entry does not exist', async () => {
			const user = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			act(() => {
				store.dispatch(userSlice.actions.setUser(user));
			});

			mockGetEntriesForTrackerUseCase.execute.mockResolvedValue([]);

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			await act(async () => {
				await result.current.entry.createOrUpdateEntry({
					trackerId: 'tracker-1',
					date: '2024-01-01',
					status: 'office',
					isAdvisory: false,
				});
			});

			expect(mockCreateEntryUseCase.execute).toHaveBeenCalled();
			expect(mockUpdateEntryUseCase.execute).not.toHaveBeenCalled();
		});

		it('should update existing entry when entry exists', async () => {
			const user = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			act(() => {
				store.dispatch(userSlice.actions.setUser(user));
			});

			const existingEntry = new WorkEntry(
				'entry-1',
				'user-1',
				'tracker-1',
				'2024-01-01',
				new WorkStatus('office'),
				undefined,
				false
			);
			mockGetEntriesForTrackerUseCase.execute.mockResolvedValue([
				existingEntry,
			]);

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			await act(async () => {
				await result.current.entry.createOrUpdateEntry({
					trackerId: 'tracker-1',
					date: '2024-01-01',
					status: 'wfh',
					isAdvisory: true,
				});
			});

			expect(mockUpdateEntryUseCase.execute).toHaveBeenCalled();
			expect(mockCreateEntryUseCase.execute).not.toHaveBeenCalled();
		});

		it('should use existing isAdvisory when not provided in update', async () => {
			const user = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			act(() => {
				store.dispatch(userSlice.actions.setUser(user));
			});

			const existingEntry = new WorkEntry(
				'entry-1',
				'user-1',
				'tracker-1',
				'2024-01-01',
				new WorkStatus('office'),
				undefined,
				true
			);
			mockGetEntriesForTrackerUseCase.execute.mockResolvedValue([
				existingEntry,
			]);

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			await act(async () => {
				await result.current.entry.createOrUpdateEntry({
					trackerId: 'tracker-1',
					date: '2024-01-01',
					status: 'wfh',
				});
			});

			expect(mockUpdateEntryUseCase.execute).toHaveBeenCalled();
			const updatedEntry = mockUpdateEntryUseCase.execute.mock
				.calls[0][0] as WorkEntry;
			expect(updatedEntry.isAdvisory).toBe(true);
		});

		it('should get failed sync records', async () => {
			const failedOp1 = new SyncOperation(
				'op-1',
				'create',
				'work_entries',
				'entry-1',
				{ date: '2024-01-01', status: 'office', isAdvisory: false },
				'failed',
				2
			);
			const failedOp2 = new SyncOperation(
				'op-2',
				'update',
				'work_entries',
				'entry-2',
				{ date: '2024-01-02', status: 'wfh', isAdvisory: true },
				'failed',
				1
			);
			const pendingOp = new SyncOperation(
				'op-3',
				'create',
				'work_entries',
				'entry-3',
				{ date: '2024-01-03', status: 'office' },
				'pending'
			);

			mockSyncQueueRepository.getAll.mockResolvedValue([
				failedOp1,
				failedOp2,
				pendingOp,
			]);

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			const failedRecords = await act(async () => {
				return await result.current.entry.getFailedSyncRecords();
			});

			expect(failedRecords).toHaveLength(2);
			expect(failedRecords[0]).toMatchObject({
				id: 'entry-1',
				date: '2024-01-01',
				status: 'office',
				isAdvisory: false,
				retryCount: 2,
			});
			expect(failedRecords[1]).toEqual({
				id: 'entry-2',
				date: '2024-01-02',
				status: 'wfh',
				isAdvisory: true,
				syncError: undefined,
				retryCount: 1,
			});
		});

		it('should filter out operations without data', async () => {
			const failedOp = new SyncOperation(
				'op-1',
				'create',
				'work_entries',
				'entry-1',
				undefined,
				'failed'
			);

			mockSyncQueueRepository.getAll.mockResolvedValue([failedOp]);

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			const failedRecords = await act(async () => {
				return await result.current.entry.getFailedSyncRecords();
			});

			expect(failedRecords).toHaveLength(0);
		});

		it('should only return work_entries operations', async () => {
			const failedWorkEntryOp = new SyncOperation(
				'op-1',
				'create',
				'work_entries',
				'entry-1',
				{ date: '2024-01-01', status: 'office' },
				'failed'
			);
			const failedTrackerOp = new SyncOperation(
				'op-2',
				'create',
				'trackers',
				'tracker-1',
				{ name: 'Tracker' },
				'failed'
			);

			mockSyncQueueRepository.getAll.mockResolvedValue([
				failedWorkEntryOp,
				failedTrackerOp,
			]);

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			const failedRecords = await act(async () => {
				return await result.current.entry.getFailedSyncRecords();
			});

			expect(failedRecords).toHaveLength(1);
			expect(failedRecords[0].id).toBe('entry-1');
		});

		it('should get records exceeding retry limit', async () => {
			const exceededOp1 = new SyncOperation(
				'op-1',
				'create',
				'work_entries',
				'entry-1',
				{ date: '2024-01-01', status: 'office' },
				'failed',
				5,
				3
			);
			const exceededOp2 = new SyncOperation(
				'op-2',
				'update',
				'work_entries',
				'entry-2',
				{ date: '2024-01-02', status: 'wfh' },
				'pending',
				5,
				3
			);
			const belowLimitOp = new SyncOperation(
				'op-3',
				'create',
				'work_entries',
				'entry-3',
				{ date: '2024-01-03', status: 'office' },
				'failed',
				2,
				3
			);

			mockSyncQueueRepository.getAll.mockResolvedValue([
				exceededOp1,
				exceededOp2,
				belowLimitOp,
			]);

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			const exceededRecords = await act(async () => {
				return await result.current.entry.getRecordsExceedingRetryLimit(
					5
				);
			});

			expect(exceededRecords).toHaveLength(2);
			expect(exceededRecords[0].id).toBe('entry-1');
			expect(exceededRecords[1].id).toBe('entry-2');
		});

		it('should filter out non-work_entries operations from exceeded records', async () => {
			const exceededWorkEntryOp = new SyncOperation(
				'op-1',
				'create',
				'work_entries',
				'entry-1',
				{ date: '2024-01-01', status: 'office' },
				'failed',
				5,
				3
			);
			const exceededTrackerOp = new SyncOperation(
				'op-2',
				'create',
				'trackers',
				'tracker-1',
				{ name: 'Tracker' },
				'failed',
				5,
				3
			);

			mockSyncQueueRepository.getAll.mockResolvedValue([
				exceededWorkEntryOp,
				exceededTrackerOp,
			]);

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			const exceededRecords = await act(async () => {
				return await result.current.entry.getRecordsExceedingRetryLimit(
					5
				);
			});

			expect(exceededRecords).toHaveLength(1);
			expect(exceededRecords[0].id).toBe('entry-1');
		});

		it('should filter out operations without data from exceeded records', async () => {
			const exceededOp = new SyncOperation(
				'op-1',
				'create',
				'work_entries',
				'entry-1',
				undefined,
				'failed',
				5,
				3
			);

			mockSyncQueueRepository.getAll.mockResolvedValue([exceededOp]);

			const { result } = renderHook(() => useWorkTrackManager(), {
				wrapper,
			});

			const exceededRecords = await act(async () => {
				return await result.current.entry.getRecordsExceedingRetryLimit(
					5
				);
			});

			expect(exceededRecords).toHaveLength(0);
		});
	});
});
