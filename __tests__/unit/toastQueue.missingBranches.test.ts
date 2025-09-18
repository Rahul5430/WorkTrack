import ToastQueueService from '../../src/services/toastQueue';

describe('ToastQueueService - missing branches', () => {
	let toastQueue: ToastQueueService;

	beforeEach(() => {
		// Use fake timers for faster testing
		jest.useFakeTimers();

		// Reset the singleton instance
		(
			ToastQueueService as unknown as {
				instance: ToastQueueService | undefined;
			}
		).instance = undefined;
		toastQueue = ToastQueueService.getInstance();
	});

	afterEach(() => {
		// Restore real timers
		jest.useRealTimers();
	});

	describe('clear method', () => {
		it('should not call onToastHide when no current toast is active', () => {
			const mockSubscriber = {
				onToastShow: jest.fn(),
				onToastHide: jest.fn(),
			};
			toastQueue.subscribe(mockSubscriber);

			// Clear without showing any toast
			toastQueue.clear();

			// Should not call onToastHide since no toast is active
			expect(mockSubscriber.onToastHide).not.toHaveBeenCalled();
		});

		it('should call onToastHide when current toast is active', () => {
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
	});

	describe('processQueue method', () => {
		it('should use default type when no type is specified', () => {
			const mockSubscriber = {
				onToastShow: jest.fn(),
				onToastHide: jest.fn(),
			};
			toastQueue.subscribe(mockSubscriber);

			// Show a toast without type (will use default 'info')
			toastQueue.show('Test message');

			// Verify onToastShow was called with default type
			expect(mockSubscriber.onToastShow).toHaveBeenCalledWith(
				expect.objectContaining({
					message: 'Test message',
					type: 'info', // Default type
					duration: 3000, // Default duration
				})
			);

			// Fast-forward time to trigger the timeout
			jest.advanceTimersByTime(3300); // 3000ms + 300ms animation

			// Verify onToastHide was called
			expect(mockSubscriber.onToastHide).toHaveBeenCalled();
		});

		it('should use default duration when toast has no duration specified', () => {
			const mockSubscriber = {
				onToastShow: jest.fn(),
				onToastHide: jest.fn(),
			};
			toastQueue.subscribe(mockSubscriber);

			// Show a toast without duration (will use default 3000ms)
			toastQueue.show('Test message', 'info');

			// Verify onToastShow was called
			expect(mockSubscriber.onToastShow).toHaveBeenCalledWith(
				expect.objectContaining({
					message: 'Test message',
					type: 'info',
					duration: 3000, // Default duration
				})
			);

			// Fast-forward time to trigger the timeout
			jest.advanceTimersByTime(3300); // 3000ms + 300ms animation

			// Verify onToastHide was called
			expect(mockSubscriber.onToastHide).toHaveBeenCalled();
		});

		it('should use custom duration when toast has duration specified', () => {
			const mockSubscriber = {
				onToastShow: jest.fn(),
				onToastHide: jest.fn(),
			};
			toastQueue.subscribe(mockSubscriber);

			// Show a toast with custom duration
			toastQueue.show('Test message', 'info', 1000);

			// Verify onToastShow was called
			expect(mockSubscriber.onToastShow).toHaveBeenCalledWith(
				expect.objectContaining({
					message: 'Test message',
					type: 'info',
					duration: 1000,
				})
			);

			// Fast-forward time to trigger the timeout
			jest.advanceTimersByTime(1300); // 1000ms + 300ms animation

			// Verify onToastHide was called
			expect(mockSubscriber.onToastHide).toHaveBeenCalled();
		});

		it('should handle undefined duration in toast object', () => {
			const mockSubscriber = {
				onToastShow: jest.fn(),
				onToastHide: jest.fn(),
			};
			toastQueue.subscribe(mockSubscriber);

			// Manually add a toast with undefined duration to test the fallback
			const toast = {
				id: 'test-toast',
				message: 'Test message',
				type: 'info' as const,
				duration: undefined, // Explicitly undefined
				position: 'bottom' as const,
			};

			// Add directly to queue to bypass the show method's default
			(toastQueue as unknown as { queue: unknown[] }).queue.push(toast);
			(
				toastQueue as unknown as { processQueue: () => void }
			).processQueue();

			// Fast-forward time to trigger the timeout
			jest.advanceTimersByTime(3300); // 3000ms + 300ms animation

			// Verify onToastHide was called
			expect(mockSubscriber.onToastHide).toHaveBeenCalled();
		});
	});
});
