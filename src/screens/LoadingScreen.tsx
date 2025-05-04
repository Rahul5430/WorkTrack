import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';

import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import { loadWorkTrackDataFromDB } from '../db/watermelon/worktrack/load';
import { useResponsiveLayout } from '../hooks/useResponsive';
import { setLoggedIn, setUser } from '../store/reducers/userSlice';
import { setWorkTrackData } from '../store/reducers/workTrackSlice';
import { LoadingStackScreenProps } from '../types/navigation';

const LoadingScreen: React.FC<
	LoadingStackScreenProps<'LoadingScreen'>
> = () => {
	const dispatch = useDispatch();
	const { RFValue } = useResponsiveLayout();

	const restoreAppData = async () => {
		try {
			const rawUser = await AsyncStorage.getItem('user');

			if (rawUser) {
				const parsedUser = JSON.parse(rawUser);

				// Optionally: Validate token here if backend exists
				dispatch(setUser(parsedUser));
				dispatch(setLoggedIn(true));

				// Load WatermelonDB local data
				const localWorkTrackData = await loadWorkTrackDataFromDB();
				dispatch(setWorkTrackData(localWorkTrackData));
			} else {
				dispatch(setLoggedIn(false));
			}
		} catch (err) {
			console.error('❌ Error restoring app data:', err);
			dispatch(setLoggedIn(false));
		}
	};

	useEffect(() => {
		restoreAppData();
	}, []);

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
