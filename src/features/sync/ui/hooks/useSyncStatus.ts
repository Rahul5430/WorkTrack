// migrated to V2 structure
import { useCallback, useState } from 'react';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export const useSyncStatus = () => {
	const [status, setStatus] = useState<SyncStatus>('idle');
	const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
	const [error, setError] = useState<string | null>(null);

	const setSyncing = useCallback(() => {
		setStatus('syncing');
		setError(null);
	}, []);

	const setSuccess = useCallback(() => {
		setStatus('success');
		setLastSyncTime(new Date());
		setError(null);
	}, []);

	const setErrorState = useCallback((errorMessage: string) => {
		setStatus('error');
		setError(errorMessage);
	}, []);

	const setIdle = useCallback(() => {
		setStatus('idle');
		setError(null);
	}, []);

	const clearError = useCallback(() => {
		setError(null);
		if (status === 'error') {
			setStatus('idle');
		}
	}, [status]);

	return {
		status,
		lastSyncTime,
		error,
		setSyncing,
		setSuccess,
		setError: setErrorState,
		setIdle,
		clearError,
	};
};
