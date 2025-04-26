import { Platform } from 'react-native';
import { Theme } from 'react-native-calendars/src/types';

export const fonts = {
	...Platform.select({
		ios: {
			PoppinsBold: 'Poppins-Bold',
			PoppinsMedium: 'Poppins-Medium',
			PoppinsRegular: 'Poppins-Regular',
			PoppinsSemiBold: 'Poppins-SemiBold',
		},
		android: {
			PoppinsBold: 'Poppins-Bold',
			PoppinsMedium: 'Poppins-Medium',
			PoppinsRegular: 'Poppins-Regular',
			PoppinsSemiBold: 'Poppins-SemiBold',
		},
	}),
};

export const calendarTheme: Theme = {
	// @ts-expect-error
	'stylesheet.calendar.main': {
		week: {
			marginVertical: 4,
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'flex-start',
			height: 43,
		},
		container: {
			paddingHorizontal: 0,
		},
		emptyDayContainer: {
			alignItems: 'center',
			width: 43,
			height: 43,
		},
		dayContainer: {
			alignItems: 'center',
			width: 43,
			height: 43,
		},
	},
	'stylesheet.calendar-list.main': {
		calendar: {
			paddingHorizontal: 2,
		},
	},
};
