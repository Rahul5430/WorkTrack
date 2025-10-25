// migrated to V2 structure
import { useCallback, useState } from 'react';

export const useSync = () => {
	const [isSyncing, setIsSyncing] = useState(false);
	const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
	const [error, setError] = useState<string | null>(null);

	const syncToRemote = useCallback(async () => {
		setIsSyncing(true);
		setError(null);

		try {
			// TODO: Implement actual sync to remote logic
			// console.log('Syncing to remote...');
			setLastSyncTime(new Date());
		} catch (err) {
			setError('Failed to sync to remote');
		} finally {
			setIsSyncing(false);
		}
	}, []);

	const syncFromRemote = useCallback(async () => {
		setIsSyncing(true);
		setError(null);

		try {
			// TODO: Implement actual sync from remote logic
			// console.log('Syncing from remote...');
			setLastSyncTime(new Date());
		} catch (err) {
			setError('Failed to sync from remote');
		} finally {
			setIsSyncing(false);
		}
	}, []);

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	return {
		isSyncing,
		lastSyncTime,
		error,
		syncToRemote,
		syncFromRemote,
		clearError,
	};
};
