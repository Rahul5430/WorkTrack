// migrated to V2 structure
import { useCallback, useState } from 'react';

import { MarkedDayStatus } from '@/types/calendar';

export const useEntryForm = () => {
	const [status, setStatus] = useState<MarkedDayStatus | null>(null);
	const [isAdvisory, setIsAdvisory] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleStatusChange = useCallback((newStatus: MarkedDayStatus) => {
		setStatus(newStatus);
		setError(null);
	}, []);

	const handleAdvisoryChange = useCallback((advisory: boolean) => {
		setIsAdvisory(advisory);
	}, []);

	const handleSave = useCallback(
		async (
			onSave: (
				status: MarkedDayStatus,
				isAdvisory: boolean
			) => Promise<void>
		) => {
			if (!status) {
				setError('Please select a status');
				return;
			}

			setIsSaving(true);
			setError(null);

			try {
				await onSave(status, isAdvisory);
			} catch (err) {
				setError('Failed to save status');
			} finally {
				setIsSaving(false);
			}
		},
		[status, isAdvisory]
	);

	const reset = useCallback(() => {
		setStatus(null);
		setIsAdvisory(false);
		setIsSaving(false);
		setError(null);
	}, []);

	return {
		status,
		isAdvisory,
		isSaving,
		error,
		handleStatusChange,
		handleAdvisoryChange,
		handleSave,
		reset,
	};
};
