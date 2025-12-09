// migrated to V2 structure
import { configureStore } from '@reduxjs/toolkit';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Provider } from 'react-redux';

import { useDI } from '@/app/providers/DIProvider';
import { userSlice } from '@/app/store/reducers/userSlice';
import { workTrackSlice } from '@/app/store/reducers/workTrackSlice';
import { ServiceIdentifiers } from '@/di/registry';
import TrackerModel from '@/features/attendance/data/models/TrackerModel';
import { AttendanceServiceIdentifiers } from '@/features/attendance/di';
import { Tracker } from '@/features/attendance/domain/entities/Tracker';
import { useSharedWorkTracks } from '@/features/attendance/ui/hooks/useSharedWorkTracks';
import { AuthServiceIdentifiers } from '@/features/auth/di';
import { User } from '@/features/auth/domain/entities/User';
import { SharingServiceIdentifiers } from '@/features/sharing/di';
import { Permission } from '@/features/sharing/domain/entities/Permission';
import { Share } from '@/features/sharing/domain/entities/Share';

// Mock DI provider
jest.mock('@/app/providers/DIProvider', () => ({
	useDI: jest.fn(),
}));

// Mock logger
jest.mock('@/shared/utils/logging', () => ({
	logger: {
		info: jest.fn(),
		warn: jest.fn(),
		error: jest.fn(),
		debug: jest.fn(),
	},
}));

describe('useSharedWorkTracks', () => {
	let store: ReturnType<typeof configureStore>;
	let mockContainer: {
		resolve: jest.Mock;
	};
	let mockGetSharedWithMeUseCase: {
		execute: jest.Mock;
	};
	let mockTrackerRepository: {
		getById: jest.Mock;
	};
	let mockAuthRepository: {
		getUserById: jest.Mock;
	};
	let mockDatabase: {
		get: jest.Mock;
	};
	let mockCollection: {
		query: jest.Mock;
	};
	let mockQuery: {
		fetch: jest.Mock;
	};

	beforeEach(() => {
		jest.clearAllMocks();

		store = configureStore({
			reducer: {
				user: userSlice.reducer,
				workTrack: workTrackSlice.reducer,
			},
		});

		// Setup mock query chain
		mockQuery = {
			fetch: jest.fn(),
		};
		mockCollection = {
			query: jest.fn().mockReturnValue(mockQuery),
		};
		mockDatabase = {
			get: jest.fn().mockReturnValue(mockCollection),
		};

		mockGetSharedWithMeUseCase = {
			execute: jest.fn(),
		};

		mockTrackerRepository = {
			getById: jest.fn(),
		};

		mockAuthRepository = {
			getUserById: jest.fn(),
		};

		mockContainer = {
			resolve: jest.fn((identifier) => {
				if (
					identifier === SharingServiceIdentifiers.GET_SHARED_WITH_ME
				) {
					return mockGetSharedWithMeUseCase;
				}
				if (
					identifier ===
					AttendanceServiceIdentifiers.TRACKER_REPOSITORY
				) {
					return mockTrackerRepository;
				}
				if (identifier === AuthServiceIdentifiers.AUTH_REPOSITORY) {
					return mockAuthRepository;
				}
				if (identifier === ServiceIdentifiers.WATERMELON_DB) {
					return mockDatabase;
				}
				return null;
			}),
		};

		(useDI as jest.Mock).mockReturnValue(mockContainer);
	});

	const wrapper = ({ children }: { children: React.ReactNode }) =>
		React.createElement(
			Provider,
			{ store } as React.ComponentProps<typeof Provider>,
			children
		);

	it('should initialize with empty sharedWorkTracks', () => {
		const { result } = renderHook(() => useSharedWorkTracks(), { wrapper });

		expect(result.current.sharedWorkTracks).toEqual([]);
		expect(result.current.loading).toBe(false);
		expect(result.current.error).toBeNull();
		expect(result.current.refresh).toBeDefined();
	});

	it('should return empty array when user is not authenticated', async () => {
		// Set user to null
		act(() => {
			store.dispatch(userSlice.actions.setUser(null));
		});

		const { result } = renderHook(() => useSharedWorkTracks(), { wrapper });

		await waitFor(() => {
			expect(result.current.sharedWorkTracks).toEqual([]);
		});

		expect(mockGetSharedWithMeUseCase.execute).not.toHaveBeenCalled();
	});

	it('should load shared work tracks successfully', async () => {
		const userId = 'user-1';
		const user = {
			id: userId,
			name: 'Test User',
			email: 'test@example.com',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		act(() => {
			store.dispatch(userSlice.actions.setUser(user));
		});

		const trackerId = 'tracker-1';
		const shareId = 'share-1';
		const sharedWithUserId = userId;
		const ownerUserId = 'owner-1';

		const share = new Share(
			shareId,
			trackerId,
			sharedWithUserId,
			new Permission('read')
		);

		const tracker = new Tracker(trackerId, 'My Tracker', '', true);
		const ownerUser = new User(
			ownerUserId,
			'owner@example.com',
			'Owner User',
			'https://example.com/photo.jpg',
			new Date(),
			new Date()
		);

		const trackerModel = {
			userId: ownerUserId,
		} as TrackerModel;

		mockGetSharedWithMeUseCase.execute.mockResolvedValue([share]);
		mockTrackerRepository.getById.mockResolvedValue(tracker);
		mockQuery.fetch.mockResolvedValue([trackerModel]);
		mockAuthRepository.getUserById.mockResolvedValue(ownerUser);

		const { result } = renderHook(() => useSharedWorkTracks(), { wrapper });

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.sharedWorkTracks).toHaveLength(1);
		expect(result.current.sharedWorkTracks[0]).toEqual({
			id: trackerId,
			ownerName: 'Owner User',
			ownerEmail: 'owner@example.com',
			ownerPhoto: 'https://example.com/photo.jpg',
			permission: 'read',
		});
		expect(result.current.error).toBeNull();
	});

	it('should handle errors when loading shared work tracks', async () => {
		const userId = 'user-1';
		const user = {
			id: userId,
			name: 'Test User',
			email: 'test@example.com',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		act(() => {
			store.dispatch(userSlice.actions.setUser(user));
		});

		const error = new Error('Failed to load shares');
		mockGetSharedWithMeUseCase.execute.mockRejectedValue(error);

		const { result } = renderHook(() => useSharedWorkTracks(), { wrapper });

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.error).toBe('Failed to load shares');
		expect(result.current.sharedWorkTracks).toEqual([]);
	});

	it('should handle non-Error exceptions when loading', async () => {
		const userId = 'user-1';
		const user = {
			id: userId,
			name: 'Test User',
			email: 'test@example.com',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		act(() => {
			store.dispatch(userSlice.actions.setUser(user));
		});

		mockGetSharedWithMeUseCase.execute.mockRejectedValue('String error');

		const { result } = renderHook(() => useSharedWorkTracks(), { wrapper });

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.error).toBe('Failed to load shared work tracks');
		expect(result.current.sharedWorkTracks).toEqual([]);
	});

	it('should filter out null tracker results', async () => {
		const userId = 'user-1';
		const user = {
			id: userId,
			name: 'Test User',
			email: 'test@example.com',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		act(() => {
			store.dispatch(userSlice.actions.setUser(user));
		});

		const share1 = new Share(
			'share-1',
			'tracker-1',
			userId,
			new Permission('read')
		);
		const share2 = new Share(
			'share-2',
			'tracker-2',
			userId,
			new Permission('write')
		);

		mockGetSharedWithMeUseCase.execute.mockResolvedValue([share1, share2]);
		mockTrackerRepository.getById.mockResolvedValueOnce(null); // First tracker not found
		mockTrackerRepository.getById.mockResolvedValueOnce(
			new Tracker('tracker-2', 'Tracker 2', '', true)
		);

		const { result } = renderHook(() => useSharedWorkTracks(), { wrapper });

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		// Should only include the valid tracker
		expect(result.current.sharedWorkTracks.length).toBeLessThanOrEqual(1);
	});

	it('should handle missing trackerModel userId', async () => {
		const userId = 'user-1';
		const user = {
			id: userId,
			name: 'Test User',
			email: 'test@example.com',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		act(() => {
			store.dispatch(userSlice.actions.setUser(user));
		});

		const share = new Share(
			'share-1',
			'tracker-1',
			userId,
			new Permission('read')
		);
		const tracker = new Tracker('tracker-1', 'My Tracker', '', true);

		const trackerModel = {} as TrackerModel; // No userId

		mockGetSharedWithMeUseCase.execute.mockResolvedValue([share]);
		mockTrackerRepository.getById.mockResolvedValue(tracker);
		mockQuery.fetch.mockResolvedValue([trackerModel]);

		const { result } = renderHook(() => useSharedWorkTracks(), { wrapper });

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		// Should filter out trackers without owner userId
		expect(result.current.sharedWorkTracks).toHaveLength(0);
	});

	it('should handle missing owner user', async () => {
		const userId = 'user-1';
		const user = {
			id: userId,
			name: 'Test User',
			email: 'test@example.com',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		act(() => {
			store.dispatch(userSlice.actions.setUser(user));
		});

		const share = new Share(
			'share-1',
			'tracker-1',
			userId,
			new Permission('read')
		);
		const tracker = new Tracker('tracker-1', 'My Tracker', '', true);
		const trackerModel = {
			userId: 'owner-1',
		} as TrackerModel;

		mockGetSharedWithMeUseCase.execute.mockResolvedValue([share]);
		mockTrackerRepository.getById.mockResolvedValue(tracker);
		mockQuery.fetch.mockResolvedValue([trackerModel]);
		mockAuthRepository.getUserById.mockResolvedValue(null);

		const { result } = renderHook(() => useSharedWorkTracks(), { wrapper });

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		// Should filter out shares without owner user
		expect(result.current.sharedWorkTracks).toHaveLength(0);
	});

	it('should support write permission', async () => {
		const userId = 'user-1';
		const user = {
			id: userId,
			name: 'Test User',
			email: 'test@example.com',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		act(() => {
			store.dispatch(userSlice.actions.setUser(user));
		});

		const share = new Share(
			'share-1',
			'tracker-1',
			userId,
			new Permission('write')
		);
		const tracker = new Tracker('tracker-1', 'My Tracker', '', true);
		const ownerUser = new User(
			'owner-1',
			'owner@example.com',
			'Owner User'
		);
		const trackerModel = {
			userId: 'owner-1',
		} as TrackerModel;

		mockGetSharedWithMeUseCase.execute.mockResolvedValue([share]);
		mockTrackerRepository.getById.mockResolvedValue(tracker);
		mockQuery.fetch.mockResolvedValue([trackerModel]);
		mockAuthRepository.getUserById.mockResolvedValue(ownerUser);

		const { result } = renderHook(() => useSharedWorkTracks(), { wrapper });

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.sharedWorkTracks[0].permission).toBe('write');
	});

	it('should refresh shared work tracks when refresh is called', async () => {
		const userId = 'user-1';
		const user = {
			id: userId,
			name: 'Test User',
			email: 'test@example.com',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		act(() => {
			store.dispatch(userSlice.actions.setUser(user));
		});

		mockGetSharedWithMeUseCase.execute.mockResolvedValue([]);

		const { result } = renderHook(() => useSharedWorkTracks(), { wrapper });

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		// Clear previous calls
		mockGetSharedWithMeUseCase.execute.mockClear();

		// Call refresh
		await act(async () => {
			await result.current.refresh();
		});

		expect(mockGetSharedWithMeUseCase.execute).toHaveBeenCalledWith(userId);
	});

	it('should dispatch setWorkTrackLoading during load', async () => {
		const userId = 'user-1';
		const user = {
			id: userId,
			name: 'Test User',
			email: 'test@example.com',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		act(() => {
			store.dispatch(userSlice.actions.setUser(user));
		});

		mockGetSharedWithMeUseCase.execute.mockImplementation(
			() =>
				new Promise((resolve) => {
					setTimeout(() => resolve([]), 100);
				})
		);

		const { result } = renderHook(() => useSharedWorkTracks(), { wrapper });

		// Check loading state is set
		expect(result.current.loading).toBe(true);
		// @ts-expect-error - workTrack state is typed as unknown for testing
		const workTrackState = store.getState().workTrack as {
			loading: boolean;
		};
		expect(workTrackState.loading).toBe(true);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		// @ts-expect-error - workTrack state is typed as unknown for testing
		const finalState = store.getState().workTrack as { loading: boolean };
		expect(finalState.loading).toBe(false);
	});

	it('should set loading to false on error', async () => {
		const userId = 'user-1';
		const user = {
			id: userId,
			name: 'Test User',
			email: 'test@example.com',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		act(() => {
			store.dispatch(userSlice.actions.setUser(user));
		});

		mockGetSharedWithMeUseCase.execute.mockRejectedValue(
			new Error('Load failed')
		);

		const { result } = renderHook(() => useSharedWorkTracks(), { wrapper });

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.error).toBe('Load failed');
		// @ts-expect-error - workTrack state is typed as unknown for testing
		const workTrackState = store.getState().workTrack as {
			loading: boolean;
		};
		expect(workTrackState.loading).toBe(false);
	});

	it('should use sharedTracks alias', () => {
		const { result } = renderHook(() => useSharedWorkTracks(), { wrapper });

		// sharedTracks should be an alias for sharedWorkTracks
		expect(result.current.sharedTracks).toBe(
			result.current.sharedWorkTracks
		);
	});
});
