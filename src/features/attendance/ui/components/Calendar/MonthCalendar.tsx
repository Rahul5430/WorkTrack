import React from 'react';
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
};

const MonthCalendar: React.FC<MonthCalendarProps> = ({
	month,
	markedDays,
	onDayPress,
	daySize,
	width,
	horizontalPadding = 20,
}) => {
	const { getResponsiveMargin } = useResponsiveLayout();
	const responsivePadding = horizontalPadding || getResponsiveMargin(5);

	const getDaysInMonth = (date: Date) => {
		const year = date.getFullYear();
		const monthIndex = date.getMonth();
		const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
		const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();
		return { daysInMonth, firstDayOfMonth };
	};

	const renderDays = () => {
		const { daysInMonth, firstDayOfMonth } = getDaysInMonth(month);
		const days = [];
		const totalDays = 42; // 6 rows of 7 days

		const emptyDayStyle = { width: daySize, height: daySize };

		// Add empty cells for days before the first day of the month
		for (let i = 0; i < firstDayOfMonth; i++) {
			days.push(<View key={`empty-${i}`} style={emptyDayStyle} />);
		}

		// Add days of the month
		for (let day = 1; day <= daysInMonth; day++) {
			const date = new Date(month);
			date.setDate(day);
			// Convert to local date string to avoid timezone issues
			const dateString = date.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD format
			const markedDay = markedDays[dateString];
			const isAdvisory = markedDay?.isAdvisory ?? false;

			// Create a new date object in local time for day of week calculation
			const [year, monthNum, dayNum] = dateString.split('-').map(Number);
			const localDate = new Date(year, monthNum - 1, dayNum);
			const dayOfWeek = localDate.getDay();

			// Sunday is 0, Saturday is 6
			const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

			// Only set holiday status for weekends if the day is not in markedDays
			const finalStatus =
				dateString in markedDays
					? markedDay.status
					: isWeekend
						? WORK_STATUS.HOLIDAY
						: undefined;

			days.push(
				<View
					key={dateString}
					style={[
						styles.dayContainer,
						{
							width: daySize,
							height: daySize,
						},
					]}
				>
					<CalendarDay
						day={day}
						dateString={dateString}
						onPress={onDayPress}
						type={finalStatus}
						isAdvisory={isAdvisory}
						isCurrentMonth={true}
					/>
				</View>
			);
		}

		// Fill remaining days in the last row
		const remainingDays = totalDays - days.length;
		for (let i = 0; i < remainingDays; i++) {
			days.push(<View key={`empty-end-${i}`} style={emptyDayStyle} />);
		}

		return days;
	};

	return (
		<View style={[styles.monthContainer, { width }]}>
			<View
				style={[
					styles.daysContainer,
					{ paddingHorizontal: responsivePadding },
				]}
			>
				{renderDays()}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	monthContainer: {
		flex: 1,
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

export default MonthCalendar;
