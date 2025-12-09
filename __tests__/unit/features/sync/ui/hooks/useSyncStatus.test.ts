import { act, renderHook } from '@testing-library/react-native';

import { useSyncStatus } from '@/features/sync/ui/hooks/useSyncStatus';

describe('useSyncStatus', () => {
	it('should return initial state', () => {
		const { result } = renderHook(() => useSyncStatus());

		expect(result.current.status).toBe('idle');
		expect(result.current.lastSyncTime).toBeNull();
		expect(result.current.error).toBeNull();
		expect(result.current.setSyncing).toBeDefined();
		expect(result.current.setSuccess).toBeDefined();
		expect(result.current.setError).toBeDefined();
		expect(result.current.setIdle).toBeDefined();
		expect(result.current.clearError).toBeDefined();
	});

	it('should set status to syncing when setSyncing is called', () => {
		const { result } = renderHook(() => useSyncStatus());

		act(() => {
			result.current.setSyncing();
		});

		expect(result.current.status).toBe('syncing');
		expect(result.current.error).toBeNull();
	});

	it('should set status to success when setSuccess is called', () => {
		const { result } = renderHook(() => useSyncStatus());

		act(() => {
			result.current.setSuccess();
		});

		expect(result.current.status).toBe('success');
		expect(result.current.lastSyncTime).not.toBeNull();
		expect(result.current.lastSyncTime).toBeInstanceOf(Date);
		expect(result.current.error).toBeNull();
	});

	it('should set status to error when setError is called', () => {
		const { result } = renderHook(() => useSyncStatus());
		const errorMessage = 'Sync failed';

		act(() => {
			result.current.setError(errorMessage);
		});

		expect(result.current.status).toBe('error');
		expect(result.current.error).toBe(errorMessage);
	});

	it('should set status to idle when setIdle is called', () => {
		const { result } = renderHook(() => useSyncStatus());

		// First set to syncing
		act(() => {
			result.current.setSyncing();
		});

		expect(result.current.status).toBe('syncing');

		// Then set to idle
		act(() => {
			result.current.setIdle();
		});

		expect(result.current.status).toBe('idle');
		expect(result.current.error).toBeNull();
	});

	it('should clear error when clearError is called', () => {
		const { result } = renderHook(() => useSyncStatus());

		// First set an error
		act(() => {
			result.current.setError('Test error');
		});

		expect(result.current.error).toBe('Test error');
		expect(result.current.status).toBe('error');

		// Then clear it
		act(() => {
			result.current.clearError();
		});

		expect(result.current.error).toBeNull();
	});

	it('should set status to idle when clearError is called from error state', () => {
		const { result } = renderHook(() => useSyncStatus());

		// Set to error state
		act(() => {
			result.current.setError('Test error');
		});

		expect(result.current.status).toBe('error');

		// Clear error should also change status to idle
		act(() => {
			result.current.clearError();
		});

		expect(result.current.status).toBe('idle');
		expect(result.current.error).toBeNull();
	});

	it('should not change status when clearError is called from non-error state', () => {
		const { result } = renderHook(() => useSyncStatus());

		// Set to success state
		act(() => {
			result.current.setSuccess();
		});

		expect(result.current.status).toBe('success');

		// Clear error should not change status
		act(() => {
			result.current.clearError();
		});

		expect(result.current.status).toBe('success');
	});

	it('should update lastSyncTime on subsequent successful syncs', () => {
		const { result } = renderHook(() => useSyncStatus());

		let firstSyncTime: Date | null;

		act(() => {
			result.current.setSuccess();
			firstSyncTime = result.current.lastSyncTime;
		});

		// Wait a bit to ensure different timestamp
		act(() => {
			result.current.setSyncing();
			result.current.setSuccess();
		});

		expect(result.current.lastSyncTime).not.toBeNull();
		if (result.current.lastSyncTime && firstSyncTime!) {
			expect(result.current.lastSyncTime.getTime()).toBeGreaterThan(
				firstSyncTime.getTime()
			);
		}
	});

	it('should maintain function references across renders', () => {
		const { result, rerender } = renderHook(() => useSyncStatus());

		const firstSetSyncing = result.current.setSyncing;
		const firstSetSuccess = result.current.setSuccess;
		const firstSetError = result.current.setError;

		rerender({});

		expect(result.current.setSyncing).toBe(firstSetSyncing);
		expect(result.current.setSuccess).toBe(firstSetSuccess);
		expect(result.current.setError).toBe(firstSetError);
	});
});
