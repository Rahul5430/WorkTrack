import { StyleSheet, Text, View } from 'react-native';
import { CalendarList } from 'react-native-calendars';

import { useResponsiveLayout } from '../../hooks/useResponsive';
import { calendarTheme, fonts } from '../../themes';
import CustomCalendarHeader from './CalendarHeader';

type DataType = {
	[key: string]: string;
};

const OFFICE_DAYS = 'officeDays';
const WFH_DAYS = 'wfhDays';

const CalendarComponent = () => {
	const { getResponsiveSize, RFValue } = useResponsiveLayout();

	const data: DataType = {
		'2025-04-01': OFFICE_DAYS,
		'2025-04-04': OFFICE_DAYS,
		'2025-04-05': WFH_DAYS,
		'2025-04-07': OFFICE_DAYS,
		'2025-04-09': WFH_DAYS,
		'2025-04-10': OFFICE_DAYS,
		'2025-04-13': OFFICE_DAYS,
		'2025-04-16': OFFICE_DAYS,
		'2025-04-17': WFH_DAYS,
		'2025-04-19': OFFICE_DAYS,
		'2025-04-21': WFH_DAYS,
		'2025-04-22': OFFICE_DAYS,
		'2025-04-25': OFFICE_DAYS,
		'2025-04-28': OFFICE_DAYS,
		'2025-04-29': WFH_DAYS,
	};

	return (
		<View style={{ paddingHorizontal: getResponsiveSize(5).width }}>
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
				dayComponent={({ date }) => {
					const isOfficeDay =
						(date?.dateString && data[date?.dateString]) ===
						OFFICE_DAYS;

					const isWfhDay =
						(date?.dateString && data[date?.dateString]) ===
						WFH_DAYS;

					return (
						<View
							style={[
								styles.dayStyle,
								isOfficeDay && {
									backgroundColor: '#2196F3',
								},
								isWfhDay && {
									backgroundColor: '#4CAF50',
								},
							]}
						>
							<Text
								style={[
									styles.dayTextStyle,
									(isOfficeDay || isWfhDay) && {
										color: '#fff',
									},

									{
										fontSize: RFValue(14),
									},
								]}
							>
								{date?.day}
							</Text>
						</View>
					);
				}}
			/>
		</View>
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
