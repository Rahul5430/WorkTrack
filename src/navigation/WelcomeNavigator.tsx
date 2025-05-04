import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from '../screens/WelcomeScreen';
import {
	MainStackScreenProps,
	WelcomeStackParamList,
} from '../types/navigation';

const Stack = createNativeStackNavigator<WelcomeStackParamList>();

const WelcomeNavigator: React.FC<MainStackScreenProps<'WelcomeStack'>> = () => {
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name='WelcomeScreen' component={WelcomeScreen} />
		</Stack.Navigator>
	);
};

export default WelcomeNavigator;
