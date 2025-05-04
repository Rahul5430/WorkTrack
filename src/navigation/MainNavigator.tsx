import { GOOGLE_SIGN_IN_CLIENT_ID } from '@env';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../store/store';
import { MainStackParamList } from '../types/navigation';
import AuthenticatedStack from './AuthenticatedNavigator';
import LoadingNavigator from './LoadingNavigator';
import WelcomeNavigator from './WelcomeNavigator';

GoogleSignin.configure({
	webClientId: GOOGLE_SIGN_IN_CLIENT_ID,
});

const Stack = createNativeStackNavigator<MainStackParamList>();

const MainNavigator: () => React.JSX.Element = () => {
	const { isLoggedIn } = useSelector((state: RootState) => state.user);

	// Set an initializing state whilst Firebase connects
	const [initializing, setInitializing] = useState(true);
	const [user, setUser] = useState();

	// Handle user state changes
	const onAuthStateChanged = (user: any) => {
		setUser(user);
		if (initializing) setInitializing(false);
	};

	useEffect(() => {
		const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
		return subscriber; // unsubscribe on unmount
	}, []);

	console.log('user', user);

	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			{isLoggedIn === true && (
				<Stack.Screen
					name='AuthenticatedStack'
					component={AuthenticatedStack}
				/>
			)}
			{isLoggedIn === false && (
				<Stack.Screen
					name='WelcomeStack'
					component={WelcomeNavigator}
				/>
			)}
			{isLoggedIn === null && (
				<Stack.Screen
					name='LoadingStack'
					component={LoadingNavigator}
				/>
			)}
		</Stack.Navigator>
	);
};

export default MainNavigator;
