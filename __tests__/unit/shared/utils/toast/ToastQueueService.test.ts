import type { ToastQueueSubscriber } from '@/shared/utils/toast/ToastQueueService';
import ToastQueueService from '@/shared/utils/toast/ToastQueueService';

jest.useFakeTimers();

describe('ToastQueueService', () => {
	let service: ToastQueueService;

	beforeEach(() => {
		service = ToastQueueService.getInstance();
		service.clear();
		jest.clearAllTimers();
	});

	describe('getInstance', () => {
		it('returns singleton instance', () => {
			const instance1 = ToastQueueService.getInstance();
			const instance2 = ToastQueueService.getInstance();

			expect(instance1).toBe(instance2);
		});
	});

	describe('show', () => {
		it('adds toast to queue and returns id', () => {
			const id = service.show('Test message', 'info');

			expect(id).toBeDefined();
			expect(id).toContain('toast_');
			// Toast is immediately processed, so queue is empty but isShowing is true
			const status = service.getStatus();
			expect(status.isShowing).toBe(true);
			expect(status.currentToastId).toBe(id);
		});

		it('uses default type, duration, and position', () => {
			const id = service.show('Test message');

			expect(id).toBeDefined();
			const status = service.getStatus();
			// Toast is immediately processed
			expect(status.isShowing).toBe(true);
			expect(status.currentToastId).toBe(id);
		});

		it('processes queue immediately', () => {
			const subscriber: ToastQueueSubscriber = {
				onToastShow: jest.fn(),
				onToastHide: jest.fn(),
			};

			service.subscribe(subscriber);
			service.show('Test message', 'success', 3000, 'top');

			// Process queue synchronously before checking
			jest.advanceTimersByTime(0);

			expect(subscriber.onToastShow).toHaveBeenCalled();
			expect(service.getStatus().isShowing).toBe(true);
		});
	});

	describe('showMultiple', () => {
		it('adds multiple toasts to queue', () => {
			const ids = service.showMultiple([
				{ message: 'Message 1', type: 'info' },
				{ message: 'Message 2', type: 'error' },
			]);

			expect(ids).toHaveLength(2);
			// First toast is processed, second is in queue
			const status = service.getStatus();
			expect(status.isShowing).toBe(true);
			expect(status.queueLength).toBe(1);
		});

		it('returns array of toast ids', () => {
			const ids = service.showMultiple([
				{ message: 'Message 1', type: 'info' },
			]);

			expect(ids).toHaveLength(1);
			expect(ids[0]).toBeDefined();
		});
	});

	describe('clear', () => {
		it('clears all pending toasts', () => {
			service.show('Message 1');
			service.show('Message 2');

			service.clear();

			expect(service.getStatus().queueLength).toBe(0);
			expect(service.getStatus().isShowing).toBe(false);
		});

		it('notifies subscribers when clearing current toast', () => {
			const subscriber: ToastQueueSubscriber = {
				onToastShow: jest.fn(),
				onToastHide: jest.fn(),
			};

			service.subscribe(subscriber);
			service.show('Test message');

			service.clear();

			expect(subscriber.onToastHide).toHaveBeenCalled();
		});
	});

	describe('remove', () => {
		it('removes toast from queue', () => {
			service.show('Message 1');
			const id2 = service.show('Message 2');

			// First toast is showing, second is in queue
			// Remove the second toast from queue
			const removed = service.remove(id2);
			expect(removed).toBe(true);
			expect(service.getStatus().queueLength).toBe(0);
		});

		it('returns false when toast not found', () => {
			const removed = service.remove('non-existent-id');

			expect(removed).toBe(false);
		});
	});

	describe('subscribe', () => {
		it('subscribes to toast events', () => {
			const subscriber: ToastQueueSubscriber = {
				onToastShow: jest.fn(),
				onToastHide: jest.fn(),
			};

			const unsubscribe = service.subscribe(subscriber);
			service.show('Test message');

			expect(subscriber.onToastShow).toHaveBeenCalled();

			unsubscribe();
			service.clear();
		});

		it('returns unsubscribe function', () => {
			const subscriber: ToastQueueSubscriber = {
				onToastShow: jest.fn(),
				onToastHide: jest.fn(),
			};

			const unsubscribe = service.subscribe(subscriber);
			unsubscribe();

			service.show('Test message');
			expect(subscriber.onToastShow).not.toHaveBeenCalled();
		});
	});

	describe('getStatus', () => {
		it('returns current queue status', () => {
			const status = service.getStatus();

			expect(status).toHaveProperty('queueLength');
			expect(status).toHaveProperty('isShowing');
			expect(status).toHaveProperty('currentToastId');
		});

		it('returns correct status when showing toast', () => {
			service.show('Test message');
			const status = service.getStatus();

			expect(status.isShowing).toBe(true);
			expect(status.currentToastId).toBeDefined();
		});
	});

	describe('queue processing', () => {
		it('processes queue sequentially', () => {
			const subscriber: ToastQueueSubscriber = {
				onToastShow: jest.fn(),
				onToastHide: jest.fn(),
			};

			service.subscribe(subscriber);
			service.show('Message 1', 'info', 1000);
			service.show('Message 2', 'error', 1000);

			expect(subscriber.onToastShow).toHaveBeenCalledTimes(1);
			expect(service.getStatus().queueLength).toBe(1);

			jest.advanceTimersByTime(1300);

			expect(subscriber.onToastShow).toHaveBeenCalledTimes(2);
			expect(subscriber.onToastHide).toHaveBeenCalled();
		});

		it('does not process queue when already showing', () => {
			const subscriber: ToastQueueSubscriber = {
				onToastShow: jest.fn(),
				onToastHide: jest.fn(),
			};

			service.subscribe(subscriber);
			service.show('Message 1');
			service.show('Message 2');

			expect(subscriber.onToastShow).toHaveBeenCalledTimes(1);
		});

		it('handles custom duration', () => {
			const subscriber: ToastQueueSubscriber = {
				onToastShow: jest.fn(),
				onToastHide: jest.fn(),
			};

			service.subscribe(subscriber);
			service.show('Test message', 'info', 5000);

			jest.advanceTimersByTime(5300);

			expect(subscriber.onToastHide).toHaveBeenCalled();
		});
	});
});
