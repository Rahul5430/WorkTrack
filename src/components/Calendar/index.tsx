import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { CalendarList, CalendarListProps } from 'react-native-calendars';

import { useCalendarData } from '../../hooks/useCalendarData';
import { useResponsiveLayout } from '../../hooks/useResponsive';
import { calendarTheme } from '../../themes';
import CalendarDayWrapper from './CalendarDayWrapper';
import CustomCalendarHeader from './CalendarHeader';
import SyncStatus from './SyncStatus';

type CalendarComponentProps = {
	onDatePress?: (date: string) => void;
	onMonthChange?: (date: Date) => void;
};

const CalendarComponent = React.memo(
	({ onDatePress, onMonthChange }: CalendarComponentProps) => {
		const { getResponsiveSize } = useResponsiveLayout();
		const { syncStatus, markedDays } = useCalendarData();
		const [currentVisibleMonth, setCurrentVisibleMonth] = useState(
			new Date()
		);
		const markedDaysRef = useRef(markedDays);
		markedDaysRef.current = markedDays;

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
				setCurrentVisibleMonth(date);
				if (onMonthChange) {
					onMonthChange(date);
				}
			},
			[onMonthChange]
		);

		const dayComponent = useCallback(
			({ date }: { date?: { dateString: string; day: number } }) => {
				if (!date) return null;
				return (
					<CalendarDayWrapper
						key={date.dateString}
						date={date}
						onPress={handlePressDate}
						markedDays={markedDaysRef.current}
						currentVisibleMonth={currentVisibleMonth}
					/>
				);
			},
			[handlePressDate, currentVisibleMonth]
		);

		const calendarProps = useMemo((): CalendarListProps => {
			return {
				calendarWidth: getResponsiveSize(90).width,
				calendarHeight: getResponsiveSize(90).width,
				horizontal: true,
				pagingEnabled: true,
				staticHeader: true,
				showScrollIndicator: false,
				hideArrows: true,
				customHeader: CustomCalendarHeader,
				monthFormat: 'MMMM yyyy',
				headerStyle: { display: 'none' as const },
				markingType: 'custom' as const,
				theme: calendarTheme,
				onDayPress: ({ dateString }: { dateString: string }) =>
					handlePressDate(dateString),
				onVisibleMonthsChange: (months) => {
					if (months.length > 0) {
						const [month] = months;
						const monthDate = new Date(month.timestamp);
						const monthKey = monthDate.toISOString().slice(0, 7); // YYYY-MM format

						// Only load data if we don't already have it
						const hasDataForMonth = Object.keys(
							markedDaysRef.current
						).some((date) => date.startsWith(monthKey));
						if (!hasDataForMonth) {
							handleMonthChange(monthDate);
						}
					}
				},
				dayComponent,
				enableSwipeMonths: true,
				disableAllTouchEventsForDisabledDays: true,
				disableArrowLeft: true,
				disableArrowRight: true,
				initialNumToRender: 1,
				maxToRenderPerBatch: 1,
				windowSize: 3,
				removeClippedSubviews: true,
				// Add these props to optimize rendering
				updateCellsBatchingPeriod: 50,
				viewabilityConfig: {
					minimumViewTime: 0,
					viewAreaCoveragePercentThreshold: 0,
				},
				maintainVisibleContentPosition: {
					minIndexForVisible: 0,
					autoscrollToTopThreshold: 10,
				},
			};
		}, [
			getResponsiveSize,
			handlePressDate,
			handleMonthChange,
			dayComponent,
		]);

		return (
			<View style={{ paddingHorizontal: getResponsiveSize(5).width }}>
				<SyncStatus status={syncStatus} />
				<CalendarList {...calendarProps} />
			</View>
		);
	},
	(prevProps, nextProps) => {
		// Only re-render if onDatePress or onMonthChange changes
		return (
			prevProps.onDatePress === nextProps.onDatePress &&
			prevProps.onMonthChange === nextProps.onMonthChange
		);
	}
);

CalendarComponent.displayName = 'CalendarComponent';

export default CalendarComponent;
