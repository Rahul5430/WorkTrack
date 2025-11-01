// migrated to V2 structure
import { configureStore } from '@reduxjs/toolkit';
import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { type ViewProps } from 'react-native';
import { Provider } from 'react-redux';

import { LoadingStackScreenProps } from '@/app/navigation/types';
import { userSlice } from '@/app/store/reducers/userSlice';
import { workTrackSlice } from '@/app/store/reducers/workTrackSlice';
import LoadingScreen from '@/features/auth/ui/screens/LoadingScreen';

// Mock navigation before imports
jest.mock('@react-navigation/native', () => ({
	useNavigation: () => ({
		navigate: jest.fn(),
		goBack: jest.fn(),
	}),
	useRoute: () => ({
		params: {},
	}),
	useIsFocused: () => true,
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
}));

// Mock Firebase modules
jest.mock('@/shared/data/database/firebase', () => ({
	firestoreClient: {
		collection: jest.fn(),
		doc: jest.fn(),
		get: jest.fn(),
		set: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
	},
}));

// Mock DI container
jest.mock('@/di', () => ({
	createContainer: jest.fn(() => ({
		resolve: jest.fn(),
		register: jest.fn(),
	})),
}));

// Mock the loadWorkTrackDataFromDB function
jest.mock('@/shared/data/database/watermelon/worktrack', () => ({
	loadWorkTrackDataFromDB: jest.fn().mockResolvedValue(null),
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

// Mock the useResponsiveLayout hook
jest.mock('@/shared/ui/hooks/useResponsive', () => ({
	useResponsiveLayout: () => ({
		RFValue: (size: number) => size,
		getResponsiveSize: (size: number) => size,
		getResponsiveMargin: (margin: number) => margin,
		isTablet: false,
		isLandscape: false,
		width: 375,
		height: 812,
	}),
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

// Mock the FocusAwareStatusBar component
jest.mock('@/shared/ui/components/FocusAwareStatusBar', () => {
	return function MockFocusAwareStatusBar(_props: ViewProps) {
		return null;
	};
});

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
	name: 'LoadingScreen',
	params: {},
};

const mockProps: LoadingStackScreenProps<'LoadingScreen'> = {
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

describe('LoadingScreen', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders without crashing', () => {
		const { toJSON } = renderWithProviders(
			<LoadingScreen {...mockProps} />
		);
		expect(toJSON()).toBeTruthy();
	});

	it('renders with theme colors', () => {
		const { toJSON } = renderWithProviders(
			<LoadingScreen {...mockProps} />
		);
		expect(toJSON()).toBeTruthy();
	});

	it('calls restoreAppData on mount', async () => {
		const AsyncStorage = require('@react-native-async-storage/async-storage');
		AsyncStorage.getItem.mockResolvedValue(null);

		renderWithProviders(<LoadingScreen {...mockProps} />);

		await waitFor(() => {
			expect(AsyncStorage.getItem).toHaveBeenCalledWith('user');
		});
	});

	it('handles user data restoration when user exists', async () => {
		const AsyncStorage = require('@react-native-async-storage/async-storage');
		const mockUser = {
			id: 'test-user-id',
			name: 'Test User',
			email: 'test@example.com',
		};
		AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockUser));

		renderWithProviders(<LoadingScreen {...mockProps} />);

		await waitFor(() => {
			expect(AsyncStorage.getItem).toHaveBeenCalledWith('user');
		});
	});

	it('handles user data restoration when no user exists', async () => {
		const AsyncStorage = require('@react-native-async-storage/async-storage');
		AsyncStorage.getItem.mockResolvedValue(null);

		renderWithProviders(<LoadingScreen {...mockProps} />);

		await waitFor(() => {
			expect(AsyncStorage.getItem).toHaveBeenCalledWith('user');
		});
	});

	it('handles errors during data restoration', async () => {
		const AsyncStorage = require('@react-native-async-storage/async-storage');
		AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

		renderWithProviders(<LoadingScreen {...mockProps} />);

		await waitFor(() => {
			expect(AsyncStorage.getItem).toHaveBeenCalledWith('user');
		});
	});

	// Additional scenarios can be added as implementation grows.
});
