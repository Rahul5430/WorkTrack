import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';

import { RootState } from '@/app/store';
import { useResponsiveLayout } from '@/shared/ui/hooks/useResponsive';
import { type MarkedDay } from '@/types';

import CustomCalendar from './CustomCalendar';

type CalendarComponentProps = {
	onDatePress?: (date: string) => void;
	onMonthChange?: (date: Date) => void;
};

const CalendarComponent = React.memo(
	({ onDatePress, onMonthChange }: CalendarComponentProps) => {
		const { getResponsiveSize } = useResponsiveLayout();
		const workTrackState = useSelector(
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

		// Memoize transformed markedDays to prevent unnecessary re-renders
		// Move conditional logic inside useMemo to fix lint warning
		const transformedMarkedDays = useMemo(() => {
			const markedDays = Array.isArray(workTrackState?.data)
				? (workTrackState.data as MarkedDay[])
				: [];
			return markedDays.reduce<
				Record<
					string,
					{ status: MarkedDay['status']; isAdvisory: boolean }
				>
			>((accumulator, day) => {
				accumulator[day.date] = {
					status: day.status,
					isAdvisory: Boolean(day.isAdvisory),
				};
				return accumulator;
			}, {});
		}, [workTrackState?.data]);

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
