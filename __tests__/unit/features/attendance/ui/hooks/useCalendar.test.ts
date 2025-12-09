import { act, renderHook } from '@testing-library/react-native';

import { useCalendar } from '@/features/attendance/ui/hooks/useCalendar';

describe('useCalendar', () => {
	it('should initialize with null selectedDate and current month', () => {
		const { result } = renderHook(() => useCalendar());

		expect(result.current.selectedDate).toBeNull();
		expect(result.current.selectedMonth).toBeInstanceOf(Date);
		expect(result.current.onDatePress).toBeDefined();
		expect(result.current.onMonthChange).toBeDefined();
		expect(result.current.clearSelection).toBeDefined();
	});

	it('should update selectedDate when onDatePress is called', () => {
		const { result } = renderHook(() => useCalendar());
		const date = '2024-01-15';

		act(() => {
			result.current.onDatePress(date);
		});

		expect(result.current.selectedDate).toBe(date);
	});

	it('should update selectedMonth when onMonthChange is called', () => {
		const { result } = renderHook(() => useCalendar());
		const newMonth = new Date('2024-02-01');

		act(() => {
			result.current.onMonthChange(newMonth);
		});

		expect(result.current.selectedMonth).toEqual(newMonth);
	});

	it('should clear selectedDate when clearSelection is called', () => {
		const { result } = renderHook(() => useCalendar());

		// First set a date
		act(() => {
			result.current.onDatePress('2024-01-15');
		});

		expect(result.current.selectedDate).toBe('2024-01-15');

		// Then clear it
		act(() => {
			result.current.clearSelection();
		});

		expect(result.current.selectedDate).toBeNull();
	});

	it('should handle multiple date selections', () => {
		const { result } = renderHook(() => useCalendar());

		act(() => {
			result.current.onDatePress('2024-01-15');
		});

		expect(result.current.selectedDate).toBe('2024-01-15');

		act(() => {
			result.current.onDatePress('2024-01-20');
		});

		expect(result.current.selectedDate).toBe('2024-01-20');
	});

	it('should handle multiple month changes', () => {
		const { result } = renderHook(() => useCalendar());
		const month1 = new Date('2024-02-01');
		const month2 = new Date('2024-03-01');

		act(() => {
			result.current.onMonthChange(month1);
		});

		expect(result.current.selectedMonth).toEqual(month1);

		act(() => {
			result.current.onMonthChange(month2);
		});

		expect(result.current.selectedMonth).toEqual(month2);
	});

	it('should maintain function references across renders', () => {
		const { result, rerender } = renderHook(() => useCalendar());

		const firstOnDatePress = result.current.onDatePress;
		const firstOnMonthChange = result.current.onMonthChange;
		const firstClearSelection = result.current.clearSelection;

		rerender({});

		// Functions should maintain same reference due to useCallback
		expect(result.current.onDatePress).toBe(firstOnDatePress);
		expect(result.current.onMonthChange).toBe(firstOnMonthChange);
		expect(result.current.clearSelection).toBe(firstClearSelection);
	});

	it('should clear selection and maintain month', () => {
		const { result } = renderHook(() => useCalendar());
		const month = new Date('2024-02-01');

		act(() => {
			result.current.onMonthChange(month);
			result.current.onDatePress('2024-02-15');
		});

		expect(result.current.selectedDate).toBe('2024-02-15');
		expect(result.current.selectedMonth).toEqual(month);

		act(() => {
			result.current.clearSelection();
		});

		expect(result.current.selectedDate).toBeNull();
		expect(result.current.selectedMonth).toEqual(month); // Month should remain unchanged
	});
});
