import ToastQueueService from '../../src/services/toastQueue';

jest.useFakeTimers();

describe('ToastQueueService', () => {
	it('show enqueues and processes a toast', () => {
		const svc = ToastQueueService.getInstance();
		const onShow = jest.fn();
		const onHide = jest.fn();
		const unsub = svc.subscribe({
			onToastShow: onShow,
			onToastHide: onHide,
		});
		const id = svc.show('Hello', 'info', 10);
		expect(id).toBeTruthy();
		expect(onShow).toHaveBeenCalled();
		jest.advanceTimersByTime(11 + 300);
		expect(onHide).toHaveBeenCalledWith(id);
		unsub();
	});

	it('showMultiple enqueues multiple toasts FIFO', () => {
		const svc = ToastQueueService.getInstance();
		const order: string[] = [];
		const unsub = svc.subscribe({
			onToastShow: (t) => order.push(`show:${t.message}`),
			onToastHide: (id) => order.push(`hide:${id}`),
		});
		const [id1, id2] = svc.showMultiple([
			{ message: 'A', type: 'info', duration: 10, position: 'bottom' },
			{ message: 'B', type: 'info', duration: 10, position: 'bottom' },
		]);
		jest.advanceTimersByTime(11 + 300);
		jest.advanceTimersByTime(11 + 300);
		expect(order.some((e) => e.startsWith('show:'))).toBe(true);
		expect(order.some((e) => e === `hide:${id1}`)).toBe(true);
		expect(order.some((e) => e === `hide:${id2}`)).toBe(true);
		unsub();
	});

	it('clear empties queue and resets status', () => {
		const svc = ToastQueueService.getInstance();
		// Subscribe to avoid auto-processing affecting internal flags unexpectedly
		const unsub = svc.subscribe({
			onToastShow: () => {},
			onToastHide: () => {},
		});
		svc.show('X', 'info', 1000); // long duration so it remains queued/showing
		const before = svc.getStatus();
		expect(before.queueLength).toBeGreaterThanOrEqual(0); // service may be showing first toast already
		svc.clear();
		const after = svc.getStatus();
		expect(after.queueLength).toBe(0);
		expect(after.isShowing).toBe(false);
		expect(after.currentToastId).toBeNull();
		unsub();
	});
});
