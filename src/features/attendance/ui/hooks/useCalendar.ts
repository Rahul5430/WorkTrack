import { useCallback, useState } from 'react';

export const useCalendar = () => {
	const [selectedDate, setSelectedDate] = useState<string | null>(null);
	const [selectedMonth, setSelectedMonth] = useState(new Date());

	const onDatePress = useCallback((date: string) => {
		setSelectedDate(date);
	}, []);

	const onMonthChange = useCallback((date: Date) => {
		setSelectedMonth(date);
	}, []);

	const clearSelection = useCallback(() => {
		setSelectedDate(null);
	}, []);

	return {
		selectedDate,
		selectedMonth,
		onDatePress,
		onMonthChange,
		clearSelection,
	};
};
