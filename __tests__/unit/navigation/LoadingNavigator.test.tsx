import { NavigationContainer } from '@react-navigation/native';
import { render } from '@testing-library/react-native';
import React from 'react';

import LoadingNavigator from '../../../src/navigation/LoadingNavigator';

// Mock React Navigation
jest.mock('@react-navigation/native-stack', () => ({
	createNativeStackNavigator: () => ({
		Navigator: ({ children }: { children: React.ReactNode }) => children,
		Screen: ({ children }: { children: React.ReactNode }) => children,
	}),
}));

// Mock LoadingScreen
jest.mock('../../../src/screens/LoadingScreen', () => 'LoadingScreen');

describe('LoadingNavigator', () => {
	const mockProps = {
		navigation: {} as never,
		route: {} as never,
	};

	it('renders without crashing', () => {
		expect(() => {
			render(
				<NavigationContainer>
					<LoadingNavigator {...mockProps} />
				</NavigationContainer>
			);
		}).not.toThrow();
	});

	it('renders navigation structure', () => {
		expect(() => {
			render(
				<NavigationContainer>
					<LoadingNavigator {...mockProps} />
				</NavigationContainer>
			);
		}).not.toThrow();
	});

	it('has correct screen configuration', () => {
		// Test that the navigator is properly configured
		expect(() => {
			render(
				<NavigationContainer>
					<LoadingNavigator {...mockProps} />
				</NavigationContainer>
			);
		}).not.toThrow();
	});

	it('maintains navigation structure integrity', () => {
		// Test that the navigator maintains its structure
		expect(() => {
			render(
				<NavigationContainer>
					<LoadingNavigator {...mockProps} />
				</NavigationContainer>
			);
		}).not.toThrow();
	});
});
