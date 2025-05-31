import React, { useMemo } from 'react';

import { MarkedDayStatus } from '../../types/calendar';
import CalendarDay from './CalendarDay';

type MarkedDayData =
	| MarkedDayStatus
	| { status: MarkedDayStatus; isAdvisory: boolean };

type CalendarDayWrapperProps = {
	date?: {
		dateString: string;
		day: number;
	};
	onPress?: (date: string) => void;
	markedDays: Record<string, MarkedDayData>;
	currentVisibleMonth: Date;
};

const CalendarDayWrapper = React.memo(
	({
		date,
		onPress,
		markedDays,
		currentVisibleMonth,
	}: CalendarDayWrapperProps) => {
		// Memoize all computed values
		const { isToday, type, isCurrentMonth, isAdvisory } = useMemo(() => {
			if (!date) {
				return {
					isToday: false,
					type: undefined,
					isCurrentMonth: false,
					isAdvisory: false,
				};
			}

			const today = new Date();
			const currentDate = new Date(date.dateString);
			const isToday = currentDate.toDateString() === today.toDateString();
			const isCurrentMonth =
				currentDate.getMonth() === currentVisibleMonth.getMonth() &&
				currentDate.getFullYear() === currentVisibleMonth.getFullYear();

			const markedDay = markedDays[date.dateString];
			const isAdvisory =
				typeof markedDay === 'object' ? markedDay.isAdvisory : false;
			const status =
				typeof markedDay === 'object' ? markedDay.status : markedDay;

			return {
				isToday,
				type: status,
				isCurrentMonth,
				isAdvisory,
			};
		}, [date, currentVisibleMonth, markedDays]);

		// Memoize the press handler
		const handlePress = useMemo(
			() => () => {
				if (onPress && date) {
					onPress(date.dateString);
				}
			},
			[onPress, date]
		);

		// Early return if no date
		if (!date) return null;

		return (
			<CalendarDay
				day={date.day}
				dateString={date.dateString}
				onPress={handlePress}
				type={type}
				isToday={isToday}
				isCurrentMonth={isCurrentMonth}
				isAdvisory={isAdvisory}
			/>
		);
	},
	(prevProps, nextProps) => {
		// Only re-render if these props change
		const prevMarkedDay =
			prevProps.markedDays[prevProps.date?.dateString ?? ''];
		const nextMarkedDay =
			nextProps.markedDays[nextProps.date?.dateString ?? ''];

		return (
			prevProps.date?.dateString === nextProps.date?.dateString &&
			(prevMarkedDay === nextMarkedDay ||
				(typeof prevMarkedDay === 'object' &&
					typeof nextMarkedDay === 'object' &&
					prevMarkedDay.status === nextMarkedDay.status &&
					prevMarkedDay.isAdvisory === nextMarkedDay.isAdvisory)) &&
			prevProps.currentVisibleMonth.getTime() ===
				nextProps.currentVisibleMonth.getTime()
		);
	}
);

CalendarDayWrapper.displayName = 'CalendarDayWrapper';

export default CalendarDayWrapper;
