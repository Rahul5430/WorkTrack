import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useDI } from '@/app/providers/DIProvider';
import { SharingServiceIdentifiers } from '@/features/sharing/di';
import { Permission } from '@/features/sharing/domain/entities/Permission';
import { Share } from '@/features/sharing/domain/entities/Share';
import { useShares } from '@/features/sharing/ui/hooks/useShares';

jest.mock('@/app/providers/DIProvider', () => ({
	useDI: jest.fn(),
}));

jest.mock('@/shared/utils/logging', () => ({
	logger: {
		info: jest.fn(),
		warn: jest.fn(),
		error: jest.fn(),
		debug: jest.fn(),
	},
}));

describe('useShares', () => {
	let mockContainer: {
		resolve: jest.Mock;
	};
	let mockGetMySharesUseCase: {
		execute: jest.Mock;
	};
	let mockGetSharedWithMeUseCase: {
		execute: jest.Mock;
	};

	beforeEach(() => {
		jest.clearAllMocks();

		mockGetMySharesUseCase = {
			execute: jest.fn(),
		};

		mockGetSharedWithMeUseCase = {
			execute: jest.fn(),
		};

		mockContainer = {
			resolve: jest.fn((identifier) => {
				if (identifier === SharingServiceIdentifiers.GET_MY_SHARES) {
					return mockGetMySharesUseCase;
				}
				if (
					identifier === SharingServiceIdentifiers.GET_SHARED_WITH_ME
				) {
					return mockGetSharedWithMeUseCase;
				}
				return null;
			}),
		};

		(useDI as jest.Mock).mockReturnValue(mockContainer);
	});

	it('should return initial state', () => {
		const { result } = renderHook(() => useShares());

		expect(result.current.isLoading).toBe(false);
		expect(result.current.error).toBeNull();
		expect(result.current.myShares).toEqual([]);
		expect(result.current.sharedWithMe).toEqual([]);
		expect(result.current.loadShares).toBeDefined();
		expect(result.current.clearError).toBeDefined();
	});

	it('should load shares successfully', async () => {
		const userId = 'user-123';
		const mySharesData: Share[] = [
			new Share(
				'share-1',
				'tracker-1',
				'user-456',
				new Permission('read')
			),
		];
		const sharedWithMeData: Share[] = [
			new Share('share-2', 'tracker-2', userId, new Permission('write')),
		];

		mockGetMySharesUseCase.execute.mockResolvedValue(mySharesData);
		mockGetSharedWithMeUseCase.execute.mockResolvedValue(sharedWithMeData);

		const { result } = renderHook(() => useShares());

		await act(async () => {
			await result.current.loadShares(userId);
		});

		expect(result.current.isLoading).toBe(false);
		expect(result.current.error).toBeNull();
		expect(result.current.myShares).toEqual(mySharesData);
		expect(result.current.sharedWithMe).toEqual(sharedWithMeData);
	});

	it('should set loading state during load', async () => {
		const userId = 'user-123';
		const mySharesData: Share[] = [
			new Share('share-1', 'tracker-1', 'user-456', 'read'),
		];
		const sharedWithMeData: Share[] = [];

		let resolvePromise: () => void;
		const promise = new Promise<void>((resolve) => {
			resolvePromise = resolve;
		});

		mockGetMySharesUseCase.execute.mockReturnValue(promise);
		mockGetSharedWithMeUseCase.execute.mockResolvedValue(sharedWithMeData);

		const { result } = renderHook(() => useShares());

		act(() => {
			result.current.loadShares(userId);
		});

		await waitFor(() => {
			expect(result.current.isLoading).toBe(true);
		});

		resolvePromise!();
		mockGetMySharesUseCase.execute.mockResolvedValue(mySharesData);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});
	});

	it('should handle error when loading shares fails', async () => {
		const userId = 'user-123';
		const errorMessage = 'Failed to fetch shares';
		const error = new Error(errorMessage);

		mockGetMySharesUseCase.execute.mockRejectedValue(error);
		mockGetSharedWithMeUseCase.execute.mockResolvedValue([]);

		const { result } = renderHook(() => useShares());

		await act(async () => {
			await result.current.loadShares(userId);
		});

		expect(result.current.isLoading).toBe(false);
		expect(result.current.error).toBe(errorMessage);
	});

	it('should not load shares when userId is empty', async () => {
		const { result } = renderHook(() => useShares());

		await act(async () => {
			await result.current.loadShares('');
		});

		expect(mockGetMySharesUseCase.execute).not.toHaveBeenCalled();
		expect(mockGetSharedWithMeUseCase.execute).not.toHaveBeenCalled();
	});

	it('should clear error', async () => {
		const userId = 'user-123';
		const errorMessage = 'Failed to fetch shares';
		const error = new Error(errorMessage);

		mockGetMySharesUseCase.execute.mockRejectedValue(error);
		mockGetSharedWithMeUseCase.execute.mockResolvedValue([]);

		const { result } = renderHook(() => useShares());

		await act(async () => {
			await result.current.loadShares(userId);
		});

		expect(result.current.error).toBe(errorMessage);

		act(() => {
			result.current.clearError();
		});

		expect(result.current.error).toBeNull();
	});

	it('should handle error from both use cases', async () => {
		const userId = 'user-123';
		const error = new Error('Both failed');

		mockGetMySharesUseCase.execute.mockRejectedValue(error);
		mockGetSharedWithMeUseCase.execute.mockRejectedValue(error);

		const { result } = renderHook(() => useShares());

		await act(async () => {
			await result.current.loadShares(userId);
		});

		expect(result.current.isLoading).toBe(false);
		expect(result.current.error).toBeDefined();
	});

	it('should maintain function references across renders', () => {
		const { result, rerender } = renderHook(() => useShares());

		const firstLoadShares = result.current.loadShares;
		const firstClearError = result.current.clearError;

		rerender({});

		expect(result.current.loadShares).toBe(firstLoadShares);
		expect(result.current.clearError).toBe(firstClearError);
	});

	it('should handle partial success when one use case fails', async () => {
		const userId = 'user-123';
		const mySharesData: Share[] = [
			new Share('share-1', 'tracker-1', 'user-456', 'read'),
		];
		const error = new Error('Failed to get shared with me');

		mockGetMySharesUseCase.execute.mockResolvedValue(mySharesData);
		mockGetSharedWithMeUseCase.execute.mockRejectedValue(error);

		const { result } = renderHook(() => useShares());

		await act(async () => {
			await result.current.loadShares(userId);
		});

		expect(result.current.isLoading).toBe(false);
		expect(result.current.error).toBeDefined();
	});

	it('should update shares on subsequent loads', async () => {
		const userId = 'user-123';
		const initialShares: Share[] = [
			new Share('share-1', 'tracker-1', 'user-456', 'read'),
		];
		const updatedShares: Share[] = [
			new Share('share-1', 'tracker-1', 'user-456', 'read'),
			new Share('share-2', 'tracker-2', 'user-789', 'write'),
		];

		mockGetMySharesUseCase.execute.mockResolvedValueOnce(initialShares);
		mockGetMySharesUseCase.execute.mockResolvedValueOnce(updatedShares);
		mockGetSharedWithMeUseCase.execute.mockResolvedValue([]);

		const { result } = renderHook(() => useShares());

		await act(async () => {
			await result.current.loadShares(userId);
		});

		expect(result.current.myShares).toEqual(initialShares);

		await act(async () => {
			await result.current.loadShares(userId);
		});

		expect(result.current.myShares).toEqual(updatedShares);
	});

	it('should handle non-Error throw in error handling', async () => {
		const userId = 'user-123';
		mockGetMySharesUseCase.execute.mockRejectedValue('Non-Error string');

		const { result } = renderHook(() => useShares());

		await act(async () => {
			await result.current.loadShares(userId);
		});

		expect(result.current.isLoading).toBe(false);
		expect(result.current.error).toBe('Failed to load shares');
	});
});
