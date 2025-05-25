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
		const currentMonth = new Date().getMonth();
		const currentYear = new Date().getFullYear();

		const monthData = workTrackData.filter((entry: MarkedDay) => {
			const entryDate = new Date(entry.date);
			return (
				entryDate.getMonth() === currentMonth &&
				entryDate.getFullYear() === currentYear
			);
		});

		const counts = {
			[WORK_STATUS.OFFICE]: 0,
			[WORK_STATUS.WFH]: 0,
			[WORK_STATUS.HOLIDAY]: 0,
		};

		monthData.forEach((entry: MarkedDay) => {
			counts[entry.status]++;
		});

		// Calculate working days in the current month
		const daysInMonth = new Date(
			currentYear,
			currentMonth + 1,
			0
		).getDate();
		const workingDaysInMonth = Array.from(
			{ length: daysInMonth },
			(_, i) => {
				const date = new Date(currentYear, currentMonth, i + 1);
				return date.getDay() !== 0 && date.getDay() !== 6; // Exclude weekends
			}
		).filter(Boolean).length;

		return {
			counts,
			workingDaysInMonth,
		};
	}, [workTrackData]);

	const data = [
		{
			label: WORK_STATUS_LABELS[WORK_STATUS.OFFICE],
			value: stats.counts[WORK_STATUS.OFFICE],
			color: WORK_STATUS_COLORS[WORK_STATUS.OFFICE],
		},
		{
			label: WORK_STATUS_LABELS[WORK_STATUS.WFH],
			value: stats.counts[WORK_STATUS.WFH],
			color: WORK_STATUS_COLORS[WORK_STATUS.WFH],
		},
		{
			label: WORK_STATUS_LABELS[WORK_STATUS.HOLIDAY],
			value: stats.counts[WORK_STATUS.HOLIDAY],
			color: WORK_STATUS_COLORS[WORK_STATUS.HOLIDAY],
		},
		{
			label: 'Required',
			value: stats.workingDaysInMonth,
			color: colors.holiday,
		},
	];

	return (
		<View style={styles.container}>
			{data.map(({ label, value, color }) => (
				<View style={styles.item} key={`${label}-${value}-${color}`}>
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
						progress={value / stats.workingDaysInMonth}
						color={color}
						style={styles.progressBar}
						fillStyle={{ borderRadius: 9999 }}
					/>
				</View>
			))}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'column',
		justifyContent: 'space-between',
		gap: 12,
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
