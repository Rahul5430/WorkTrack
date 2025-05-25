import { View } from 'react-native';
import { CalendarList } from 'react-native-calendars';

import { WORK_STATUS } from '../../constants/workStatus';
import { useCalendarData } from '../../hooks/useCalendarData';
import { useResponsiveLayout } from '../../hooks/useResponsive';
import { calendarTheme } from '../../themes';
import CalendarDay from './CalendarDay';
import CustomCalendarHeader from './CalendarHeader';
import SyncStatus from './SyncStatus';

type CalendarComponentProps = {
	onDatePress?: (date: string) => void;
};

const CalendarComponent = ({ onDatePress }: CalendarComponentProps) => {
	const { getResponsiveSize } = useResponsiveLayout();
	const { syncStatus, markedDays } = useCalendarData();

	const handlePressDate = (date: string) => {
		if (onDatePress) {
			onDatePress(date);
		}
	};

	const isCurrentMonth = (dateString: string) => {
		const date = new Date(dateString);
		const today = new Date();
		return (
			date.getMonth() === today.getMonth() &&
			date.getFullYear() === today.getFullYear()
		);
	};

	return (
		<View style={{ paddingHorizontal: getResponsiveSize(5).width }}>
			<SyncStatus status={syncStatus} />
			<CalendarList
				calendarWidth={getResponsiveSize(90).width}
				calendarHeight={getResponsiveSize(90).width}
				horizontal
				pagingEnabled
				staticHeader
				showScrollIndicator={false}
				hideArrows
				customHeader={CustomCalendarHeader}
				monthFormat='MMMM yyyy'
				headerStyle={{ display: 'none' }}
				markingType='custom'
				theme={calendarTheme}
				dayComponent={({ date }) => {
					const dateString = date?.dateString ?? '';
					const dayNumber = date?.day ?? 0;
					const isToday =
						new Date().toISOString().split('T')[0] === dateString;

					const type = markedDays[dateString] || WORK_STATUS.HOLIDAY;

					return (
						<CalendarDay
							key={dateString}
							day={dayNumber}
							dateString={dateString}
							onPress={handlePressDate}
							type={type}
							isToday={isToday}
							isCurrentMonth={isCurrentMonth(dateString)}
						/>
					);
				}}
			/>
		</View>
	);
};

export default CalendarComponent;
