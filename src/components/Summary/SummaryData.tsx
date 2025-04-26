import { StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from 'react-native-paper';

import { useResponsiveLayout } from '../../hooks/useResponsive';
import { fonts } from '../../themes';

const SummaryData = () => {
	const { RFValue } = useResponsiveLayout();

	const data = [
		{ label: 'Office Days', value: 12, color: '#2196F3' },
		{ label: 'WFH Days', value: 5, color: '#4CAF50' },
		{ label: 'Holidays', value: 3, color: '#FF9800' },
		{ label: 'Required', value: 3, color: '#FF9800' },
	];
	const workingDaysInMonth = 22;

	return (
		<View style={styles.container}>
			{data.map(({ label, value, color }) => (
				<View style={styles.item} key={`${label}-${value}-${color}`}>
					<View style={styles.dayContainer}>
						<Text
							style={{
								fontFamily: fonts.PoppinsMedium,
								fontSize: RFValue(14),
							}}
						>
							{label}
						</Text>
						<Text
							style={{
								fontFamily: fonts.PoppinsRegular,
								fontSize: RFValue(14),
							}}
						>
							{value} days
						</Text>
					</View>
					<ProgressBar
						progress={value / workingDaysInMonth}
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
		backgroundColor: '#F3F4F6',
		height: 8,
		borderRadius: 9999,
	},
});

export default SummaryData;
