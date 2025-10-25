import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';

import { useResponsiveLayout } from '@/hooks/useResponsive';
import { RootState } from '@/store';

import CustomCalendar from './CustomCalendar';

type CalendarComponentProps = {
	onDatePress?: (date: string) => void;
	onMonthChange?: (date: Date) => void;
};

const CalendarComponent = React.memo(
	({ onDatePress, onMonthChange }: CalendarComponentProps) => {
		const { getResponsiveSize } = useResponsiveLayout();
		const { data: markedDays } = useSelector(
			(state: RootState) => state.workTrack
		);
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
		const transformedMarkedDays = markedDays.reduce(
			(acc, day) => ({
				...acc,
				[day.date]: {
					status: day.status,
					isAdvisory: day.isAdvisory ?? false,
				},
			}),
			{}
		);

		return (
			<View style={{ paddingHorizontal: getResponsiveSize(5).width }}>
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

CalendarComponent.displayName = 'Calendar';

export default CalendarComponent;
