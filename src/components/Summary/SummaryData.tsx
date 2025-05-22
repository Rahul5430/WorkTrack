import { StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from 'react-native-paper';

import {
	WORK_STATUS,
	WORK_STATUS_COLORS,
	WORK_STATUS_LABELS,
} from '../../constants/workStatus';
import { useResponsiveLayout } from '../../hooks/useResponsive';
import { fonts } from '../../themes';

const SummaryData = () => {
	const { RFValue } = useResponsiveLayout();

	const data = [
		{
			label: WORK_STATUS_LABELS[WORK_STATUS.OFFICE],
			value: 12,
			color: WORK_STATUS_COLORS[WORK_STATUS.OFFICE],
		},
		{
			label: WORK_STATUS_LABELS[WORK_STATUS.WFH],
			value: 5,
			color: WORK_STATUS_COLORS[WORK_STATUS.WFH],
		},
		{
			label: WORK_STATUS_LABELS[WORK_STATUS.HOLIDAY],
			value: 3,
			color: WORK_STATUS_COLORS[WORK_STATUS.HOLIDAY],
		},
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
