import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoadingScreen from '../screens/LoadingScreen';
import {
	LoadingStackParamList,
	MainStackScreenProps,
} from '../types/navigation';

const Stack = createNativeStackNavigator<LoadingStackParamList>();

const LoadingNavigator: React.FC<MainStackScreenProps<'LoadingStack'>> = () => {
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name='LoadingScreen' component={LoadingScreen} />
		</Stack.Navigator>
	);
};

export default LoadingNavigator;
