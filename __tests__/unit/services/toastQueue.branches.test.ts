import { ToastType } from '../../../src/components/ui/Toast';
import ToastQueueService from '../../../src/services/toastQueue';

describe('ToastQueueService - branch coverage', () => {
	let toastQueue: ToastQueueService;

	beforeEach(() => {
		jest.useFakeTimers();
		toastQueue = ToastQueueService.getInstance();
		toastQueue.clear();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	describe('show', () => {
		it('adds toast to queue and processes if not already showing', () => {
			const mockSubscriber = {
				onToastShow: jest.fn(),
				onToastHide: jest.fn(),
			};
			toastQueue.subscribe(mockSubscriber);

			const id = toastQueue.show('Test message', 'success', 3000, 'top');

			expect(id).toBeDefined();
			expect(mockSubscriber.onToastShow).toHaveBeenCalledWith(
				expect.objectContaining({
					message: 'Test message',
					type: 'success',
					duration: 3000,
					position: 'top',
				})
			);
		});

		it('adds toast to queue without processing if already showing', () => {
			const mockSubscriber = {
				onToastShow: jest.fn(),
				onToastHide: jest.fn(),
			};
			toastQueue.subscribe(mockSubscriber);

			// Start showing first toast
			toastQueue.show('First message', 'info');
			expect(mockSubscriber.onToastShow).toHaveBeenCalledTimes(1);

			// Add second toast while first is showing
			toastQueue.show('Second message', 'error');
			expect(mockSubscriber.onToastShow).toHaveBeenCalledTimes(1);
		});
	});

	describe('showMultiple', () => {
		it('adds multiple toasts to queue', () => {
			const toasts = [
				{ message: 'Message 1', type: 'info' as ToastType },
				{ message: 'Message 2', type: 'success' as ToastType },
			];

			const ids = toastQueue.showMultiple(toasts);
			expect(ids).toHaveLength(2);
			expect(ids[0]).toBeDefined();
			expect(ids[1]).toBeDefined();
		});
	});

	describe('remove', () => {
		it('removes toast from queue by id', () => {
			// Add toast manually to queue without processing
			const toast = {
				id: 'test-id',
				message: 'Test message',
				type: 'info' as const,
				duration: 3000,
				position: 'top' as const,
			};
			// @ts-expect-error - accessing private property for testing
			toastQueue.queue.push(toast);

			// Check that toast was added to queue
			expect(toastQueue.getStatus().queueLength).toBe(1);
			// Remove the toast
			const result = toastQueue.remove('test-id');
			expect(result).toBe(true);
			// Check that toast was removed from queue
			expect(toastQueue.getStatus().queueLength).toBe(0);
		});

		it('returns false when toast not found', () => {
			const result = toastQueue.remove('nonexistent');
			expect(result).toBe(false);
		});
	});

	describe('clear', () => {
		it('clears all toasts from queue', () => {
			toastQueue.show('Message 1', 'info');
			toastQueue.show('Message 2', 'error');

			// Advance timers to process the first toast
			jest.advanceTimersByTime(100);

			// Check that first toast was processed and second is in queue
			expect(toastQueue.getStatus().queueLength).toBe(1);

			toastQueue.clear();
			expect(toastQueue.getStatus().queueLength).toBe(0);
			expect(toastQueue.getStatus().isShowing).toBe(false);
			expect(toastQueue.getStatus().currentToastId).toBeNull();
		});

		it('calls onToastHide for current toast when clearing', () => {
			const mockSubscriber = {
				onToastShow: jest.fn(),
				onToastHide: jest.fn(),
			};
			toastQueue.subscribe(mockSubscriber);

			// Show a toast to set currentToastId
			const id = toastQueue.show('Test message', 'info');

			// Clear while toast is showing
			toastQueue.clear();

			// Should call onToastHide with the current toast id
			expect(mockSubscriber.onToastHide).toHaveBeenCalledWith(id);
		});

		it('does not call onToastHide when no current toast', () => {
			const mockSubscriber = {
				onToastShow: jest.fn(),
				onToastHide: jest.fn(),
			};
			toastQueue.subscribe(mockSubscriber);

			// Clear without showing any toast
			toastQueue.clear();

			// Should not call onToastHide
			expect(mockSubscriber.onToastHide).not.toHaveBeenCalled();
		});
	});

	describe('subscribe', () => {
		it('subscribes to toast events and returns unsubscribe function', () => {
			const mockSubscriber = {
				onToastShow: jest.fn(),
				onToastHide: jest.fn(),
			};

			const unsubscribe = toastQueue.subscribe(mockSubscriber);
			expect(typeof unsubscribe).toBe('function');

			toastQueue.show('Test message', 'info');
			expect(mockSubscriber.onToastShow).toHaveBeenCalled();

			unsubscribe();
			// Should not be called after unsubscribe
			const callCount = mockSubscriber.onToastShow.mock.calls.length;
			toastQueue.show('Another message', 'info');
			expect(mockSubscriber.onToastShow).toHaveBeenCalledTimes(callCount);
		});
	});

	describe('getStatus', () => {
		it('returns current queue status', () => {
			const status = toastQueue.getStatus();
			expect(status).toEqual({
				queueLength: 0,
				isShowing: false,
				currentToastId: null,
			});
		});
	});
});
