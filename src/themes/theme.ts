import { MD3LightTheme } from 'react-native-paper';

import { colors } from './colors';

export const theme = {
	...MD3LightTheme,
	colors: {
		...MD3LightTheme.colors,
		primary: colors.ui.blue[600],
		secondary: colors.ui.blue[400],
		error: colors.error,
		background: colors.background.primary,
		surface: colors.background.primary,
		text: colors.text.primary,
	},
};
