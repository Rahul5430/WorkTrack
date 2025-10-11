import { NavigationContainer } from '@react-navigation/native';
import { render } from '@testing-library/react-native';
import React from 'react';

import MainNavigator from '../../../src/navigation/MainNavigator';

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
	NavigationContainer: ({ children }: { children: React.ReactNode }) =>
		children,
}));

jest.mock('@react-navigation/native-stack', () => ({
	createNativeStackNavigator: () => ({
		Navigator: ({ children }: { children: React.ReactNode }) => children,
		Screen: ({ children }: { children: React.ReactNode }) => children,
	}),
}));

// Mock Redux
jest.mock('react-redux', () => ({
	useSelector: jest.fn(),
	useDispatch: jest.fn(),
}));

// Mock hooks
jest.mock('../../../src/hooks/useWorkTrackManager', () => ({
	useWorkTrackManager: jest.fn(() => ({
		userManagement: {
			ensureDatabaseReady: jest.fn(),
		},
	})),
}));

// Mock logging
jest.mock('../../../src/logging', () => ({
	logger: {
		info: jest.fn(),
		error: jest.fn(),
	},
}));

// Mock other navigators
jest.mock(
	'../../../src/navigation/AuthenticatedNavigator',
	() => 'AuthenticatedNavigator'
);
jest.mock('../../../src/navigation/WelcomeNavigator', () => 'WelcomeNavigator');
jest.mock('../../../src/navigation/LoadingNavigator', () => 'LoadingNavigator');

describe('MainNavigator', () => {
	const mockUseSelector = require('react-redux').useSelector;
	const mockUseWorkTrackManager =
		require('../../../src/hooks/useWorkTrackManager').useWorkTrackManager;

	beforeEach(() => {
		jest.clearAllMocks();
		// Reset the mock to return the default implementation
		mockUseWorkTrackManager.mockReturnValue({
			userManagement: {
				ensureDatabaseReady: jest.fn(),
			},
		});
	});

	it('renders without crashing when user is logged in', () => {
		mockUseSelector.mockReturnValue({ isLoggedIn: true });

		expect(() => {
			render(
				<NavigationContainer>
					<MainNavigator />
				</NavigationContainer>
			);
		}).not.toThrow();
	});

	it('renders without crashing when user is not logged in', () => {
		mockUseSelector.mockReturnValue({ isLoggedIn: false });

		expect(() => {
			render(
				<NavigationContainer>
					<MainNavigator />
				</NavigationContainer>
			);
		}).not.toThrow();
	});

	it('renders without crashing when user state is undefined', () => {
		mockUseSelector.mockReturnValue({ isLoggedIn: undefined });

		expect(() => {
			render(
				<NavigationContainer>
					<MainNavigator />
				</NavigationContainer>
			);
		}).not.toThrow();
	});

	it('renders without crashing when user state is null (loading)', () => {
		mockUseSelector.mockReturnValue({ isLoggedIn: null });

		expect(() => {
			render(
				<NavigationContainer>
					<MainNavigator />
				</NavigationContainer>
			);
		}).not.toThrow();
	});

	it('handles database initialization error gracefully', async () => {
		const mockEnsureDatabaseReady = jest
			.fn()
			.mockRejectedValue(new Error('Database error'));
		const mockLogger = require('../../../src/logging').logger;

		// Mock useWorkTrackManager to return a failing ensureDatabaseReady
		mockUseWorkTrackManager.mockImplementation(() => ({
			userManagement: {
				ensureDatabaseReady: mockEnsureDatabaseReady,
			},
		}));

		mockUseSelector.mockReturnValue({ isLoggedIn: true });

		// Render the component - the error should be caught and logged
		render(
			<NavigationContainer>
				<MainNavigator />
			</NavigationContainer>
		);

		// Wait for the async operation to complete
		await new Promise((resolve) => setTimeout(resolve, 100));

		// Verify that the error was logged
		expect(mockLogger.error).toHaveBeenCalledWith(
			'Failed to initialize database in MainNavigator:',
			{ error: expect.any(Error) }
		);

		// Reset the mock for other tests
		mockUseWorkTrackManager.mockReset();
	});
});
