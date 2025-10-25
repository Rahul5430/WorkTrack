import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ViewProps } from 'react-native';

import { useResponsiveLayout } from '@/hooks/useResponsive';
import { fonts } from '@/themes';
import { colors } from '@/themes/colors';

export interface CalendarHeaderProps {
	/** The current month presented in the calendar */
	month: Date;
	/** Callback for header onLayout */
	onHeaderLayout?: ViewProps['onLayout'];
	/** Horizontal padding to match calendar alignment */
	horizontalPadding?: number;
}

const CalendarHeader = (props: CalendarHeaderProps) => {
	const { month, onHeaderLayout, horizontalPadding } = props;

	const { RFValue, getResponsiveMargin } = useResponsiveLayout();
	const responsivePadding = horizontalPadding ?? getResponsiveMargin(5);

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
	}, [RFValue]);

	return (
		<View
			onLayout={onHeaderLayout}
			style={{ paddingHorizontal: responsivePadding }}
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
			<View style={styles.weekContainer}>
				<View style={styles.week}>{renderWeekDays}</View>
			</View>
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
		marginTop: 4,
		flexDirection: 'row',
		justifyContent: 'space-around',
	},
	weekContainer: {
		paddingTop: 4,
		paddingBottom: 3,
	},
	dayHeader: {
		marginTop: 1,
		marginBottom: 4,
		width: 32,
		textAlign: 'center',
		fontFamily: fonts.PoppinsMedium,
		color: colors.text.secondary,
	},
});

export default CalendarHeader;
