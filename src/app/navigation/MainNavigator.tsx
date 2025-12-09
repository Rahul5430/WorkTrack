// migrated to V2 structure
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';

import { HomeScreen } from '@/features/attendance/ui/screens';
import { ProfileScreen } from '@/features/sharing/ui/screens';

import type { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

export function MainNavigator() {
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
