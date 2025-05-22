import { View } from 'react-native';
import { CalendarList } from 'react-native-calendars';

import { WORK_STATUS } from '../../constants/workStatus';
import { useResponsiveLayout } from '../../hooks/useResponsive';
import { calendarTheme } from '../../themes';
import CalendarDay from './CalendarDay';
import CustomCalendarHeader from './CalendarHeader';

type DataType = {
	[key: string]: string;
};

type CalendarComponentProps = {
	onDatePress: (date: string) => void;
};

const OFFICE_DAYS = WORK_STATUS.OFFICE;
const WFH_DAYS = WORK_STATUS.WFH;

const CalendarComponent = ({ onDatePress }: CalendarComponentProps) => {
	const { getResponsiveSize } = useResponsiveLayout();

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

	const handlePressDate = (date: string) => {
		if (onDatePress) {
			onDatePress(date);
		}
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
					const dateString = date?.dateString ?? '';
					const dayNumber = date?.day ?? 0;

					const type =
						data[dateString] === OFFICE_DAYS
							? WORK_STATUS.OFFICE
							: data[dateString] === WFH_DAYS
								? WORK_STATUS.WFH
								: WORK_STATUS.HOLIDAY;

					return (
						<CalendarDay
							day={dayNumber}
							dateString={dateString}
							type={type}
							onPress={handlePressDate}
						/>
					);
				}}
			/>
		</View>
	);
};

export default CalendarComponent;
