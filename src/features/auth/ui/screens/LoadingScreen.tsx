import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from '@react-native-firebase/auth';
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
			// First check Firebase auth state to verify actual authentication
			const auth = getAuth();
			const firebaseUser = auth.currentUser;

			// If Firebase has no authenticated user, clear any stale data and show auth screen
			if (!firebaseUser) {
				// Clear stale AsyncStorage data
				await AsyncStorage.removeItem('user');
				dispatch(setLoggedIn(false));
				return;
			}

			// If Firebase has authenticated user, restore from AsyncStorage or use Firebase user
			const rawUser = await AsyncStorage.getItem('user');

			if (rawUser) {
				const parsedUser = JSON.parse(rawUser);
				// Verify the user ID matches Firebase auth
				if (parsedUser.id === firebaseUser.uid) {
					dispatch(setUser(parsedUser));
					dispatch(setLoggedIn(true));

					// Load initial work track data; map to MarkedDay[] when available
					await loadWorkTrackDataFromDB();
					dispatch(setWorkTrackData([]));
				} else {
					// User ID mismatch - clear stale data
					await AsyncStorage.removeItem('user');
					dispatch(setLoggedIn(false));
				}
			} else {
				// No AsyncStorage data but Firebase user exists - create user from Firebase
				const userInfo = {
					id: firebaseUser.uid,
					name: firebaseUser.displayName ?? 'Unknown',
					email: firebaseUser.email ?? 'Unknown',
					photo: firebaseUser.photoURL ?? '',
					workTrackId: undefined,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				};
				await AsyncStorage.setItem('user', JSON.stringify(userInfo));
				dispatch(setUser(userInfo));
				dispatch(setLoggedIn(true));

				// Load initial work track data; map to MarkedDay[] when available
				await loadWorkTrackDataFromDB();
				dispatch(setWorkTrackData([]));
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
