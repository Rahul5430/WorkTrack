import { StyleSheet, Text, View } from 'react-native';
import { CalendarList } from 'react-native-calendars';

import { useResponsiveLayout } from '../../hooks/useResponsive';
import { calendarTheme, fonts } from '../../themes';
import CustomCalendarHeader from './CalendarHeader';

const CalendarComponent = () => {
	const { getResponsiveSize, RFValue } = useResponsiveLayout();

	return (
		<CalendarList
			calendarWidth={getResponsiveSize(90).width}
			calendarHeight={getResponsiveSize(90).width}
			horizontal
			pagingEnabled
			staticHeader
			showScrollIndicator={false}
			// hideExtraDays={false}
			hideArrows
			customHeader={CustomCalendarHeader}
			monthFormat='MMMM yyyy'
			headerStyle={{ display: 'none' }}
			markingType='custom'
			theme={calendarTheme}
			dayComponent={({ date }) => (
				<View style={styles.dayStyle}>
					<Text
						style={
							(styles.dayTextStyle,
							[
								{
									fontSize: RFValue(14),
								},
							])
						}
						numberOfLines={1}
					>
						{date?.day}
					</Text>
				</View>
			)}
		/>
	);
};

const styles = StyleSheet.create({
	dayStyle: {
		backgroundColor: '#F3F4F6',
		borderRadius: 8,
		width: 43,
		height: 43,
		justifyContent: 'center',
		alignItems: 'center',
	},
	dayTextStyle: {
		fontFamily: fonts.PoppinsRegular,
	},
});

export default CalendarComponent;
