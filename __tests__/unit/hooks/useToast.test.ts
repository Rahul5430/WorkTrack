import { act, renderHook } from '@testing-library/react-native';

import { ToastType } from '../../../src/components/ui/Toast';
import { useToast } from '../../../src/hooks/useToast';

// Mock ToastQueueService
const mockToastQueueService = {
	show: jest.fn(),
	showMultiple: jest.fn(),
	clear: jest.fn(),
	remove: jest.fn(),
	getStatus: jest.fn(),
};

jest.mock('../../../src/services', () => ({
	ToastQueueService: {
		getInstance: jest.fn(),
	},
}));

const mockGetInstance = require('../../../src/services').ToastQueueService
	.getInstance;

describe('useToast', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockGetInstance.mockReturnValue(mockToastQueueService);
	});

	it('should return all toast methods', () => {
		const { result } = renderHook(() => useToast());

		expect(result.current.show).toBeInstanceOf(Function);
		expect(result.current.showMultiple).toBeInstanceOf(Function);
		expect(result.current.clear).toBeInstanceOf(Function);
		expect(result.current.remove).toBeInstanceOf(Function);
		expect(result.current.getStatus).toBeInstanceOf(Function);
	});

	it('should call ToastQueueService.show with default parameters', () => {
		const { result } = renderHook(() => useToast());

		act(() => {
			result.current.show('Test message');
		});

		expect(mockToastQueueService.show).toHaveBeenCalledWith(
			'Test message',
			'info',
			3000,
			'bottom'
		);
	});

	it('should call ToastQueueService.show with custom parameters', () => {
		const { result } = renderHook(() => useToast());

		act(() => {
			result.current.show('Error message', 'error', 5000, 'top');
		});

		expect(mockToastQueueService.show).toHaveBeenCalledWith(
			'Error message',
			'error',
			5000,
			'top'
		);
	});

	it('should call ToastQueueService.showMultiple', () => {
		const { result } = renderHook(() => useToast());

		const toasts = [
			{
				message: 'Message 1',
				type: 'info' as ToastType,
				duration: 3000,
				position: 'bottom' as const,
			},
			{
				message: 'Message 2',
				type: 'error' as ToastType,
				duration: 5000,
				position: 'top' as const,
			},
		];

		act(() => {
			result.current.showMultiple(toasts);
		});

		expect(mockToastQueueService.showMultiple).toHaveBeenCalledWith(toasts);
	});

	it('should call ToastQueueService.clear', () => {
		const { result } = renderHook(() => useToast());

		act(() => {
			result.current.clear();
		});

		expect(mockToastQueueService.clear).toHaveBeenCalled();
	});

	it('should call ToastQueueService.remove', () => {
		const { result } = renderHook(() => useToast());

		act(() => {
			result.current.remove('toast-123');
		});

		expect(mockToastQueueService.remove).toHaveBeenCalledWith('toast-123');
	});

	it('should call ToastQueueService.getStatus', () => {
		const { result } = renderHook(() => useToast());

		const mockStatus = { isVisible: true, count: 2 };
		mockToastQueueService.getStatus.mockReturnValue(mockStatus);

		let status;
		act(() => {
			status = result.current.getStatus();
		});

		expect(mockToastQueueService.getStatus).toHaveBeenCalled();
		expect(status).toBe(mockStatus);
	});

	it('should handle different toast types', () => {
		const { result } = renderHook(() => useToast());

		const types: ToastType[] = ['info', 'success', 'error'];

		types.forEach((type) => {
			act(() => {
				result.current.show(`${type} message`, type);
			});

			expect(mockToastQueueService.show).toHaveBeenCalledWith(
				`${type} message`,
				type,
				3000,
				'bottom'
			);
		});
	});

	it('should handle different positions', () => {
		const { result } = renderHook(() => useToast());

		const positions = ['top', 'bottom'] as const;

		positions.forEach((position) => {
			act(() => {
				result.current.show('Position test', 'info', 3000, position);
			});

			expect(mockToastQueueService.show).toHaveBeenCalledWith(
				'Position test',
				'info',
				3000,
				position
			);
		});
	});

	it('should handle different durations', () => {
		const { result } = renderHook(() => useToast());

		const durations = [1000, 2000, 3000, 5000];

		durations.forEach((duration) => {
			act(() => {
				result.current.show('Duration test', 'info', duration);
			});

			expect(mockToastQueueService.show).toHaveBeenCalledWith(
				'Duration test',
				'info',
				duration,
				'bottom'
			);
		});
	});

	it('should maintain stable references across renders', () => {
		const { result, rerender } = renderHook(() => useToast());

		const firstRender = {
			show: result.current.show,
			showMultiple: result.current.showMultiple,
			clear: result.current.clear,
			remove: result.current.remove,
			getStatus: result.current.getStatus,
		};

		rerender({});

		expect(result.current.show).toBe(firstRender.show);
		expect(result.current.showMultiple).toBe(firstRender.showMultiple);
		expect(result.current.clear).toBe(firstRender.clear);
		expect(result.current.remove).toBe(firstRender.remove);
		expect(result.current.getStatus).toBe(firstRender.getStatus);
	});
});
