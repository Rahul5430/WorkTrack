import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';

import { LoadingStackScreenProps } from '@/app/navigation/types';
import { useTheme } from '@/app/providers';
import {
	setErrorMessage,
	setLoggedIn,
	setUser,
	setWorkTrackData,
} from '@/app/store';
import { loadWorkTrackDataFromDB } from '@/shared/data/database/watermelon/worktrack';
import FocusAwareStatusBar from '@/shared/ui/components/FocusAwareStatusBar';
import { useResponsiveLayout } from '@/shared/ui/hooks/useResponsive';

const LoadingScreen: React.FC<
	LoadingStackScreenProps<'LoadingScreen'>
> = () => {
	const dispatch = useDispatch();
	const { RFValue } = useResponsiveLayout();

	// Example of using the theme
	const theme = useTheme();

	// Example of using the DI container (uncomment when needed):
	// const container = useDI();

	const restoreAppData = useCallback(async () => {
		try {
			const rawUser = await AsyncStorage.getItem('user');

			if (rawUser) {
				const parsedUser = JSON.parse(rawUser);
				dispatch(setUser(parsedUser));
				dispatch(setLoggedIn(true));

				const localWorkTrackData = await loadWorkTrackDataFromDB();
				dispatch(setWorkTrackData(localWorkTrackData));
			} else {
				dispatch(setLoggedIn(false));
			}
		} catch (err) {
			dispatch(setLoggedIn(false));
			dispatch(
				setErrorMessage(
					err instanceof Error
						? err.message
						: 'Failed to restore app data'
				)
			);
		}
	}, [dispatch]);

	useEffect(() => {
		restoreAppData();
	}, [restoreAppData]);

	return (
		<View
			style={[
				styles.screen,
				{ backgroundColor: theme.colors.background.primary },
			]}
		>
			<FocusAwareStatusBar
				barStyle='dark-content'
				translucent
				backgroundColor='transparent'
			/>
			<ActivityIndicator
				size={RFValue(50)}
				color={theme.colors.button.primary}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: 'white',
		justifyContent: 'center',
		alignItems: 'center',
	},
});

export default LoadingScreen;
