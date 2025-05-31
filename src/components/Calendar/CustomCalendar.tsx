import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
	Dimensions,
	FlatList,
	StyleSheet,
	View,
	ViewToken,
} from 'react-native';

import { colors } from '../../themes/colors';
import { MarkedDayStatus } from '../../types/calendar';
import CalendarHeader from './CalendarHeader';
import MonthCalendar from './MonthCalendar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = 80; // Height for month header and week days
const WEEK_HEIGHT = 50; // Height for each week row
const BOTTOM_PADDING = 25; // Extra padding at the bottom

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
	const calendarWidth = SCREEN_WIDTH;
	const daySize = (calendarWidth - 40) / 7;
	const flatListRef = useRef<FlatList>(null);
	const [visibleMonths, setVisibleMonths] = useState<Date[]>([]);
	const [isInitialLoad, setIsInitialLoad] = useState(true);
	const initialLoadDone = useRef(false);
	const initialDataLoadDone = useRef(false);
	const [currentVisibleMonth, setCurrentVisibleMonth] =
		useState(currentMonth);
	const isMonthChangeInProgress = useRef(false);
	const lastMarkedDaysUpdate = useRef<number>(Date.now());

	const generateMonths = useCallback(() => {
		const months = [];
		const today = new Date();
		const currentYear = today.getFullYear();
		const currentMonth = today.getMonth();

		// Generate 12 months before and 12 months after current month
		for (let i = -12; i <= 12; i++) {
			const date = new Date(currentYear, currentMonth + i, 1);
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
				const currentMonth = months[index];
				setVisibleMonths(
					months.slice(Math.max(0, index - 1), index + 2)
				);
				handleMonthChange(currentMonth);
			}
		},
		[generateMonths, handleMonthChange]
	);

	// Refresh data for visible months when markedDays changes
	useEffect(() => {
		if (
			!isInitialLoad &&
			visibleMonths.length > 0 &&
			initialDataLoadDone.current
		) {
			const now = Date.now();
			// Prevent rapid consecutive updates
			if (now - lastMarkedDaysUpdate.current > 100) {
				// Only refresh the current visible month
				onMonthChange(currentVisibleMonth);
				lastMarkedDaysUpdate.current = now;
			}
		}
	}, [
		markedDays,
		visibleMonths,
		currentVisibleMonth,
		onMonthChange,
		isInitialLoad,
	]);

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
			return HEADER_HEIGHT + weeks * WEEK_HEIGHT + BOTTOM_PADDING;
		},
		[getWeeksInMonth]
	);

	const viewabilityConfig = {
		minimumViewTime: 0,
		viewAreaCoveragePercentThreshold: 50,
	};

	const getItemLayout = useCallback(
		(_: any, index: number) => ({
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
				<CalendarHeader month={currentVisibleMonth} />
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
		shadowColor: '#000',
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
