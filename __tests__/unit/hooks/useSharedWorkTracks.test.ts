import { act, renderHook } from '@testing-library/react-native';
import { useDispatch, useSelector } from 'react-redux';

import { DEFAULT_TRACKER_TYPE } from '../../../src/constants';
import { useSharedWorkTracks } from '../../../src/hooks/useSharedWorkTracks';
import { useWorkTrackManager } from '../../../src/hooks/useWorkTrackManager';
import { logger } from '../../../src/logging';
import { setLoading } from '../../../src/store/reducers/workTrackSlice';

// Mock dependencies
jest.mock('react-redux');
jest.mock('../../../src/logging');
jest.mock('../../../src/store/reducers/workTrackSlice');
jest.mock('../../../src/hooks/useWorkTrackManager');

const mockDispatch = jest.fn();
const mockUseDispatch = useDispatch as jest.MockedFunction<typeof useDispatch>;
const mockUseSelector = useSelector as jest.MockedFunction<typeof useSelector>;
const mockUseWorkTrackManager = useWorkTrackManager as jest.MockedFunction<
	typeof useWorkTrackManager
>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('useSharedWorkTracks', () => {
	const mockManager = {
		shareRead: {
			getSharedWithMe: jest.fn(),
		},
	};

	const mockUser = {
		id: 'user123',
		email: 'test@example.com',
		name: 'Test User',
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockUseDispatch.mockReturnValue(mockDispatch);
		mockUseWorkTrackManager.mockReturnValue(
			mockManager as unknown as ReturnType<typeof useWorkTrackManager>
		);
		mockUseSelector.mockReturnValue(mockUser);
	});

	it('should initialize with empty state', () => {
		const { result } = renderHook(() => useSharedWorkTracks());

		expect(result.current.sharedWorkTracks).toEqual([]);
		// Loading might be true initially due to useEffect
		expect(typeof result.current.refresh).toBe('function');
	});

	it('should load shared work tracks successfully', async () => {
		const mockSharedTracks = [
			{
				ownerId: 'owner1',
				ownerName: 'Owner One',
				ownerEmail: 'owner1@example.com',
				ownerPhoto: 'photo1.jpg',
				permission: 'read' as const,
				trackerType: 'work' as const,
			},
			{
				ownerId: 'user123',
				ownerName: 'Current User',
				ownerEmail: 'test@example.com',
				permission: 'write' as const,
				trackerType: 'personal' as const,
			},
		];

		mockManager.shareRead.getSharedWithMe.mockResolvedValue(
			mockSharedTracks
		);

		const { result } = renderHook(() => useSharedWorkTracks());

		await act(async () => {
			await result.current.refresh();
		});

		expect(mockManager.shareRead.getSharedWithMe).toHaveBeenCalled();
		expect(result.current.sharedWorkTracks).toEqual([
			{
				id: 'owner1',
				ownerName: 'Owner One',
				ownerEmail: 'owner1@example.com',
				ownerPhoto: 'photo1.jpg',
				permission: 'read',
				isCurrent: false,
				trackerType: 'work',
			},
			{
				id: 'user123',
				ownerName: 'Current User',
				ownerEmail: 'test@example.com',
				ownerPhoto: undefined,
				permission: 'write',
				isCurrent: true,
				trackerType: 'personal',
			},
		]);
		expect(result.current.loading).toBe(false);
		expect(mockDispatch).toHaveBeenCalledWith(setLoading(false));
	});

	it('should handle missing owner name', async () => {
		const mockSharedTracks = [
			{
				ownerId: 'owner1',
				ownerName: null,
				ownerEmail: 'owner1@example.com',
				permission: 'read' as const,
				trackerType: 'work' as const,
			},
		];

		mockManager.shareRead.getSharedWithMe.mockResolvedValue(
			mockSharedTracks
		);

		const { result } = renderHook(() => useSharedWorkTracks());

		await act(async () => {
			await result.current.refresh();
		});

		expect(result.current.sharedWorkTracks[0].ownerName).toBe(
			'owner1@example.com'
		);
	});

	it('should handle missing tracker type', async () => {
		const mockSharedTracks = [
			{
				ownerId: 'owner1',
				ownerName: 'Owner One',
				ownerEmail: 'owner1@example.com',
				permission: 'read' as const,
				trackerType: null,
			},
		];

		mockManager.shareRead.getSharedWithMe.mockResolvedValue(
			mockSharedTracks
		);

		const { result } = renderHook(() => useSharedWorkTracks());

		await act(async () => {
			await result.current.refresh();
		});

		expect(result.current.sharedWorkTracks[0].trackerType).toBe(
			DEFAULT_TRACKER_TYPE
		);
	});

	it('should handle errors gracefully', async () => {
		const error = new Error('Failed to load shared tracks');
		mockManager.shareRead.getSharedWithMe.mockRejectedValue(error);

		const { result } = renderHook(() => useSharedWorkTracks());

		await act(async () => {
			await result.current.refresh();
		});

		expect(mockLogger.error).toHaveBeenCalledWith(
			'Error loading shared worktracks:',
			{ error }
		);
		expect(result.current.loading).toBe(false);
		expect(mockDispatch).toHaveBeenCalledWith(setLoading(false));
	});

	it('should not load tracks when user is not available', async () => {
		mockUseSelector.mockReturnValue(null);

		const { result } = renderHook(() => useSharedWorkTracks());

		await act(async () => {
			await result.current.refresh();
		});

		expect(mockManager.shareRead.getSharedWithMe).not.toHaveBeenCalled();
		expect(result.current.sharedWorkTracks).toEqual([]);
	});

	it('should set loading state during fetch', async () => {
		let resolvePromise: (value: unknown) => void;
		const promise = new Promise((resolve) => {
			resolvePromise = resolve;
		});
		mockManager.shareRead.getSharedWithMe.mockReturnValue(promise);

		const { result } = renderHook(() => useSharedWorkTracks());

		act(() => {
			result.current.refresh();
		});

		expect(result.current.loading).toBe(true);
		expect(mockDispatch).toHaveBeenCalledWith(setLoading(true));

		await act(async () => {
			resolvePromise!([]);
			await promise;
		});

		expect(result.current.loading).toBe(false);
		expect(mockDispatch).toHaveBeenCalledWith(setLoading(false));
	});

	it('should load shared work tracks on mount via useEffect', async () => {
		const mockSharedTracks = [
			{
				ownerId: 'owner1',
				ownerName: 'Owner One',
				ownerEmail: 'owner1@example.com',
				permission: 'read' as const,
				trackerType: 'work' as const,
			},
		];

		mockManager.shareRead.getSharedWithMe.mockResolvedValue(
			mockSharedTracks
		);

		const { result } = renderHook(() => useSharedWorkTracks());

		// Wait for useEffect to trigger
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		expect(mockManager.shareRead.getSharedWithMe).toHaveBeenCalled();
		expect(result.current.sharedWorkTracks).toEqual([
			{
				id: 'owner1',
				ownerName: 'Owner One',
				ownerEmail: 'owner1@example.com',
				ownerPhoto: undefined,
				permission: 'read',
				isCurrent: false,
				trackerType: 'work',
			},
		]);
	});
});
