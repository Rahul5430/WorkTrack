import { useCallback } from 'react';

import { ToastType } from '@/shared/ui/components/feedback/Toast';
import { type ToastMessage, ToastQueueService } from '@/shared/utils/toast';

export const useToast = () => {
	const toastService = ToastQueueService.getInstance();

	const show = useCallback(
		(
			message: string,
			type: ToastType = 'info',
			duration: number = 3000,
			position: 'top' | 'bottom' = 'bottom'
		) => {
			return toastService.show(message, type, duration, position);
		},
		[toastService]
	);

	const showMultiple = useCallback(
		(toasts: Omit<ToastMessage, 'id'>[]) => {
			return toastService.showMultiple(toasts);
		},
		[toastService]
	);

	const clear = useCallback(() => {
		toastService.clear();
	}, [toastService]);

	const remove = useCallback(
		(toastId: string) => {
			return toastService.remove(toastId);
		},
		[toastService]
	);

	const getStatus = useCallback(() => {
		return toastService.getStatus();
	}, [toastService]);

	return {
		show,
		showMultiple,
		clear,
		remove,
		getStatus,
	};
};
