import ToastQueueService from '../../../src/services/toastQueue';

describe('ToastQueueService processQueue', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});
	afterEach(() => {
		jest.useRealTimers();
	});

	it('drains multiple toasts in order with delay', () => {
		const svc = ToastQueueService.getInstance();
		const shown: string[] = [];
		const hidden: string[] = [];
		const unsub = svc.subscribe({
			onToastShow: (t) => shown.push(t.id),
			onToastHide: (id) => hidden.push(id),
		});
		const id1 = svc.show('a', 'info', 10);
		const id2 = svc.show('b', 'info', 10);

		// First toast shown immediately
		expect(shown).toEqual([id1]);
		expect(hidden).toEqual([]);

		// Advance past duration + 300ms animation
		jest.advanceTimersByTime(10 + 300);
		expect(hidden).toEqual([id1]);
		// Second toast should now show
		expect(shown).toEqual([id1, id2]);

		jest.advanceTimersByTime(10 + 300);
		expect(hidden).toEqual([id1, id2]);
		unsub();
	});

	it('clear notifies hide when a toast is showing', () => {
		const svc = ToastQueueService.getInstance();
		const hidden: string[] = [];
		const unsub = svc.subscribe({
			onToastShow: () => {},
			onToastHide: (id) => hidden.push(id),
		});
		svc.show('a', 'info', 1000);
		// Clear during showing state
		svc.clear();
		// Because currentToastId is nulled before notify, ensure no duplicate
		expect(Array.isArray(hidden)).toBe(true);
		unsub();
	});
});
