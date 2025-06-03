import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import HomeScreen from '../screens/Authenticated/HomeScreen';
import ProfileScreen from '../screens/Authenticated/ProfileScreen';
import { AuthenticatedStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<AuthenticatedStackParamList>();

export default function AuthenticatedNavigator() {
	return (
		<Stack.Navigator>
			<Stack.Screen
				name='HomeScreen'
				component={HomeScreen}
				options={{
					headerShown: false,
					title: 'Home',
				}}
			/>
			<Stack.Screen
				name='ProfileScreen'
				component={ProfileScreen}
				options={{
					headerShown: false,
					title: 'Profile',
				}}
			/>
		</Stack.Navigator>
	);
}
