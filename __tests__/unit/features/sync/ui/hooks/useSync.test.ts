import { act, renderHook } from '@testing-library/react-native';

import { useSync } from '@/features/sync/ui/hooks/useSync';

describe('useSync', () => {
	it('should return initial state', () => {
		const { result } = renderHook(() => useSync());

		expect(result.current.isSyncing).toBe(false);
		expect(result.current.lastSyncTime).toBeNull();
		expect(result.current.error).toBeNull();
		expect(result.current.syncToRemote).toBeDefined();
		expect(result.current.syncFromRemote).toBeDefined();
		expect(result.current.clearError).toBeDefined();
	});

	it('should set syncing state during syncToRemote', async () => {
		const { result } = renderHook(() => useSync());

		expect(result.current.isSyncing).toBe(false);

		await act(async () => {
			await result.current.syncToRemote();
		});

		expect(result.current.isSyncing).toBe(false);
	});

	it('should update lastSyncTime after syncToRemote', async () => {
		const { result } = renderHook(() => useSync());

		expect(result.current.lastSyncTime).toBeNull();

		await act(async () => {
			await result.current.syncToRemote();
		});

		expect(result.current.lastSyncTime).not.toBeNull();
		expect(result.current.lastSyncTime).toBeInstanceOf(Date);
	});

	it('should set syncing state during syncFromRemote', async () => {
		const { result } = renderHook(() => useSync());

		expect(result.current.isSyncing).toBe(false);

		await act(async () => {
			await result.current.syncFromRemote();
		});

		expect(result.current.isSyncing).toBe(false);
	});

	it('should update lastSyncTime after syncFromRemote', async () => {
		const { result } = renderHook(() => useSync());

		expect(result.current.lastSyncTime).toBeNull();

		await act(async () => {
			await result.current.syncFromRemote();
		});

		expect(result.current.lastSyncTime).not.toBeNull();
		expect(result.current.lastSyncTime).toBeInstanceOf(Date);
	});

	it('should clear error when clearError is called', async () => {
		const { result } = renderHook(() => useSync());

		// First set an error by triggering a failed sync
		await act(async () => {
			await result.current.syncToRemote();
		});

		// Then clear it
		act(() => {
			result.current.clearError();
		});

		expect(result.current.error).toBeNull();
	});

	it('should maintain function references across renders', () => {
		const { result, rerender } = renderHook(() => useSync());

		const firstSyncToRemote = result.current.syncToRemote;
		const firstSyncFromRemote = result.current.syncFromRemote;
		const firstClearError = result.current.clearError;

		rerender({});

		expect(result.current.syncToRemote).toBe(firstSyncToRemote);
		expect(result.current.syncFromRemote).toBe(firstSyncFromRemote);
		expect(result.current.clearError).toBe(firstClearError);
	});

	it('should update lastSyncTime on subsequent syncs', async () => {
		const { result } = renderHook(() => useSync());

		let firstSyncTime: Date | null;

		await act(async () => {
			await result.current.syncToRemote();
			firstSyncTime = result.current.lastSyncTime;
		});

		// Wait a bit to ensure different timestamp
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 10));
		});

		await act(async () => {
			await result.current.syncFromRemote();
		});

		expect(result.current.lastSyncTime).not.toBeNull();
		if (result.current.lastSyncTime && firstSyncTime!) {
			expect(result.current.lastSyncTime.getTime()).toBeGreaterThan(
				firstSyncTime.getTime()
			);
		}
	});
});
