import { StyleSheet, Text, View } from 'react-native';

import { useResponsiveLayout } from '../../hooks/useResponsive';
import { fonts } from '../../themes';
import SummaryData from './SummaryData';

const Summary = () => {
	const { getResponsiveSize, RFValue } = useResponsiveLayout();

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
									color: '#2196F3',
									fontFamily: fonts.PoppinsBold,
									fontSize: RFValue(24),
								},
							]}
						>
							65%
						</Text>
						<Text
							style={[
								styles.attendance,
								{ fontSize: RFValue(18) },
							]}
						>
							70%
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
		backgroundColor: 'white',
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
		color: '#000',
		fontFamily: fonts.PoppinsMedium,
	},
	subHeader: {
		color: '#4B5563',
		fontFamily: fonts.PoppinsRegular,
	},
});
export default Summary;
