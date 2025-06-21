import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import WatermelonService from '../services/watermelon';
import { RootState } from '../store/store';
import { MainStackParamList } from '../types/navigation';
import AuthenticatedNavigator from './AuthenticatedNavigator';
import LoadingNavigator from './LoadingNavigator';
import WelcomeNavigator from './WelcomeNavigator';

const Stack = createNativeStackNavigator<MainStackParamList>();

const MainNavigator: () => React.JSX.Element = () => {
	const { isLoggedIn } = useSelector((state: RootState) => state.user);

	// Initialize database when the app starts
	useEffect(() => {
		const initializeDatabase = async () => {
			try {
				await WatermelonService.getInstance().ensureDatabaseReady();
				console.log('Database initialized in MainNavigator');
			} catch (error) {
				console.error(
					'Failed to initialize database in MainNavigator:',
					error
				);
			}
		};

		initializeDatabase();
	}, []);

	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			{isLoggedIn === true && (
				<Stack.Screen
					name='AuthenticatedStack'
					component={AuthenticatedNavigator}
					options={{ headerShown: false }}
				/>
			)}
			{isLoggedIn === false && (
				<Stack.Screen
					name='WelcomeStack'
					component={WelcomeNavigator}
					options={{ headerShown: false }}
				/>
			)}
			{isLoggedIn === null && (
				<Stack.Screen
					name='LoadingStack'
					component={LoadingNavigator}
					options={{ headerShown: false }}
				/>
			)}
		</Stack.Navigator>
	);
};

export default MainNavigator;
