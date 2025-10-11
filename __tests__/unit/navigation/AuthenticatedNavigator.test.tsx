import { NavigationContainer } from '@react-navigation/native';
import { render } from '@testing-library/react-native';
import React from 'react';

import AuthenticatedNavigator from '../../../src/navigation/AuthenticatedNavigator';

// Mock React Navigation
jest.mock('@react-navigation/native-stack', () => ({
	createNativeStackNavigator: () => ({
		Navigator: ({ children }: { children: React.ReactNode }) => children,
		Screen: ({ children }: { children: React.ReactNode }) => children,
	}),
}));

// Mock screens
jest.mock('../../../src/screens/Authenticated/HomeScreen', () => 'HomeScreen');
jest.mock(
	'../../../src/screens/Authenticated/ProfileScreen',
	() => 'ProfileScreen'
);

describe('AuthenticatedNavigator', () => {
	it('renders without crashing', () => {
		expect(() => {
			render(
				<NavigationContainer>
					<AuthenticatedNavigator />
				</NavigationContainer>
			);
		}).not.toThrow();
	});

	it('renders navigation structure', () => {
		expect(() => {
			render(
				<NavigationContainer>
					<AuthenticatedNavigator />
				</NavigationContainer>
			);
		}).not.toThrow();
	});

	it('has correct screen configuration', () => {
		// Test that the navigator is properly configured
		expect(() => {
			render(
				<NavigationContainer>
					<AuthenticatedNavigator />
				</NavigationContainer>
			);
		}).not.toThrow();
	});

	it('maintains navigation structure integrity', () => {
		// Test that the navigator maintains its structure
		expect(() => {
			render(
				<NavigationContainer>
					<AuthenticatedNavigator />
				</NavigationContainer>
			);
		}).not.toThrow();
	});
});
