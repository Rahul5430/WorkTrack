import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useDefaultView } from '@/features/sharing/ui/hooks/useDefaultView';

jest.mock('@react-native-async-storage/async-storage');

describe('useDefaultView', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
		(AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
		(AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
	});

	it('should return initial state', () => {
		const { result } = renderHook(() => useDefaultView());

		expect(result.current.defaultViewUserId).toBeNull();
		expect(result.current.setDefaultView).toBeDefined();
		expect(result.current.clearDefaultView).toBeDefined();
		expect(result.current.loadDefaultView).toBeDefined();
	});

	it('should load default view on mount', async () => {
		const testUserId = 'user-123';
		(AsyncStorage.getItem as jest.Mock).mockResolvedValue(testUserId);

		const { result } = renderHook(() => useDefaultView());

		await waitFor(() => {
			expect(result.current.defaultViewUserId).toBe(testUserId);
		});

		expect(AsyncStorage.getItem).toHaveBeenCalledWith('defaultViewUserId');
	});

	it('should set default view when not already set', async () => {
		const { result } = renderHook(() => useDefaultView());
		const testUserId = 'user-456';

		await act(async () => {
			await result.current.setDefaultView(testUserId);
		});

		expect(AsyncStorage.setItem).toHaveBeenCalledWith(
			'defaultViewUserId',
			testUserId
		);
		expect(result.current.defaultViewUserId).toBe(testUserId);
	});

	it('should toggle default view when setting same user', async () => {
		const testUserId = 'user-789';
		(AsyncStorage.getItem as jest.Mock).mockResolvedValue(testUserId);

		const { result } = renderHook(() => useDefaultView());

		await waitFor(() => {
			expect(result.current.defaultViewUserId).toBe(testUserId);
		});

		await act(async () => {
			await result.current.setDefaultView(testUserId);
		});

		expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
			'defaultViewUserId'
		);
		expect(result.current.defaultViewUserId).toBeNull();
	});

	it('should clear default view', async () => {
		const testUserId = 'user-abc';
		(AsyncStorage.getItem as jest.Mock).mockResolvedValue(testUserId);

		const { result } = renderHook(() => useDefaultView());

		await waitFor(() => {
			expect(result.current.defaultViewUserId).toBe(testUserId);
		});

		await act(async () => {
			await result.current.clearDefaultView();
		});

		expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
			'defaultViewUserId'
		);
		expect(result.current.defaultViewUserId).toBeNull();
	});

	it('should handle error when loading default view', async () => {
		(AsyncStorage.getItem as jest.Mock).mockRejectedValue(
			new Error('Storage error')
		);

		const { result } = renderHook(() => useDefaultView());

		await waitFor(() => {
			expect(AsyncStorage.getItem).toHaveBeenCalled();
		});

		expect(result.current.defaultViewUserId).toBeNull();
	});

	it('should throw error when setting default view fails', async () => {
		const { result } = renderHook(() => useDefaultView());
		const testUserId = 'user-xyz';
		const error = new Error('Storage write error');
		(AsyncStorage.setItem as jest.Mock).mockRejectedValue(error);

		await expect(
			act(async () => {
				await result.current.setDefaultView(testUserId);
			})
		).rejects.toThrow('Storage write error');
	});

	it('should handle error when clearing default view', async () => {
		const testUserId = 'user-123';
		(AsyncStorage.getItem as jest.Mock).mockResolvedValue(testUserId);

		const { result } = renderHook(() => useDefaultView());

		await waitFor(() => {
			expect(result.current.defaultViewUserId).toBe(testUserId);
		});

		(AsyncStorage.removeItem as jest.Mock).mockRejectedValue(
			new Error('Storage error')
		);

		await act(async () => {
			await result.current.clearDefaultView();
		});

		expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
			'defaultViewUserId'
		);
		expect(result.current.defaultViewUserId).toBe(testUserId);
	});

	it('should maintain function references across renders', () => {
		const { result, rerender } = renderHook(() => useDefaultView());

		const firstSetDefaultView = result.current.setDefaultView;
		const firstClearDefaultView = result.current.clearDefaultView;
		const firstLoadDefaultView = result.current.loadDefaultView;

		rerender({});

		expect(result.current.setDefaultView).toBe(firstSetDefaultView);
		expect(result.current.clearDefaultView).toBe(firstClearDefaultView);
		expect(result.current.loadDefaultView).toBe(firstLoadDefaultView);
	});
});
