// Temporary stub for migration - will be replaced with actual implementation
export type ToastMessage = unknown;
export const ToastQueueService = {
	getInstance: () => ({
		show: (_message: unknown) => {},
		hide: () => {},
	}),
};
