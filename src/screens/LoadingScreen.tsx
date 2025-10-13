import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';

import { FocusAwareStatusBar } from '../components';
import { loadWorkTrackDataFromDB } from '../db/watermelon/worktrack/load';
import { useResponsiveLayout } from '../hooks';
import {
	setErrorMessage,
	setLoggedIn,
	setUser,
} from '../store/reducers/userSlice';
import { setWorkTrackData } from '../store/reducers/workTrackSlice';
import { LoadingStackScreenProps } from '../types';

const LoadingScreen: React.FC<
	LoadingStackScreenProps<'LoadingScreen'>
> = () => {
	const dispatch = useDispatch();
	const { RFValue } = useResponsiveLayout();

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
		<View style={styles.screen}>
			<FocusAwareStatusBar
				barStyle='dark-content'
				translucent
				backgroundColor='transparent'
			/>
			<ActivityIndicator size={RFValue(50)} />
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
