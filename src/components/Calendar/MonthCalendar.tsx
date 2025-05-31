import React from 'react';
import { StyleSheet, View } from 'react-native';

import { WORK_STATUS } from '../../constants/workStatus';
import { fonts } from '../../themes';
import { colors } from '../../themes/colors';
import { MarkedDayStatus } from '../../types/calendar';
import CalendarDay from './CalendarDay';

type MonthCalendarProps = {
	month: Date;
	markedDays: {
		[key: string]: { status: MarkedDayStatus; isAdvisory: boolean };
	};
	onDayPress: (date: string) => void;
	daySize: number;
	width: number;
};

const MonthCalendar: React.FC<MonthCalendarProps> = ({
	month,
	markedDays,
	onDayPress,
	daySize,
	width,
}) => {
	const getDaysInMonth = (date: Date) => {
		const year = date.getFullYear();
		const month = date.getMonth();
		const daysInMonth = new Date(year, month + 1, 0).getDate();
		const firstDayOfMonth = new Date(year, month, 1).getDay();
		return { daysInMonth, firstDayOfMonth };
	};

	const renderDays = () => {
		const { daysInMonth, firstDayOfMonth } = getDaysInMonth(month);
		const days = [];
		const totalDays = 42; // 6 rows of 7 days

		// Add empty cells for days before the first day of the month
		for (let i = 0; i < firstDayOfMonth; i++) {
			days.push(<View key={`empty-${i}`} style={styles.emptyDay} />);
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
			days.push(<View key={`empty-end-${i}`} style={styles.emptyDay} />);
		}

		return days;
	};

	return (
		<View style={[styles.monthContainer, { width }]}>
			<View style={styles.daysContainer}>{renderDays()}</View>
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
		paddingHorizontal: 20,
		paddingTop: 8,
		paddingBottom: 10,
	},
	dayContainer: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	emptyDay: {
		width: '14.28%',
		aspectRatio: 1,
	},
});

export default MonthCalendar;
