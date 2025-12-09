import { FlashList, FlashListRef, ViewToken } from '@shopify/flash-list';
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	Dimensions,
	NativeScrollEvent,
	NativeSyntheticEvent,
	StyleSheet,
	View,
} from 'react-native';

import { useResponsiveLayout } from '@/shared/ui/hooks/useResponsive';
import { colors } from '@/shared/ui/theme';
import { MarkedDayStatus } from '@/types';

import CalendarHeader from './CalendarHeader';
import MonthCalendar from './MonthCalendar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = 80;
const BOTTOM_PADDING = 5;

type CustomCalendarProps = {
	currentMonth: Date;
	markedDays: {
		[key: string]: { status: MarkedDayStatus; isAdvisory: boolean };
	};
	onDayPress: (date: string) => void;
	onMonthChange: (date: Date) => void;
};

const addMonths = (date: Date, months: number): Date => {
	const result = new Date(date);
	result.setMonth(result.getMonth() + months);
	return result;
};

const CustomCalendar: React.FC<CustomCalendarProps> = ({
	currentMonth,
	markedDays,
	onDayPress,
	onMonthChange,
}) => {
	const { getResponsiveMargin, getResponsiveSize } = useResponsiveLayout();
	const containerMargin = getResponsiveSize(5).width;
	const calendarWidth = SCREEN_WIDTH - containerMargin;
	const horizontalPadding = getResponsiveMargin(3);

	const availableWidth = calendarWidth - horizontalPadding * 2;
	const daySize = Math.floor(availableWidth / 7);
	const leftoverSpace = availableWidth - daySize * 7;
	const weekHeight = daySize + 2;

	const flashListRef = useRef<FlashListRef<Date>>(null);
	const [currentVisibleMonth, setCurrentVisibleMonth] =
		useState<Date>(currentMonth);
	const isScrollingRef = useRef(false);
	const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const scrollPositionRef = useRef(calendarWidth);
	const hasUserScrolledRef = useRef(false);
	const isInitialMountRef = useRef(true);
	const isUpdatingBufferRef = useRef(false);

	const memoizedMarkedDays = useMemo(() => markedDays, [markedDays]);

	const [monthsBuffer, setMonthsBuffer] = useState<Date[]>(() => {
		const base = currentMonth;
		return [addMonths(base, -1), base, addMonths(base, 1)];
	});

	useEffect(() => {
		if (isInitialMountRef.current) {
			isInitialMountRef.current = false;
			return;
		}

		// Don't update if we're currently updating the buffer from user scroll
		if (isUpdatingBufferRef.current) {
			return;
		}

		if (currentMonth.getTime() !== currentVisibleMonth.getTime()) {
			const newBuffer = [
				addMonths(currentMonth, -1),
				currentMonth,
				addMonths(currentMonth, 1),
			];
			setMonthsBuffer(newBuffer);
			setCurrentVisibleMonth(currentMonth);
			// Only scroll if this is a programmatic change (not user scroll)
			if (!hasUserScrolledRef.current) {
				setTimeout(() => {
					flashListRef.current?.scrollToIndex({
						index: 1,
						animated: false,
					});
				}, 0);
			}
		}
	}, [currentMonth, currentVisibleMonth]);

	// Cleanup timeout on unmount
	useEffect(() => {
		const timeoutRef = updateTimeoutRef;
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

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

	const onViewableItemsChanged = useCallback(
		(info: {
			viewableItems: ViewToken<Date>[];
			changed: ViewToken<Date>[];
		}) => {
			// This is now a fallback - onScroll handles immediate updates
			// Only use this if onScroll hasn't updated yet
			if (info.viewableItems.length > 0 && !isScrollingRef.current) {
				const mostVisible = info.viewableItems[0];
				if (
					mostVisible?.item &&
					mostVisible?.isViewable &&
					mostVisible.item.getTime() !== currentVisibleMonth.getTime()
				) {
					setCurrentVisibleMonth(mostVisible.item);
				}
			}
		},
		[currentVisibleMonth]
	);

	const viewabilityConfig = useMemo(
		() => ({
			itemVisiblePercentThreshold: 50,
			minimumViewTime: 100,
		}),
		[]
	);

	// Pre-compute which month should be visible based on scroll position
	// This allows us to update header and height immediately, even before FlashList renders
	const getVisibleMonthFromScroll = useCallback(
		(offsetX: number) => {
			const index = Math.round(offsetX / calendarWidth);
			const clampedIndex = Math.max(
				0,
				Math.min(index, monthsBuffer.length - 1)
			);
			return monthsBuffer[clampedIndex];
		},
		[calendarWidth, monthsBuffer]
	);

	const handleScroll = useCallback(
		(event: NativeSyntheticEvent<NativeScrollEvent>) => {
			const offsetX = event.nativeEvent.contentOffset.x;
			scrollPositionRef.current = offsetX;
			const predictedMonth = getVisibleMonthFromScroll(offsetX);

			// Update header and height immediately based on scroll position
			// Only update if month actually changed to reduce re-renders
			if (
				predictedMonth &&
				predictedMonth.getTime() !== currentVisibleMonth.getTime()
			) {
				setCurrentVisibleMonth(predictedMonth);
			}
		},
		[getVisibleMonthFromScroll, currentVisibleMonth]
	);

	const handleScrollBegin = useCallback(() => {
		isScrollingRef.current = true;
		hasUserScrolledRef.current = true;
		if (updateTimeoutRef.current) {
			clearTimeout(updateTimeoutRef.current);
		}
	}, []);

	const handleScrollEnd = useCallback(
		(event: NativeSyntheticEvent<NativeScrollEvent>) => {
			isScrollingRef.current = false;
			const offsetX = event.nativeEvent.contentOffset.x;
			const index = Math.round(offsetX / calendarWidth);
			const clampedIndex = Math.max(
				0,
				Math.min(index, monthsBuffer.length - 1)
			);
			const newBase = monthsBuffer[clampedIndex];

			// Update buffer only when at edges to maintain circular buffer
			// Don't reset scroll position - let user continue scrolling naturally
			const isAtEdge = clampedIndex === 0 || clampedIndex === 2;

			if (isAtEdge && hasUserScrolledRef.current) {
				isUpdatingBufferRef.current = true;
				const nextBuffer = [
					addMonths(newBase, -1),
					newBase,
					addMonths(newBase, 1),
				];

				// Check if buffer actually needs updating
				const bufferChanged =
					nextBuffer[0].getTime() !== monthsBuffer[0].getTime() ||
					nextBuffer[1].getTime() !== monthsBuffer[1].getTime() ||
					nextBuffer[2].getTime() !== monthsBuffer[2].getTime();

				if (bufferChanged) {
					// Update buffer but maintain current scroll position
					const currentIndex = clampedIndex;

					setMonthsBuffer(nextBuffer);

					// After buffer updates, scroll to maintain visual position
					// If we were at index 0, we want to stay at index 0 (now prev month)
					// If we were at index 2, we want to stay at index 2 (now next month)
					// If we were at index 1, we want to stay at index 1 (now current month)
					setTimeout(() => {
						// Maintain the same index position in the new buffer
						flashListRef.current?.scrollToIndex({
							index: currentIndex,
							animated: false,
						});
						// Reset the flag after scroll completes
						setTimeout(() => {
							isUpdatingBufferRef.current = false;
						}, 200);
					}, 100);
				} else {
					isUpdatingBufferRef.current = false;
				}
			}

			// Always ensure month state is in sync
			// Only call onMonthChange when at center (index 1) to prevent loops
			if (newBase.getTime() !== currentVisibleMonth.getTime()) {
				setCurrentVisibleMonth(newBase);
				// Only notify parent when we're at the center month to prevent infinite loops
				// The parent will update currentMonth, which would trigger useEffect
				if (clampedIndex === 1) {
					onMonthChange(newBase);
				}
			}
		},
		[calendarWidth, monthsBuffer, currentVisibleMonth, onMonthChange]
	);

	const renderMonth = useCallback(
		({ item: month }: { item: Date }) => (
			<MonthCalendar
				month={month}
				markedDays={memoizedMarkedDays}
				onDayPress={onDayPress}
				daySize={daySize}
				width={calendarWidth}
				horizontalPadding={horizontalPadding}
				leftoverSpace={leftoverSpace}
			/>
		),
		[
			memoizedMarkedDays,
			onDayPress,
			daySize,
			calendarWidth,
			horizontalPadding,
			leftoverSpace,
		]
	);

	const keyExtractor = useCallback((item: Date) => item.toISOString(), []);

	const containerHeight = useMemo(
		() => getCalendarHeight(currentVisibleMonth),
		[currentVisibleMonth, getCalendarHeight]
	);

	const containerStyle = useMemo(
		() => [
			styles.container,
			{
				width: calendarWidth,
				height: containerHeight,
			},
		],
		[calendarWidth, containerHeight]
	);

	return (
		<View style={styles.outerContainer}>
			<View style={containerStyle}>
				<CalendarHeader
					month={currentVisibleMonth}
					horizontalPadding={horizontalPadding}
				/>
				<FlashList
					ref={flashListRef}
					data={monthsBuffer}
					horizontal
					pagingEnabled
					showsHorizontalScrollIndicator={false}
					initialScrollIndex={1}
					drawDistance={calendarWidth * 1.5}
					onScroll={handleScroll}
					scrollEventThrottle={32}
					onScrollBeginDrag={handleScrollBegin}
					onMomentumScrollEnd={handleScrollEnd}
					onViewableItemsChanged={onViewableItemsChanged}
					viewabilityConfig={viewabilityConfig}
					renderItem={renderMonth}
					keyExtractor={keyExtractor}
					snapToInterval={calendarWidth}
					snapToAlignment='center'
					decelerationRate='fast'
					nestedScrollEnabled={true}
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
	},
});

export default React.memo(CustomCalendar);
