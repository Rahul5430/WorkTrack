import { GOOGLE_SIGN_IN_CLIENT_ID } from '@env';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';

import AuthenticatedStack from './AuthenticatedStack';

GoogleSignin.configure({
	webClientId: GOOGLE_SIGN_IN_CLIENT_ID,
});

const Stack = createNativeStackNavigator();

const MainNavigator: () => React.JSX.Element = () => {
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
			<Stack.Screen
				name='AuthenticatedStack'
				component={AuthenticatedStack}
			/>
		</Stack.Navigator>
	);
};

export default MainNavigator;
