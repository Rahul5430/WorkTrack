import { Platform } from 'react-native';

// Font exports
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

// Color exports
export * from './colors';

// Theme exports
export * from './theme';
