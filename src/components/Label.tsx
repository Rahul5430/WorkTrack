import { StyleSheet, Text, View } from 'react-native';

import Building from '../assets/icons/building.svg';
import Forecast from '../assets/icons/forecast.svg';
import Home from '../assets/icons/home.svg';
import Plus from '../assets/icons/plus.svg';
import { WORK_STATUS, WORK_STATUS_LABELS } from '../constants/workStatus';
import { useResponsiveLayout } from '../hooks/useResponsive';
import { fonts } from '../themes';
import { colors } from '../themes/colors';

const Label = () => {
	const { RFValue, getResponsiveSize } = useResponsiveLayout();

	const labels = [
		{
			label: WORK_STATUS_LABELS[WORK_STATUS.OFFICE],
			Icon: Building,
			color: colors.background.office,
		},
		{
			label: WORK_STATUS_LABELS[WORK_STATUS.WFH],
			Icon: Home,
			color: colors.background.wfh,
		},
		{
			label: WORK_STATUS_LABELS[WORK_STATUS.HOLIDAY],
			Icon: Plus,
			color: colors.background.holiday,
		},
		{
			label: 'Forecast',
			Icon: Forecast,
			color: colors.background.forecast,
		},
	];

	return (
		<View
			style={[
				styles.container,
				{ paddingHorizontal: getResponsiveSize(5).width },
			]}
		>
			{labels.map(({ label, Icon, color }) => (
				<View
					key={label}
					style={[
						styles.item,
						label === 'Forecast' ? styles.lastItem : { flex: 1 },
						{ backgroundColor: color },
					]}
				>
					<Icon width={16} height={16} />
					<Text
						style={[
							styles.label,
							{
								fontSize: RFValue(12),
								color: color.substring(0, 7),
							},
						]}
					>
						{label}
					</Text>
				</View>
			))}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		height: 36,
		marginVertical: 24,
		gap: 8,
	},
	item: {
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 12,
		paddingLeft: 8,
		gap: 4,
	},
	lastItem: {
		justifyContent: 'center',
		paddingLeft: 0,
		width: 90,
	},
	label: {
		fontFamily: fonts.PoppinsMedium,
	},
});

export default Label;
