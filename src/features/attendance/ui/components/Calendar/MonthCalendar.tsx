import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { WORK_STATUS } from '@/shared/constants/workStatus';
import { useResponsiveLayout } from '@/shared/ui/hooks/useResponsive';
import { fonts } from '@/shared/ui/theme';
import { colors } from '@/shared/ui/theme/colors';
import { MarkedDayStatus } from '@/types';

import CalendarDay from './CalendarDay';

type MonthCalendarProps = {
	month: Date;
	markedDays: {
		[key: string]: { status: MarkedDayStatus; isAdvisory: boolean };
	};
	onDayPress: (date: string) => void;
	daySize: number;
	width: number;
	horizontalPadding?: number;
	leftoverSpace?: number;
};

type DayInfo = {
	day: number;
	dateString: string;
	type?: MarkedDayStatus;
	isAdvisory: boolean;
	isEmpty: boolean;
};

const getDaysInMonth = (date: Date) => {
	const year = date.getFullYear();
	const monthIndex = date.getMonth();
	const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
	const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();
	return { daysInMonth, firstDayOfMonth };
};

const computeDaysForMonth = (
	month: Date,
	markedDays: {
		[key: string]: { status: MarkedDayStatus; isAdvisory: boolean };
	}
): DayInfo[] => {
	const { daysInMonth, firstDayOfMonth } = getDaysInMonth(month);
	const days: DayInfo[] = [];
	const totalDays = 42;

	for (let i = 0; i < firstDayOfMonth; i++) {
		days.push({
			day: 0,
			dateString: '',
			isAdvisory: false,
			isEmpty: true,
		});
	}

	for (let day = 1; day <= daysInMonth; day++) {
		const date = new Date(month);
		date.setDate(day);
		const dateString = date.toLocaleDateString('en-CA');
		const markedDay = markedDays[dateString];
		const isAdvisory = markedDay?.isAdvisory ?? false;

		const [year, monthNum, dayNum] = dateString.split('-').map(Number);
		const localDate = new Date(year, monthNum - 1, dayNum);
		const dayOfWeek = localDate.getDay();
		const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

		const finalStatus =
			dateString in markedDays
				? markedDay.status
				: isWeekend
					? WORK_STATUS.HOLIDAY
					: undefined;

		days.push({
			day,
			dateString,
			type: finalStatus,
			isAdvisory,
			isEmpty: false,
		});
	}

	const remainingDays = totalDays - days.length;
	for (let i = 0; i < remainingDays; i++) {
		days.push({
			day: 0,
			dateString: '',
			isAdvisory: false,
			isEmpty: true,
		});
	}

	return days;
};

const MonthCalendar: React.FC<MonthCalendarProps> = ({
	month,
	markedDays,
	onDayPress,
	daySize,
	width,
	horizontalPadding = 20,
	leftoverSpace = 0,
}) => {
	const { getResponsiveMargin } = useResponsiveLayout();
	const responsivePadding = horizontalPadding || getResponsiveMargin(5);

	const days = useMemo(
		() => computeDaysForMonth(month, markedDays),
		[month, markedDays]
	);

	const emptyDayStyle = useMemo(
		() => ({ width: daySize, height: daySize }),
		[daySize]
	);

	const containerStyle = useMemo(
		() => [
			styles.daysContainer,
			{
				paddingHorizontal: responsivePadding,
				paddingRight: responsivePadding + leftoverSpace,
			},
		],
		[responsivePadding, leftoverSpace]
	);

	return (
		<View style={[styles.monthContainer, { width }]}>
			<View style={containerStyle}>
				{days.map((dayInfo, index) => {
					if (dayInfo.isEmpty) {
						return (
							<View
								key={`empty-${index}`}
								style={emptyDayStyle}
							/>
						);
					}

					return (
						<View
							key={dayInfo.dateString}
							style={[
								styles.dayContainer,
								{
									width: daySize,
									height: daySize,
								},
							]}
						>
							<CalendarDay
								day={dayInfo.day}
								dateString={dayInfo.dateString}
								onPress={onDayPress}
								type={dayInfo.type}
								isAdvisory={dayInfo.isAdvisory}
								isCurrentMonth={true}
							/>
						</View>
					);
				})}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	monthContainer: {
		backgroundColor: colors.background.primary,
	},
	weekDays: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		paddingHorizontal: 20,
		paddingVertical: 8,
	},
	weekDayText: {
		width: 40,
		textAlign: 'center',
		color: colors.text.secondary,
		fontSize: 13,
		fontFamily: fonts.PoppinsMedium,
	},
	daysContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		paddingTop: 4,
		paddingBottom: 2,
	},
	dayContainer: {
		alignItems: 'center',
		justifyContent: 'center',
	},
});

export default React.memo(MonthCalendar, (prevProps, nextProps) => {
	return (
		prevProps.month.getTime() === nextProps.month.getTime() &&
		prevProps.markedDays === nextProps.markedDays &&
		prevProps.onDayPress === nextProps.onDayPress &&
		prevProps.daySize === nextProps.daySize &&
		prevProps.width === nextProps.width &&
		prevProps.horizontalPadding === nextProps.horizontalPadding &&
		prevProps.leftoverSpace === nextProps.leftoverSpace
	);
});
