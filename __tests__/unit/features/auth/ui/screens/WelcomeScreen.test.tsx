// migrated to V2 structure
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Provider } from 'react-redux';

import { AuthStackScreenProps } from '@/app/navigation/types';
import { userSlice } from '@/app/store/reducers/userSlice';
import { workTrackSlice } from '@/app/store/reducers/workTrackSlice';
import WelcomeScreen from '@/features/auth/ui/screens/WelcomeScreen';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
	__esModule: true,
	default: {
		configure: jest.fn(),
		hasPlayServices: jest.fn().mockResolvedValue(true),
		signIn: jest.fn(),
	},
	GoogleSignin: {
		configure: jest.fn(),
		hasPlayServices: jest.fn().mockResolvedValue(true),
		signIn: jest.fn(),
	},
}));

// Mock the logger
jest.mock('@/shared/utils/logging', () => ({
	logger: {
		info: jest.fn(),
		warn: jest.fn(),
		error: jest.fn(),
		debug: jest.fn(),
	},
}));

// Mock the theme provider
jest.mock('@/app/providers', () => ({
	useTheme: () => ({
		colors: {
			background: {
				primary: '#FFFFFF',
			},
			button: {
				primary: '#2563EB',
			},
		},
	}),
}));

// Mock React Navigation hooks
jest.mock('@react-navigation/native', () => ({
	useIsFocused: () => true,
	useNavigation: () => ({
		navigate: jest.fn(),
		goBack: jest.fn(),
	}),
}));

const createMockStore = (initialState = {}) => {
	return configureStore({
		reducer: {
			user: userSlice.reducer,
			workTrack: workTrackSlice.reducer,
		},
		preloadedState: initialState,
	});
};

const mockNavigation = {
	navigate: jest.fn(),
	replace: jest.fn(),
	goBack: jest.fn(),
	reset: jest.fn(),
	setParams: jest.fn(),
};

const mockRoute = {
	key: 'test-key',
	name: 'WelcomeScreen',
	params: {},
};

const mockProps: AuthStackScreenProps<'WelcomeScreen'> = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	navigation: mockNavigation as any,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	route: mockRoute as any,
};

const renderWithProviders = (
	component: React.ReactElement,
	initialState = {}
) => {
	const store = createMockStore(initialState);
	return render(<Provider store={store}>{component}</Provider>);
};

describe('WelcomeScreen', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders welcome screen with sign in button', () => {
		const { getByText } = renderWithProviders(
			<WelcomeScreen {...mockProps} />
		);

		expect(getByText('Welcome Screen')).toBeTruthy();
		expect(getByText('Sign In With Google')).toBeTruthy();
	});

	it('displays loading state when signing in', () => {
		const initialState = {
			user: {
				user: null,
				isLoggedIn: false,
				loading: true,
				error: null,
			},
		};

		const { getByText } = renderWithProviders(
			<WelcomeScreen {...mockProps} />,
			initialState
		);

		expect(getByText('Sign In With Google')).toBeTruthy();
	});

	it('handles Google sign in', async () => {
		const {
			GoogleSignin,
		} = require('@react-native-google-signin/google-signin');
		GoogleSignin.signIn.mockResolvedValue({
			data: {
				idToken: 'mock-id-token',
			},
		});

		const { getByText } = renderWithProviders(
			<WelcomeScreen {...mockProps} />
		);

		const signInButton = getByText('Sign In With Google');
		fireEvent.press(signInButton);

		await waitFor(() => {
			expect(GoogleSignin.signIn).toHaveBeenCalled();
		});
	});

	it('handles sign in errors gracefully', async () => {
		const {
			GoogleSignin,
		} = require('@react-native-google-signin/google-signin');
		GoogleSignin.signIn.mockRejectedValue(new Error('Sign in failed'));

		const { getByText } = renderWithProviders(
			<WelcomeScreen {...mockProps} />
		);

		const signInButton = getByText('Sign In With Google');
		fireEvent.press(signInButton);

		await waitFor(() => {
			expect(GoogleSignin.signIn).toHaveBeenCalled();
		});
	});

	it('checks for Google Play Services before signing in', async () => {
		const {
			GoogleSignin,
		} = require('@react-native-google-signin/google-signin');
		GoogleSignin.signIn.mockResolvedValue({
			data: {
				idToken: 'mock-id-token',
			},
		});

		const { getByText } = renderWithProviders(
			<WelcomeScreen {...mockProps} />
		);

		const signInButton = getByText('Sign In With Google');
		fireEvent.press(signInButton);

		await waitFor(() => {
			expect(GoogleSignin.hasPlayServices).toHaveBeenCalled();
		});
	});

	// Additional scenarios can be added as implementation grows.
});
