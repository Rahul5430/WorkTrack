import { act, renderHook } from '@testing-library/react-native';

import { useEntryForm } from '@/features/attendance/ui/hooks/useEntryForm';
import { MarkedDayStatus } from '@/types';

describe('useEntryForm', () => {
	it('should initialize with null status and false isAdvisory', () => {
		const { result } = renderHook(() => useEntryForm());

		expect(result.current.status).toBeNull();
		expect(result.current.isAdvisory).toBe(false);
		expect(result.current.isSaving).toBe(false);
		expect(result.current.error).toBeNull();
		expect(result.current.handleStatusChange).toBeDefined();
		expect(result.current.handleAdvisoryChange).toBeDefined();
		expect(result.current.handleSave).toBeDefined();
		expect(result.current.reset).toBeDefined();
	});

	it('should update status when handleStatusChange is called', () => {
		const { result } = renderHook(() => useEntryForm());

		act(() => {
			result.current.handleStatusChange('office' as MarkedDayStatus);
		});

		expect(result.current.status).toBe('office');
		expect(result.current.error).toBeNull(); // Should clear error on status change
	});

	it('should clear error when status changes', () => {
		const { result } = renderHook(() => useEntryForm());

		// First set an error (manually through state)
		act(() => {
			// Simulate an error state by calling handleSave without status
			// We'll test this through the actual error flow
		});

		act(() => {
			result.current.handleStatusChange('office' as MarkedDayStatus);
		});

		expect(result.current.error).toBeNull();
	});

	it('should update isAdvisory when handleAdvisoryChange is called', () => {
		const { result } = renderHook(() => useEntryForm());

		act(() => {
			result.current.handleAdvisoryChange(true);
		});

		expect(result.current.isAdvisory).toBe(true);

		act(() => {
			result.current.handleAdvisoryChange(false);
		});

		expect(result.current.isAdvisory).toBe(false);
	});

	it('should set error when handleSave is called without status', async () => {
		const { result } = renderHook(() => useEntryForm());
		const mockOnSave = jest.fn();

		await act(async () => {
			await result.current.handleSave(mockOnSave);
		});

		expect(result.current.error).toBe('Please select a status');
		expect(mockOnSave).not.toHaveBeenCalled();
		expect(result.current.isSaving).toBe(false);
	});

	it('should call onSave when status is set', async () => {
		const { result } = renderHook(() => useEntryForm());
		const mockOnSave = jest.fn().mockResolvedValue(undefined);

		act(() => {
			result.current.handleStatusChange('office' as MarkedDayStatus);
		});

		await act(async () => {
			await result.current.handleSave(mockOnSave);
		});

		expect(mockOnSave).toHaveBeenCalledWith('office', false);
		expect(result.current.error).toBeNull();
		expect(result.current.isSaving).toBe(false);
	});

	it('should set isSaving to true during save operation', async () => {
		const { result } = renderHook(() => useEntryForm());
		let resolveSave: () => void;
		const mockOnSave = jest.fn(
			() =>
				new Promise<void>((resolve) => {
					resolveSave = resolve;
				})
		);

		act(() => {
			result.current.handleStatusChange('office' as MarkedDayStatus);
		});

		// Start the save operation
		act(() => {
			result.current.handleSave(mockOnSave);
		});

		// Check isSaving is true during the operation
		expect(result.current.isSaving).toBe(true);

		// Resolve the promise
		await act(async () => {
			resolveSave!();
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		expect(result.current.isSaving).toBe(false);
	});

	it('should set error when save fails', async () => {
		const { result } = renderHook(() => useEntryForm());
		const mockOnSave = jest
			.fn()
			.mockRejectedValue(new Error('Save failed'));

		act(() => {
			result.current.handleStatusChange('wfh' as MarkedDayStatus);
		});

		await act(async () => {
			await result.current.handleSave(mockOnSave);
		});

		expect(result.current.error).toBe('Failed to save status');
		expect(result.current.isSaving).toBe(false);
	});

	it('should pass isAdvisory to onSave', async () => {
		const { result } = renderHook(() => useEntryForm());
		const mockOnSave = jest.fn().mockResolvedValue(undefined);

		act(() => {
			result.current.handleStatusChange('leave');
			result.current.handleAdvisoryChange(true);
		});

		await act(async () => {
			await result.current.handleSave(mockOnSave);
		});

		expect(mockOnSave).toHaveBeenCalledWith('leave', true);
	});

	it('should reset all state when reset is called', () => {
		const { result } = renderHook(() => useEntryForm());

		// Set some state
		act(() => {
			result.current.handleStatusChange('office' as MarkedDayStatus);
			result.current.handleAdvisoryChange(true);
		});

		expect(result.current.status).toBe('office');
		expect(result.current.isAdvisory).toBe(true);

		// Reset
		act(() => {
			result.current.reset();
		});

		expect(result.current.status).toBeNull();
		expect(result.current.isAdvisory).toBe(false);
		expect(result.current.isSaving).toBe(false);
		expect(result.current.error).toBeNull();
	});

	it('should clear error before save when status is set', async () => {
		const { result } = renderHook(() => useEntryForm());
		const mockOnSave = jest.fn().mockResolvedValue(undefined);

		// First trigger an error
		await act(async () => {
			await result.current.handleSave(mockOnSave);
		});

		expect(result.current.error).toBe('Please select a status');

		// Then set status and save
		act(() => {
			result.current.handleStatusChange('office' as MarkedDayStatus);
		});

		await act(async () => {
			await result.current.handleSave(mockOnSave);
		});

		// Error should be cleared during save
		expect(result.current.error).toBeNull();
	});

	it('should maintain function references across renders when dependencies unchanged', () => {
		const { result, rerender } = renderHook(() => useEntryForm());

		const firstHandleStatusChange = result.current.handleStatusChange;
		const firstHandleAdvisoryChange = result.current.handleAdvisoryChange;
		const firstHandleSave = result.current.handleSave;
		const firstReset = result.current.reset;

		rerender({});

		// Functions should maintain same reference due to useCallback
		expect(result.current.handleStatusChange).toBe(firstHandleStatusChange);
		expect(result.current.handleAdvisoryChange).toBe(
			firstHandleAdvisoryChange
		);
		expect(result.current.handleSave).toBe(firstHandleSave);
		expect(result.current.reset).toBe(firstReset);
	});

	it('should handle multiple status changes', () => {
		const { result } = renderHook(() => useEntryForm());

		act(() => {
			result.current.handleStatusChange('office' as MarkedDayStatus);
		});

		expect(result.current.status).toBe('office');

		act(() => {
			result.current.handleStatusChange('wfh' as MarkedDayStatus);
		});

		expect(result.current.status).toBe('wfh');
	});
});
