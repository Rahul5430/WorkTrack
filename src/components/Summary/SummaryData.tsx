import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { useSelector } from 'react-redux';

import {
	WORK_STATUS,
	WORK_STATUS_COLORS,
	WORK_STATUS_LABELS,
} from '../../constants/workStatus';
import { useResponsiveLayout } from '../../hooks/useResponsive';
import { RootState } from '../../store/store';
import { fonts } from '../../themes';
import { colors } from '../../themes/colors';
import { MarkedDay } from '../../types/calendar';

const SummaryData = () => {
	const { RFValue } = useResponsiveLayout();
	const workTrackData = useSelector(
		(state: RootState) => state.workTrack.data
	);

	const stats = useMemo(() => {
		const today = new Date();
		const currentMonth = today.getMonth();
		const currentYear = today.getFullYear();
		const currentQuarter = Math.floor(currentMonth / 3);

		// Get data for the current quarter
		const quarterData = workTrackData.filter((entry: MarkedDay) => {
			const entryDate = new Date(entry.date);
			const entryQuarter = Math.floor(entryDate.getMonth() / 3);
			return (
				entryDate.getFullYear() === currentYear &&
				entryQuarter === currentQuarter
			);
		});

		// Get data for the current month
		const monthData = workTrackData.filter((entry: MarkedDay) => {
			const entryDate = new Date(entry.date);
			return (
				entryDate.getMonth() === currentMonth &&
				entryDate.getFullYear() === currentYear
			);
		});

		const getWorkingDaysInPeriod = (startDate: Date, endDate: Date) => {
			let workingDays = 0;
			const currentDate = new Date(startDate);

			while (currentDate <= endDate) {
				// Skip weekends (0 = Sunday, 6 = Saturday)
				if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
					workingDays++;
				}
				currentDate.setDate(currentDate.getDate() + 1);
			}
			return workingDays;
		};

		// Calculate working days for the current month
		const monthStart = new Date(currentYear, currentMonth, 1);
		const monthEnd = new Date(currentYear, currentMonth + 1, 0);
		const workingDaysInMonth = getWorkingDaysInPeriod(monthStart, monthEnd);

		// Calculate working days for the current quarter
		const quarterStart = new Date(currentYear, currentQuarter * 3, 1);
		const quarterEnd = new Date(currentYear, (currentQuarter + 1) * 3, 0);
		const workingDaysInQuarter = getWorkingDaysInPeriod(
			quarterStart,
			quarterEnd
		);

		const getCounts = (data: MarkedDay[]) => {
			const counts = {
				[WORK_STATUS.OFFICE]: 0,
				[WORK_STATUS.WFH]: 0,
				[WORK_STATUS.HOLIDAY]: 0,
				[WORK_STATUS.LEAVE]: 0,
				[WORK_STATUS.ADVISORY]: 0,
			};

			data.forEach((entry: MarkedDay) => {
				counts[entry.status]++;
			});

			return counts;
		};

		const monthCounts = getCounts(monthData);
		const quarterCounts = getCounts(quarterData);

		return {
			monthly: {
				counts: monthCounts,
				workingDays: workingDaysInMonth,
			},
			quarterly: {
				counts: quarterCounts,
				workingDays: workingDaysInQuarter,
			},
		};
	}, [workTrackData]);

	const monthlyData = [
		{
			label: WORK_STATUS_LABELS[WORK_STATUS.OFFICE],
			value: stats.monthly.counts[WORK_STATUS.OFFICE],
			color: WORK_STATUS_COLORS[WORK_STATUS.OFFICE],
		},
		{
			label: WORK_STATUS_LABELS[WORK_STATUS.WFH],
			value: stats.monthly.counts[WORK_STATUS.WFH],
			color: WORK_STATUS_COLORS[WORK_STATUS.WFH],
		},
		{
			label: WORK_STATUS_LABELS[WORK_STATUS.HOLIDAY],
			value: stats.monthly.counts[WORK_STATUS.HOLIDAY],
			color: WORK_STATUS_COLORS[WORK_STATUS.HOLIDAY],
		},
		{
			label: 'Required',
			value: stats.monthly.workingDays,
			color: colors.holiday,
		},
	];

	return (
		<View style={styles.container}>
			<View style={styles.section}>
				{monthlyData.map(({ label, value, color }) => (
					<View style={styles.item} key={`monthly-${label}`}>
						<View style={styles.dayContainer}>
							<Text
								style={{
									fontFamily: fonts.PoppinsMedium,
									fontSize: RFValue(14),
									color: colors.text.primary,
								}}
							>
								{label}
							</Text>
							<Text
								style={{
									fontFamily: fonts.PoppinsRegular,
									fontSize: RFValue(14),
									color: colors.text.secondary,
								}}
							>
								{value} days
							</Text>
						</View>
						<ProgressBar
							progress={value / stats.monthly.workingDays}
							color={color}
							style={styles.progressBar}
							fillStyle={{ borderRadius: 9999 }}
						/>
					</View>
				))}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'column',
		gap: 24,
	},
	section: {
		flexDirection: 'column',
		gap: 12,
	},
	sectionTitle: {
		fontFamily: fonts.PoppinsMedium,
		color: colors.text.secondary,
		marginBottom: 4,
	},
	item: {
		flexDirection: 'column',
		gap: 4,
	},
	dayContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	progressBar: {
		backgroundColor: colors.ui.gray[100],
		height: 8,
		borderRadius: 9999,
	},
});

export default SummaryData;
