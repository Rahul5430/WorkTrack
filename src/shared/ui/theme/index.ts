import { Platform } from 'react-native';

import { colors } from './colors';

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

// Complete theme object
export const theme = {
	colors,
	fonts,
	spacing: {
		xs: 4,
		sm: 8,
		md: 16,
		lg: 24,
		xl: 32,
		xxl: 48,
	},
	typography: {
		h1: {
			fontSize: 32,
			fontWeight: 'bold' as const,
			fontFamily: fonts.PoppinsBold,
		},
		h2: {
			fontSize: 24,
			fontWeight: 'bold' as const,
			fontFamily: fonts.PoppinsBold,
		},
		h3: {
			fontSize: 20,
			fontWeight: '600' as const,
			fontFamily: fonts.PoppinsSemiBold,
		},
		body1: {
			fontSize: 16,
			fontWeight: 'normal' as const,
			fontFamily: fonts.PoppinsRegular,
		},
		body2: {
			fontSize: 14,
			fontWeight: 'normal' as const,
			fontFamily: fonts.PoppinsRegular,
		},
		caption: {
			fontSize: 12,
			fontWeight: 'normal' as const,
			fontFamily: fonts.PoppinsRegular,
		},
	},
} as const;

// Re-export colors for convenience
export * from './colors';
