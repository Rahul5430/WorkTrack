import { act, renderHook } from '@testing-library/react-native';

import { useToast } from '@/shared/ui/hooks/useToast';
import ToastQueueService from '@/shared/utils/toast/ToastQueueService';

describe('useToast', () => {
	let toastService: ToastQueueService;

	beforeEach(() => {
		jest.useFakeTimers();
		// Get fresh instance for each test
		toastService = ToastQueueService.getInstance();
		toastService.clear();
	});

	afterEach(() => {
		jest.useRealTimers();
		toastService.clear();
	});

	it('should return all required functions', () => {
		const { result } = renderHook(() => useToast());

		expect(result.current.show).toBeDefined();
		expect(result.current.showMultiple).toBeDefined();
		expect(result.current.clear).toBeDefined();
		expect(result.current.remove).toBeDefined();
		expect(result.current.getStatus).toBeDefined();
	});

	it('should show a toast with default parameters', () => {
		const { result } = renderHook(() => useToast());

		let toastId: string = '';
		act(() => {
			toastId = result.current.show('Test message');
		});

		expect(toastId).toBeDefined();
		expect(typeof toastId).toBe('string');
	});

	it('should show a toast with custom parameters', () => {
		const { result } = renderHook(() => useToast());

		let toastId: string = '';
		act(() => {
			toastId = result.current.show(
				'Error message',
				'error',
				5000,
				'top'
			);
		});

		expect(toastId).toBeDefined();
		expect(typeof toastId).toBe('string');
	});

	it('should show multiple toasts', () => {
		const { result } = renderHook(() => useToast());

		let toastIds: string[];
		act(() => {
			toastIds = result.current.showMultiple([
				{ message: 'Message 1', type: 'info' },
				{ message: 'Message 2', type: 'success' },
			]);
		});

		expect(toastIds!).toHaveLength(2);
		toastIds!.forEach((id) => {
			expect(id).toBeDefined();
			expect(typeof id).toBe('string');
		});
	});

	it('should clear all toasts', () => {
		const { result } = renderHook(() => useToast());

		act(() => {
			result.current.show('Message 1');
			result.current.show('Message 2');
		});

		act(() => {
			result.current.clear();
		});

		const status = toastService.getStatus();
		expect(status.queueLength).toBe(0);
	});

	it('should remove a specific toast', () => {
		const { result } = renderHook(() => useToast());

		let secondToastId: string = '';
		act(() => {
			result.current.show('Message 1');
			secondToastId = result.current.show('Message 2');
		});

		let removed: boolean = false;
		act(() => {
			// The first toast may have already been processed and showing
			// So we try to remove the second one which should still be in queue
			removed = result.current.remove(secondToastId);
		});

		expect(removed).toBe(true);
	});

	it('should return false when removing non-existent toast', () => {
		const { result } = renderHook(() => useToast());

		let removed: boolean = false;
		act(() => {
			removed = result.current.remove('non-existent-id');
		});

		expect(removed).toBe(false);
	});

	it('should get toast status', () => {
		const { result } = renderHook(() => useToast());

		let status;
		act(() => {
			status = result.current.getStatus();
		});

		expect(status).toHaveProperty('queueLength');
		expect(status).toHaveProperty('isShowing');
		expect(status).toHaveProperty('currentToastId');
	});

	it('should maintain function references across renders', () => {
		const { result, rerender } = renderHook(() => useToast());

		const firstShow = result.current.show;
		const firstClear = result.current.clear;

		rerender({});

		expect(result.current.show).toBe(firstShow);
		expect(result.current.clear).toBe(firstClear);
	});
});
