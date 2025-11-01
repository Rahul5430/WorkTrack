// migrated to V2 structure
import { useCallback, useState } from 'react';

export const useSharing = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const shareTracker = useCallback(
		async (_email: string, _permission: 'read' | 'write') => {
			setIsLoading(true);
			setError(null);

			try {
			} catch {
				setError('Failed to share tracker');
			} finally {
				setIsLoading(false);
			}
		},
		[]
	);

	const updatePermission = useCallback(
		async (_shareId: string, _permission: 'read' | 'write') => {
			setIsLoading(true);
			setError(null);

			try {
			} catch {
				setError('Failed to update permission');
			} finally {
				setIsLoading(false);
			}
		},
		[]
	);

	const removeShare = useCallback(async (_shareId: string) => {
		setIsLoading(true);
		setError(null);

		try {
		} catch {
			setError('Failed to remove share');
		} finally {
			setIsLoading(false);
		}
	}, []);

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	return {
		isLoading,
		error,
		shareTracker,
		updatePermission,
		removeShare,
		clearError,
	};
};
