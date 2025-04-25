import { StyleSheet, Text, View } from 'react-native';

import Building from '../assets/icons/building.svg';
import Forecast from '../assets/icons/forecast.svg';
import Home from '../assets/icons/home.svg';
import Plus from '../assets/icons/plus.svg';
import { useResponsiveLayout } from '../hooks/useResponsive';
import { fonts } from '../themes';

const Label = () => {
	const { RFValue } = useResponsiveLayout();

	const labels = [
		{ label: 'Office', Icon: Building, color: '#2196F315' },
		{ label: 'WFH', Icon: Home, color: '#4CAF5015' },
		{ label: 'Holiday', Icon: Plus, color: '#FF525215' },
		{ label: 'Forecast', Icon: Forecast, color: '#9C27B015' },
	];

	return (
		<View style={styles.container}>
			{labels.map(({ label, Icon, color }) => (
				<View
					key={label}
					style={[styles.item, { backgroundColor: color }]}
				>
					<Icon
						width={16}
						height={16}
						style={{ paddingLeft: 25, paddingRight: 2 }}
					/>
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
		gap: 12,
	},
	item: {
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 12,
		flex: 1,
		// justifyContent: 'space-evenly',
		// width: 78,
		// paddingLeft: 10,
		// gap: 5,
	},
	label: {
		fontFamily: fonts.PoppinsMedium,
	},
});

export default Label;
