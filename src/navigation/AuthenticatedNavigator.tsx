import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/Authenticated/HomeScreen';
import {
	AuthenticatedStackParamList,
	MainStackScreenProps,
} from '../types/navigation';

const Stack = createNativeStackNavigator<AuthenticatedStackParamList>();

const AuthenticatedNavigator: React.FC<
	MainStackScreenProps<'AuthenticatedStack'>
> = () => {
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name='HomeScreen' component={HomeScreen} />
		</Stack.Navigator>
	);
};

export default AuthenticatedNavigator;
