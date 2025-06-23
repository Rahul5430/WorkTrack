import { StyleSheet, Text, View } from 'react-native';

import Building from '../../assets/icons/building.svg';
import Forecast from '../../assets/icons/forecast.svg';
import Home from '../../assets/icons/home.svg';
import Plus from '../../assets/icons/plus.svg';
import { WORK_STATUS, WORK_STATUS_LABELS } from '../../constants/workStatus';
import { useResponsiveLayout } from '../../hooks';
import { fonts } from '../../themes';
import { colors } from '../../themes/colors';

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
			label: WORK_STATUS_LABELS[WORK_STATUS.LEAVE],
			Icon: Plus,
			color: colors.background.error,
		},
		{
			label: WORK_STATUS_LABELS[WORK_STATUS.ADVISORY],
			Icon: Forecast,
			color: colors.background.forecast,
		},
	];

	const firstRow = labels.slice(0, 3);
	const secondRow = labels.slice(3);

	return (
		<View
			style={[
				styles.container,
				{ paddingHorizontal: getResponsiveSize(5).width },
			]}
		>
			<View style={styles.row}>
				{firstRow.map(({ label, Icon, color }) => (
					<View
						key={label}
						style={[
							styles.item,
							{ flex: 1, backgroundColor: color },
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
			<View style={styles.row}>
				{secondRow.map(({ label, Icon, color }) => (
					<View
						key={label}
						style={[
							styles.item,
							{ flex: 1, backgroundColor: color },
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
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'column',
		// height: 80,
		marginVertical: 24,
		gap: 8,
	},
	row: {
		flexDirection: 'row',
		gap: 8,
	},
	item: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 12,
		gap: 6,
		height: 36,
		paddingHorizontal: 12,
		shadowColor: colors.text.primary,
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3,
		elevation: 2,
	},
	label: {
		fontFamily: fonts.PoppinsMedium,
		textTransform: 'capitalize',
	},
});

export default Label;
