import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
	Dimensions,
	FlatList,
	StyleSheet,
	View,
	ViewToken,
} from 'react-native';

import { useResponsiveLayout } from '@/shared/ui/hooks/useResponsive';
import { colors } from '@/shared/ui/theme';
import { MarkedDayStatus } from '@/types';

import CalendarHeader from './CalendarHeader';
import MonthCalendar from './MonthCalendar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = 80; // Height for month header and week days
const BOTTOM_PADDING = 5; // Reduced from 10 to 5 for less empty space at bottom

type CustomCalendarProps = {
	currentMonth: Date;
	markedDays: {
		[key: string]: { status: MarkedDayStatus; isAdvisory: boolean };
	};
	onDayPress: (date: string) => void;
	onMonthChange: (date: Date) => void;
};

const CustomCalendar: React.FC<CustomCalendarProps> = ({
	currentMonth,
	markedDays,
	onDayPress,
	onMonthChange,
}) => {
	const { getResponsiveMargin } = useResponsiveLayout();
	const containerMargin = 20; // 10px on each side from marginHorizontal: 10
	const calendarWidth = SCREEN_WIDTH - containerMargin;
	const horizontalPadding = getResponsiveMargin(3); // Reduced to 3% to prevent wrapping
	const daySize = (calendarWidth - horizontalPadding * 2) / 7;
	const weekHeight = daySize + 2; // Reduced from +5 to +2 for even tighter spacing

	const flatListRef = useRef<FlatList>(null);
	const [visibleMonths, setVisibleMonths] = useState<Date[]>([]);
	const [isInitialLoad, setIsInitialLoad] = useState(true);
	const initialLoadDone = useRef(false);
	const initialDataLoadDone = useRef(false);
	const [currentVisibleMonth, setCurrentVisibleMonth] =
		useState(currentMonth);
	const isMonthChangeInProgress = useRef(false);

	const generateMonths = useCallback(() => {
		const months = [];
		const today = new Date();
		const currentYear = today.getFullYear();
		const todayMonth = today.getMonth();

		// Generate 12 months before and 12 months after current month
		for (let i = -12; i <= 12; i++) {
			const date = new Date(currentYear, todayMonth + i, 1);
			months.push(date);
		}
		return months;
	}, []);

	// Initial setup
	useEffect(() => {
		if (!initialLoadDone.current) {
			const months = generateMonths();
			setVisibleMonths(months.slice(11, 14)); // Index 12 is current month
			initialLoadDone.current = true;
			setIsInitialLoad(false);
		} else {
			// Reset initialLoadDone when generateMonths changes
			initialLoadDone.current = false;
		}
	}, [generateMonths]);

	// Initial data load
	useEffect(() => {
		if (
			!isInitialLoad &&
			visibleMonths.length > 0 &&
			!initialDataLoadDone.current
		) {
			initialDataLoadDone.current = true;
		}
	}, [isInitialLoad, visibleMonths]);

	// Handle month changes
	const handleMonthChange = useCallback(
		(month: Date) => {
			if (!isMonthChangeInProgress.current) {
				isMonthChangeInProgress.current = true;
				setCurrentVisibleMonth(month);
				onMonthChange(month);
				isMonthChangeInProgress.current = false;
			}
		},
		[onMonthChange]
	);

	// Update visible months when viewable items change
	const onViewableItemsChanged = useCallback(
		({ viewableItems }: { viewableItems: ViewToken[] }) => {
			if (viewableItems.length > 0) {
				const index = viewableItems[0].index ?? 0;
				const months = generateMonths();
				const visibleMonth = months[index];
				setVisibleMonths(
					months.slice(Math.max(0, index - 1), index + 2)
				);
				handleMonthChange(visibleMonth);
			}
		},
		[generateMonths, handleMonthChange]
	);

	const getWeeksInMonth = useCallback((date: Date) => {
		const year = date.getFullYear();
		const month = date.getMonth();
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const firstDayOfWeek = firstDay.getDay();
		const totalDays = lastDay.getDate();
		const totalWeeks = Math.ceil((totalDays + firstDayOfWeek) / 7);
		return totalWeeks;
	}, []);

	const getCalendarHeight = useCallback(
		(date: Date) => {
			const weeks = getWeeksInMonth(date);
			return HEADER_HEIGHT + weeks * weekHeight + BOTTOM_PADDING;
		},
		[getWeeksInMonth, weekHeight]
	);

	const viewabilityConfig = {
		minimumViewTime: 0,
		viewAreaCoveragePercentThreshold: 50,
	};

	const getItemLayout = useCallback(
		(_: ArrayLike<Date> | null | undefined, index: number) => ({
			length: calendarWidth,
			offset: calendarWidth * index,
			index,
		}),
		[calendarWidth]
	);

	return (
		<View style={styles.outerContainer}>
			<View
				style={[
					styles.container,
					{
						width: calendarWidth,
						height: getCalendarHeight(currentVisibleMonth),
					},
				]}
			>
				<CalendarHeader
					month={currentVisibleMonth}
					horizontalPadding={horizontalPadding}
				/>
				<FlatList
					ref={flatListRef}
					data={generateMonths()}
					horizontal
					pagingEnabled
					showsHorizontalScrollIndicator={false}
					initialScrollIndex={12} // Start at current month (index 12)
					initialNumToRender={3}
					maxToRenderPerBatch={3}
					windowSize={3}
					removeClippedSubviews={false}
					updateCellsBatchingPeriod={50}
					maintainVisibleContentPosition={{
						minIndexForVisible: 0,
						autoscrollToTopThreshold: 10,
					}}
					getItemLayout={getItemLayout}
					onViewableItemsChanged={onViewableItemsChanged}
					viewabilityConfig={viewabilityConfig}
					renderItem={({ item: month }) => (
						<MonthCalendar
							month={month}
							markedDays={markedDays}
							onDayPress={onDayPress}
							daySize={daySize}
							width={calendarWidth}
							horizontalPadding={horizontalPadding}
						/>
					)}
					keyExtractor={(item) => item.toISOString()}
					snapToInterval={calendarWidth}
					snapToAlignment='center'
					decelerationRate='fast'
				/>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	outerContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		width: '100%',
	},
	container: {
		backgroundColor: colors.background.primary,
		borderRadius: 10,
		marginHorizontal: 10,
		overflow: 'hidden',
		shadowColor: colors.ui.shadow,
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3,
		elevation: 3,
	},
});

export default CustomCalendar;
