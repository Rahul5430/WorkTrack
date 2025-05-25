import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';

import { WORK_STATUS } from '../../constants/workStatus';
import { useResponsiveLayout } from '../../hooks/useResponsive';
import { RootState } from '../../store/store';
import { fonts } from '../../themes';
import { colors } from '../../themes/colors';
import SummaryData from './SummaryData';

const Summary = () => {
	const { getResponsiveSize, RFValue } = useResponsiveLayout();
	const workTrackData = useSelector(
		(state: RootState) => state.workTrack.data
	);

	const attendanceStats = useMemo(() => {
		const currentMonth = new Date().getMonth();
		const currentYear = new Date().getFullYear();
		const currentQuarter = Math.floor(currentMonth / 3);

		const monthData = workTrackData.filter((entry) => {
			const entryDate = new Date(entry.date);
			return (
				entryDate.getMonth() === currentMonth &&
				entryDate.getFullYear() === currentYear
			);
		});

		const quarterData = workTrackData.filter((entry) => {
			const entryDate = new Date(entry.date);
			const entryQuarter = Math.floor(entryDate.getMonth() / 3);
			return (
				entryDate.getFullYear() === currentYear &&
				entryQuarter === currentQuarter
			);
		});

		const calculateAttendance = (data: typeof workTrackData) => {
			const workingDays = data.filter(
				(entry) =>
					entry.status === WORK_STATUS.OFFICE ||
					entry.status === WORK_STATUS.WFH
			).length;

			const totalDays = data.length;
			return totalDays > 0
				? Math.round((workingDays / totalDays) * 100)
				: 0;
		};

		return {
			monthly: calculateAttendance(monthData),
			quarterly: calculateAttendance(quarterData),
		};
	}, [workTrackData]);

	return (
		<View
			style={[
				styles.container,
				{
					paddingHorizontal: getResponsiveSize(5).width,
					marginBottom: getResponsiveSize(10).width,
					height: 288,
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
							{attendanceStats.monthly}%
						</Text>
						<Text
							style={[
								styles.attendance,
								{ fontSize: RFValue(18) },
							]}
						>
							{attendanceStats.quarterly}%
						</Text>
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
				<SummaryData />
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
	subHeader: {
		color: colors.text.secondary,
		fontFamily: fonts.PoppinsRegular,
	},
});

export default Summary;
