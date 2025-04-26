import { StyleSheet, Text, View } from 'react-native';

import Building from '../assets/icons/building.svg';
import Forecast from '../assets/icons/forecast.svg';
import Home from '../assets/icons/home.svg';
import Plus from '../assets/icons/plus.svg';
import { useResponsiveLayout } from '../hooks/useResponsive';
import { fonts } from '../themes';

const Label = () => {
	const { RFValue, getResponsiveSize } = useResponsiveLayout();

	const labels = [
		{ label: 'Office', Icon: Building, color: '#2196F315' },
		{ label: 'WFH', Icon: Home, color: '#4CAF5015' },
		{ label: 'Holiday', Icon: Plus, color: '#FF525215' },
		{ label: 'Forecast', Icon: Forecast, color: '#9C27B015' },
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
