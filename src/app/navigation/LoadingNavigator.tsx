// migrated to V2 structure
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';

import { LoadingScreen } from '@/features/auth/ui/screens';

import type { LoadingStackParamList } from './types';

const Stack = createNativeStackNavigator<LoadingStackParamList>();

export function LoadingNavigator() {
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name='LoadingScreen' component={LoadingScreen} />
		</Stack.Navigator>
	);
}
