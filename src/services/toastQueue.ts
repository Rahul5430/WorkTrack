import { ToastType } from '../components/ui/Toast';

export interface ToastMessage {
	id: string;
	message: string;
	type: ToastType;
	duration?: number;
	position?: 'top' | 'bottom';
}

export interface ToastQueueSubscriber {
	onToastShow: (toast: ToastMessage) => void;
	onToastHide: (toastId: string) => void;
}

export default class ToastQueueService {
	private static instance: ToastQueueService;
	private queue: ToastMessage[] = [];
	private isShowing: boolean = false;
	private readonly subscribers: Set<ToastQueueSubscriber> = new Set();
	private currentToastId: string | null = null;

	private constructor() {}

	static getInstance(): ToastQueueService {
		if (!ToastQueueService.instance) {
			ToastQueueService.instance = new ToastQueueService();
		}
		return ToastQueueService.instance;
	}

	/**
	 * Add a toast message to the queue
	 */
	show(
		message: string,
		type: ToastType = 'info',
		duration: number = 3000,
		position: 'top' | 'bottom' = 'bottom'
	): string {
		const toast: ToastMessage = {
			id: this.generateId(),
			message,
			type,
			duration,
			position,
		};

		this.queue.push(toast);
		this.processQueue();
		return toast.id;
	}

	/**
	 * Add multiple toast messages to the queue
	 */
	showMultiple(toasts: Omit<ToastMessage, 'id'>[]): string[] {
		const ids: string[] = [];
		toasts.forEach((toast) => {
			const id = this.show(
				toast.message,
				toast.type,
				toast.duration,
				toast.position
			);
			ids.push(id);
		});
		return ids;
	}

	/**
	 * Clear all pending toasts
	 */
	clear(): void {
		this.queue = [];
		this.isShowing = false;
		const currentToastId = this.currentToastId;
		this.currentToastId = null;
		this.subscribers.forEach((subscriber) => {
			if (currentToastId) {
				subscriber.onToastHide(currentToastId);
			}
		});
	}

	/**
	 * Remove a specific toast from the queue
	 */
	remove(toastId: string): boolean {
		const index = this.queue.findIndex((toast) => toast.id === toastId);
		if (index !== -1) {
			this.queue.splice(index, 1);
			return true;
		}
		return false;
	}

	/**
	 * Subscribe to toast events
	 */
	subscribe(subscriber: ToastQueueSubscriber): () => void {
		this.subscribers.add(subscriber);
		return () => {
			this.subscribers.delete(subscriber);
		};
	}

	/**
	 * Get current queue status
	 */
	getStatus(): {
		queueLength: number;
		isShowing: boolean;
		currentToastId: string | null;
	} {
		return {
			queueLength: this.queue.length,
			isShowing: this.isShowing,
			currentToastId: this.currentToastId,
		};
	}

	private processQueue(): void {
		if (this.isShowing || this.queue.length === 0) {
			return;
		}

		this.isShowing = true;
		const toast = this.queue.shift()!;
		this.currentToastId = toast.id;

		// Notify subscribers that a toast should be shown
		this.subscribers.forEach((subscriber) => {
			subscriber.onToastShow(toast);
		});

		// Schedule the next toast after this one completes
		setTimeout(
			() => {
				this.isShowing = false;
				this.currentToastId = null;

				// Notify subscribers that the toast has been hidden
				this.subscribers.forEach((subscriber) => {
					subscriber.onToastHide(toast.id);
				});

				// Process the next toast in the queue
				this.processQueue();
			},
			(toast.duration ?? 3000) + 300
		); // Add 300ms for animation duration
	}

	private generateId(): string {
		return `toast_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
	}
}
