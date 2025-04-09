import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/Authenticated/HomeScreen';

const Stack = createNativeStackNavigator();

const AuthenticatedStack: () => React.JSX.Element = () => {
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name='HomeScreen' component={HomeScreen} />
		</Stack.Navigator>
	);
};

export default AuthenticatedStack;
