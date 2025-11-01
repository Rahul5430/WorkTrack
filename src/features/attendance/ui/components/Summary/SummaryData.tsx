import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { RootState } from '@/app/store';
import {
	WORK_STATUS,
	WORK_STATUS_COLORS,
	WORK_STATUS_LABELS,
} from '@/shared/constants/workStatus';
import { useResponsiveLayout } from '@/shared/ui/hooks/useResponsive';
import { fonts } from '@/shared/ui/theme';
import { colors } from '@/shared/ui/theme/colors';
import { MarkedDay } from '@/types';

type SummaryDataProps = {
	selectedMonth?: Date;
};

type MonthlyDataItem = {
	label: string;
	value: number;
	color: string;
};

const SummaryData = ({ selectedMonth }: SummaryDataProps) => {
	const { RFValue } = useResponsiveLayout();
	const workTrackData = useSelector(
		(state: RootState) => state.workTrack.data
	) as unknown as MarkedDay[];

	const stats = useMemo(() => {
		const today = selectedMonth || new Date();
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
		const totalWorkingDays = getWorkingDaysInPeriod(monthStart, monthEnd);

		// Count holidays and advisory days
		const holidaysAndAdvisory = monthData.filter((entry) => {
			const entryDate = new Date(entry.date);
			const dayOfWeek = entryDate.getDay();
			// Count holidays and advisory days that are not weekends
			return (
				(entry.status === WORK_STATUS.HOLIDAY || entry.isAdvisory) &&
				dayOfWeek !== 0 &&
				dayOfWeek !== 6
			);
		}).length;

		// Calculate required days
		const requiredDays = totalWorkingDays - holidaysAndAdvisory;

		// Calculate working days for the current quarter
		const quarterStart = new Date(currentYear, currentQuarter * 3, 1);
		const quarterEnd = new Date(currentYear, (currentQuarter + 1) * 3, 0);
		const workingDaysInQuarter = getWorkingDaysInPeriod(
			quarterStart,
			quarterEnd
		);

		const getCounts = (data: MarkedDay[]) => {
			const counts: Record<
				(typeof WORK_STATUS)[keyof typeof WORK_STATUS],
				number
			> = {
				[WORK_STATUS.OFFICE]: 0,
				[WORK_STATUS.WFH]: 0,
				[WORK_STATUS.HOLIDAY]: 0,
				[WORK_STATUS.LEAVE]: 0,
				[WORK_STATUS.WEEKEND]: 0,
				[WORK_STATUS.FORECAST]: 0,
			};

			data.forEach((entry: MarkedDay) => {
				const entryDate = new Date(entry.date);
				const dayOfWeek = entryDate.getDay();
				// Only count holidays on weekdays
				if (
					entry.status === WORK_STATUS.HOLIDAY &&
					(dayOfWeek === 0 || dayOfWeek === 6)
				) {
					return;
				}
				// Only count statuses we track visually
				counts[entry.status] = (counts[entry.status] ?? 0) + 1;
			});

			return counts;
		};

		const monthCounts = getCounts(monthData);
		const quarterCounts = getCounts(quarterData);

		return {
			monthly: {
				counts: monthCounts,
				workingDays: requiredDays,
			},
			quarterly: {
				counts: quarterCounts,
				workingDays: workingDaysInQuarter,
			},
		};
	}, [workTrackData, selectedMonth]);

	const monthlyData = useMemo(() => {
		const data: MonthlyDataItem[] = [
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
		];

		// Add leaves if greater than 0
		if (stats.monthly.counts[WORK_STATUS.LEAVE] > 0) {
			data.push({
				label: WORK_STATUS_LABELS[WORK_STATUS.LEAVE],
				value: stats.monthly.counts[WORK_STATUS.LEAVE],
				color: colors.error,
			});
		}

		// Add holidays if greater than 0
		if (stats.monthly.counts[WORK_STATUS.HOLIDAY] > 0) {
			data.push({
				label: WORK_STATUS_LABELS[WORK_STATUS.HOLIDAY],
				value: stats.monthly.counts[WORK_STATUS.HOLIDAY],
				color: WORK_STATUS_COLORS[WORK_STATUS.HOLIDAY],
			});
		}

		// Always add required days at the end
		data.push({
			label: 'Required',
			value: stats.monthly.workingDays,
			color: colors.text.secondary,
		});

		return data;
	}, [stats.monthly.counts, stats.monthly.workingDays]);

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
								{value} {value === 1 ? 'day' : 'days'}
							</Text>
						</View>
						<ProgressBar
							progress={value / stats.monthly.workingDays}
							color={color}
							style={styles.progressBar}
							fillStyle={styles.progressBarFill}
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
	progressBarFill: {
		borderRadius: 9999,
	},
});

export default SummaryData;
