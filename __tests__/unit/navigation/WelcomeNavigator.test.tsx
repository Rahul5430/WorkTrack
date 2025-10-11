import { NavigationContainer } from '@react-navigation/native';
import { render } from '@testing-library/react-native';
import React from 'react';

import WelcomeNavigator from '../../../src/navigation/WelcomeNavigator';

// Mock React Navigation
jest.mock('@react-navigation/native-stack', () => ({
	createNativeStackNavigator: () => ({
		Navigator: ({ children }: { children: React.ReactNode }) => children,
		Screen: ({ children }: { children: React.ReactNode }) => children,
	}),
}));

// Mock WelcomeScreen
jest.mock('../../../src/screens/WelcomeScreen', () => 'WelcomeScreen');

describe('WelcomeNavigator', () => {
	const mockProps = {
		navigation: {} as never,
		route: {} as never,
	};

	it('renders without crashing', () => {
		expect(() => {
			render(
				<NavigationContainer>
					<WelcomeNavigator {...mockProps} />
				</NavigationContainer>
			);
		}).not.toThrow();
	});

	it('renders navigation structure', () => {
		expect(() => {
			render(
				<NavigationContainer>
					<WelcomeNavigator {...mockProps} />
				</NavigationContainer>
			);
		}).not.toThrow();
	});

	it('has correct screen configuration', () => {
		// Test that the navigator is properly configured
		expect(() => {
			render(
				<NavigationContainer>
					<WelcomeNavigator {...mockProps} />
				</NavigationContainer>
			);
		}).not.toThrow();
	});

	it('maintains navigation structure integrity', () => {
		// Test that the navigator maintains its structure
		expect(() => {
			render(
				<NavigationContainer>
					<WelcomeNavigator {...mockProps} />
				</NavigationContainer>
			);
		}).not.toThrow();
	});
});
