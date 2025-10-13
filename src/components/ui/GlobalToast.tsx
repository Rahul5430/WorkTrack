import React, { useEffect, useState } from 'react';

import { type ToastMessage, ToastQueueService } from '../../services';
import { Toast } from './Toast';

export const GlobalToast: React.FC = () => {
	const [currentToast, setCurrentToast] = useState<ToastMessage | null>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const toastService = ToastQueueService.getInstance();

		const unsubscribe = toastService.subscribe({
			onToastShow: (toast: ToastMessage) => {
				setCurrentToast(toast);
				setVisible(true);
			},
			onToastHide: (toastId: string) => {
				if (currentToast?.id === toastId) {
					setVisible(false);
					setCurrentToast(null);
				}
			},
		});

		return unsubscribe;
	}, [currentToast?.id]); // Subscribe only once

	if (!currentToast) return null;

	return (
		<Toast
			visible={visible}
			message={currentToast.message}
			type={currentToast.type}
			duration={currentToast.duration}
			position={currentToast.position}
			onHide={() => setVisible(false)}
		/>
	);
};
