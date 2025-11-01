// migrated to V2 structure
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';

import { WelcomeScreen } from '@/features/auth/ui/screens';

import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name='WelcomeScreen' component={WelcomeScreen} />
		</Stack.Navigator>
	);
}
