import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { useResponsiveLayout } from '../hooks/useResponsive';
import HomeScreen from '../screens/Authenticated/HomeScreen';
import ProfileScreen from '../screens/Authenticated/ProfileScreen';
import { fonts } from '../themes';
import { colors } from '../themes/colors';
import { AuthenticatedStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<AuthenticatedStackParamList>();

export default function AuthenticatedNavigator() {
	const { RFValue } = useResponsiveLayout();

	return (
		<Stack.Navigator
			screenOptions={{
				headerStyle: {
					backgroundColor: colors.background.primary,
				},
				headerTitleStyle: {
					fontFamily: fonts.PoppinsSemiBold,
					fontSize: RFValue(20),
					color: colors.text.primary,
				},
			}}
		>
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
					title: 'Profile',
				}}
			/>
		</Stack.Navigator>
	);
}
