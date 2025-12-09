// migrated to V2 structure
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import * as React from 'react';
import { useSelector } from 'react-redux';

import { initializeRuntime } from '@/app/initialization/bootstrap';
import { RootState } from '@/app/store/store';

import { AuthNavigator } from './AuthNavigator';
import { LoadingNavigator } from './LoadingNavigator';
import { MainNavigator } from './MainNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
	const isLoading = useSelector((s: RootState) => s.user.loading);
	const isLoggedIn = useSelector((s: RootState) => s.user.isLoggedIn);

	useEffect(() => {
		initializeRuntime().catch(() => {});
	}, []);

	return (
		<NavigationContainer>
			<Stack.Navigator screenOptions={{ headerShown: false }}>
				{isLoggedIn === true && !isLoading && (
					<Stack.Screen
						name='MainStack'
						component={MainNavigator}
						options={{ headerShown: false }}
					/>
				)}
				{isLoggedIn === false && !isLoading && (
					<Stack.Screen
						name='AuthStack'
						component={AuthNavigator}
						options={{ headerShown: false }}
					/>
				)}
				{(isLoggedIn === null || isLoading) && (
					<Stack.Screen
						name='LoadingStack'
						component={LoadingNavigator}
						options={{ headerShown: false }}
					/>
				)}
			</Stack.Navigator>
		</NavigationContainer>
	);
}
