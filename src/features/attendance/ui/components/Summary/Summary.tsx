// migrated to V2 structure
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';

import { RootState } from '@/app/store';
import { WORK_STATUS } from '@/shared/constants/workStatus';
import { useResponsiveLayout } from '@/shared/ui/hooks/useResponsive';
import { fonts } from '@/shared/ui/theme';
import { colors } from '@/shared/ui/theme/colors';
import { type MarkedDay } from '@/types';

import SummaryData from './SummaryData';

type SummaryProps = {
	selectedMonth?: Date;
};

const Summary = ({ selectedMonth }: SummaryProps) => {
	const { getResponsiveSize, RFValue } = useResponsiveLayout();
	const workTrackData = useSelector(
		(state: RootState) => state.workTrack.data
	) as unknown as MarkedDay[];
	const isLoading = useSelector(
		(state: RootState) => state.workTrack.loading
	);

	const attendanceStats = useMemo(() => {
		// Don't calculate if data is not loaded yet
		if (isLoading || !workTrackData.length) {
			return {
				monthly: {
					percentage: 0,
					meetsRequirement: null,
					details: {
						wfoDays: 0,
						totalWorkingDays: 0,
						companyHolidays: 0,
						effectiveWorkingDays: 0,
					},
				},
				quarterly: {
					percentage: 0,
					meetsRequirement: null,
					details: {
						wfoDays: 0,
						totalWorkingDays: 0,
						companyHolidays: 0,
						effectiveWorkingDays: 0,
					},
				},
			};
		}

		const today = selectedMonth || new Date();
		const currentMonth = today.getMonth();
		const currentYear = today.getFullYear();
		const currentQuarter = Math.floor(currentMonth / 3);

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

		const calculateAttendance = (
			data: MarkedDay[],
			period: 'month' | 'quarter'
		) => {
			// Get start and end dates for the period
			const startDate = new Date(
				currentYear,
				period === 'month' ? currentMonth : currentQuarter * 3,
				1
			);
			const endDate = new Date(
				currentYear,
				period === 'month'
					? currentMonth + 1
					: (currentQuarter + 1) * 3,
				0
			);

			// Calculate total working days in the period (excluding weekends)
			const totalWorkingDays = getWorkingDaysInPeriod(startDate, endDate);

			// Count WFO days (including those on advisory days)
			const wfoDays = data.filter(
				(entry) => entry.status === WORK_STATUS.OFFICE
			).length;

			// Count company holidays and advisory days (excluding weekends)
			const companyHolidays = data.filter((entry) => {
				const entryDate = new Date(entry.date);
				const dayOfWeek = entryDate.getDay();
				// Count holidays and advisory days that are not weekends
				return (
					(entry.status === WORK_STATUS.HOLIDAY ||
						entry.isAdvisory) &&
					dayOfWeek !== 0 &&
					dayOfWeek !== 6
				);
			}).length;

			// Calculate attendance percentage
			// Formula: (WFO Days / (Total Working Days - Company Holidays - Advisory Days)) * 100
			const effectiveWorkingDays = totalWorkingDays - companyHolidays;
			const attendancePercentage =
				effectiveWorkingDays > 0
					? Math.round((wfoDays / effectiveWorkingDays) * 100)
					: 0;

			// For quarterly, check if it meets the 60% requirement
			const meetsRequirement =
				period === 'quarter' ? attendancePercentage >= 60 : null;

			return {
				percentage: attendancePercentage,
				meetsRequirement,
				details: {
					wfoDays,
					totalWorkingDays,
					companyHolidays,
					effectiveWorkingDays,
				},
			};
		};

		// Get data for the current month
		const monthData = workTrackData.filter((entry: MarkedDay) => {
			const entryDate = new Date(entry.date);
			return (
				entryDate.getMonth() === currentMonth &&
				entryDate.getFullYear() === currentYear
			);
		});

		// Get data for the current quarter
		const quarterData = workTrackData.filter((entry: MarkedDay) => {
			const entryDate = new Date(entry.date);
			const entryQuarter = Math.floor(entryDate.getMonth() / 3);
			return (
				entryDate.getFullYear() === currentYear &&
				entryQuarter === currentQuarter
			);
		});

		const monthlyStats = calculateAttendance(monthData, 'month');
		const quarterlyStats = calculateAttendance(quarterData, 'quarter');

		return {
			monthly: monthlyStats,
			quarterly: quarterlyStats,
		};
	}, [workTrackData, isLoading, selectedMonth]);

	return (
		<View
			style={[
				styles.container,
				{
					paddingHorizontal: getResponsiveSize(5),
					marginBottom: getResponsiveSize(5),
				},
			]}
		>
			<View style={[styles.shadowContainer]}>
				<View style={styles.headerContainer}>
					<View style={styles.header}>
						<Text
							style={[
								styles.attendance,
								{
									color: colors.office,
									fontFamily: fonts.PoppinsBold,
									fontSize: RFValue(24),
								},
							]}
						>
							{isLoading
								? '...'
								: `${attendanceStats.monthly.percentage}%`}
						</Text>
						<View style={styles.quarterlyContainer}>
							<Text
								style={[
									styles.attendance,
									{
										fontSize: RFValue(18),
										color: attendanceStats.quarterly
											.meetsRequirement
											? colors.success
											: colors.error,
									},
								]}
							>
								{isLoading
									? '...'
									: `${attendanceStats.quarterly.percentage}%`}
							</Text>
							{!isLoading &&
								attendanceStats.quarterly.meetsRequirement !==
									null && (
									<Text
										style={[
											styles.requirementText,
											{
												color: attendanceStats.quarterly
													.meetsRequirement
													? colors.success
													: colors.error,
												fontSize: RFValue(12),
											},
										]}
									>
										{attendanceStats.quarterly
											.meetsRequirement
											? '✓ Meets 60% requirement'
											: '✗ Below 60% requirement'}
									</Text>
								)}
						</View>
					</View>
					<View style={styles.header}>
						<Text
							style={[
								styles.subHeader,
								{ fontSize: RFValue(12) },
							]}
						>
							Monthly Attendance
						</Text>
						<Text
							style={[
								styles.subHeader,
								{ fontSize: RFValue(12) },
							]}
						>
							Quarterly
						</Text>
					</View>
				</View>
				<SummaryData selectedMonth={selectedMonth} />
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: colors.background.primary,
	},
	shadowContainer: {
		borderRadius: 12,
		boxShadow:
			'0px 0px 10px rgba(0, 0, 0, 0.1), 0px 10px 15px -3px rgba(0, 0, 0, 0.1)',
		gap: 24,
		flexDirection: 'column',
		padding: 24,
	},
	headerContainer: {
		flexDirection: 'column',
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	attendance: {
		color: colors.text.primary,
		fontFamily: fonts.PoppinsMedium,
	},
	quarterlyContainer: {
		alignItems: 'flex-end',
	},
	requirementText: {
		fontFamily: fonts.PoppinsRegular,
		marginTop: 2,
		fontWeight: 600,
	},
	subHeader: {
		color: colors.text.secondary,
		fontFamily: fonts.PoppinsRegular,
	},
});

export default Summary;
