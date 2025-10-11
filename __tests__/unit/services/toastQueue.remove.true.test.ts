import ToastQueueService from '../../../src/services/toastQueue';

describe('ToastQueueService remove true path', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});
	afterEach(() => {
		jest.useRealTimers();
	});

	it('returns true when removing a pending toast', () => {
		const service = ToastQueueService.getInstance();
		// Start showing the first toast (it will be shifted and scheduled)
		service.show('first', 'info', 10000, 'bottom');
		// Queue a second one which stays in queue while first is showing
		const secondId = service.show('second', 'info', 10000, 'bottom');
		const removed = service.remove(secondId);
		expect(removed).toBe(true);
	});
});
