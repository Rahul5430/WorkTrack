import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthenticatedStack from './AuthenticatedStack';

const Stack = createNativeStackNavigator();

const MainNavigator: () => React.JSX.Element = () => {
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
