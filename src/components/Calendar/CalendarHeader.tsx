import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ViewProps } from 'react-native';

import { useResponsiveLayout } from '../../hooks/useResponsive';
import { fonts } from '../../themes';
import { colors } from '../../themes/colors';

export interface CalendarHeaderProps {
	/** The current month presented in the calendar */
	month: Date;
	/** Callback for header onLayout */
	onHeaderLayout?: ViewProps['onLayout'];
}

const CalendarHeader = (props: CalendarHeaderProps) => {
	const { month, onHeaderLayout } = props;

	const { RFValue, getResponsiveSize } = useResponsiveLayout();

	const date = new Date(month).toLocaleDateString('en-US', {
		month: 'long',
		year: 'numeric',
	});

	const renderWeekDays = useMemo((): React.JSX.Element[] => {
		const weekDaysNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
		const weekDayPositions = [
			'sunday',
			'monday',
			'tuesday',
			'wednesday',
			'thursday',
			'friday',
			'saturday',
		];

		return weekDaysNames.map((day, index) => (
			<Text
				allowFontScaling={false}
				key={`weekday-${weekDayPositions[index]}`}
				style={[styles.dayHeader, { fontSize: RFValue(14) }]}
				numberOfLines={1}
				accessibilityLabel={weekDayPositions[index]}
			>
				{day}
			</Text>
		));
	}, []);

	return (
		<View
			onLayout={onHeaderLayout}
			style={{ paddingHorizontal: getResponsiveSize(5).width }}
		>
			<View style={styles.header}>
				<View style={styles.headerContainer}>
					<Text
						allowFontScaling={false}
						style={[styles.monthText, { fontSize: RFValue(18) }]}
					>
						{date}
					</Text>
				</View>
			</View>
			<View style={styles.week}>{renderWeekDays}</View>
		</View>
	);
};

const styles = StyleSheet.create({
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	headerContainer: {
		flexDirection: 'row',
	},
	monthText: {
		fontWeight: 300,
		marginVertical: 10,
		fontFamily: fonts.PoppinsMedium,
		color: colors.text.primary,
	},
	week: {
		marginTop: 7,
		flexDirection: 'row',
		justifyContent: 'space-around',
	},
	dayHeader: {
		marginTop: 2,
		marginBottom: 7,
		width: 32,
		textAlign: 'center',
		fontFamily: fonts.PoppinsMedium,
		color: colors.text.secondary,
	},
});

export default CalendarHeader;
