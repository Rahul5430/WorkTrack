import { Platform } from 'react-native';

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
