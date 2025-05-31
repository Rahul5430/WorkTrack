import React, { useMemo } from 'react';

import { WORK_STATUS } from '../../constants/workStatus';
import { MarkedDayStatus } from '../../types/calendar';
import CalendarDay from './CalendarDay';

type CalendarDayWrapperProps = {
	date?: {
		dateString: string;
		day: number;
	};
	onPress?: (date: string) => void;
	markedDays: Record<string, MarkedDayStatus>;
	currentVisibleMonth: Date;
};

const CalendarDayWrapper = React.memo(
	({
		date,
		onPress,
		markedDays,
		currentVisibleMonth,
	}: CalendarDayWrapperProps) => {
		// Early return if no date
		if (!date) return null;

		// Memoize all computed values
		const { isToday, type, isCurrentMonth } = useMemo(() => {
			const today = new Date();
			const currentDate = new Date(date.dateString);
			const isToday = currentDate.toDateString() === today.toDateString();
			const isWeekendDay =
				currentDate.getDay() === 0 || currentDate.getDay() === 6;
			const type = isWeekendDay ? WORK_STATUS.HOLIDAY : undefined;
			const isCurrentMonth =
				currentDate.getMonth() === currentVisibleMonth.getMonth() &&
				currentDate.getFullYear() === currentVisibleMonth.getFullYear();

			return { isToday, isWeekendDay, type, isCurrentMonth };
		}, [date.dateString, currentVisibleMonth]);

		// Memoize the marked day data
		const markedDay = useMemo(
			() => markedDays[date.dateString],
			[markedDays, date.dateString]
		);

		// Memoize the press handler
		const handlePress = useMemo(
			() => () => {
				if (onPress) {
					onPress(date.dateString);
				}
			},
			[onPress, date.dateString]
		);

		return (
			<CalendarDay
				day={date.day}
				dateString={date.dateString}
				onPress={handlePress}
				type={markedDay || type}
				isToday={isToday}
				isCurrentMonth={isCurrentMonth}
			/>
		);
	},
	(prevProps, nextProps) => {
		// Only re-render if these props change
		return (
			prevProps.date?.dateString === nextProps.date?.dateString &&
			prevProps.markedDays[prevProps.date?.dateString || ''] ===
				nextProps.markedDays[nextProps.date?.dateString || ''] &&
			prevProps.currentVisibleMonth.getTime() ===
				nextProps.currentVisibleMonth.getTime()
		);
	}
);

CalendarDayWrapper.displayName = 'CalendarDayWrapper';

export default CalendarDayWrapper;
