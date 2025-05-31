import React, { useCallback, useState } from 'react';
import { View } from 'react-native';

import { useCalendarData } from '../../hooks/useCalendarData';
import { useResponsiveLayout } from '../../hooks/useResponsive';
import CustomCalendar from './CustomCalendar';
import SyncStatus from './SyncStatus';

type CalendarComponentProps = {
	onDatePress?: (date: string) => void;
	onMonthChange?: (date: Date) => void;
};

const CalendarComponent = React.memo(
	({ onDatePress, onMonthChange }: CalendarComponentProps) => {
		const { getResponsiveSize } = useResponsiveLayout();
		const { syncStatus, markedDays } = useCalendarData();
		const [currentMonth, setCurrentMonth] = useState(new Date());

		const handlePressDate = useCallback(
			(date: string) => {
				if (onDatePress) {
					onDatePress(date);
				}
			},
			[onDatePress]
		);

		const handleMonthChange = useCallback(
			(date: Date) => {
				setCurrentMonth(date);
				if (onMonthChange) {
					onMonthChange(date);
				}
			},
			[onMonthChange]
		);

		// Transform markedDays to match the expected format
		const transformedMarkedDays = Object.entries(markedDays).reduce(
			(acc, [date, day]) => ({
				...acc,
				[date]: {
					status: day.status,
					isAdvisory: day.isAdvisory ?? false,
				},
			}),
			{}
		);

		return (
			<View style={{ paddingHorizontal: getResponsiveSize(5).width }}>
				<SyncStatus status={syncStatus} />
				<CustomCalendar
					currentMonth={currentMonth}
					markedDays={transformedMarkedDays}
					onDayPress={handlePressDate}
					onMonthChange={handleMonthChange}
				/>
			</View>
		);
	},
	(prevProps, nextProps) => {
		return (
			prevProps.onDatePress === nextProps.onDatePress &&
			prevProps.onMonthChange === nextProps.onMonthChange
		);
	}
);

export default CalendarComponent;
