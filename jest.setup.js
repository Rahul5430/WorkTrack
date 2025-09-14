// Silence WatermelonDB/React Native timers warnings in JSDOM
jest.useFakeTimers();

// Basic mocks for react-native-firebase
jest.mock('@react-native-firebase/app', () => ({ getApp: () => ({}) }));
jest.mock('@react-native-firebase/auth', () => ({
	getAuth: () => ({
		currentUser: { uid: 'test-user', email: 'test@example.com' },
	}),
}));
jest.mock('@react-native-firebase/firestore', () => ({
	Timestamp: {
		fromDate: (d) => ({ toMillis: () => d.getTime() }),
		fromMillis: (ms) => ({ toMillis: () => ms }),
	},
}));

// AsyncStorage mock
jest.mock('@react-native-async-storage/async-storage', () =>
	require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// NetInfo mock
jest.mock('@react-native-community/netinfo', () => ({
	addEventListener: jest.fn(),
	fetch: jest.fn().mockResolvedValue({ isConnected: true }),
}));

// Mock reanimated and bottom sheet heavy deps for App.test
global.__reanimatedWorkletInit = () => {};
jest.mock('react-native-reanimated', () => ({
	__esModule: true,
	default: {
		addWhitelistedNativeProps: jest.fn(),
		createAnimatedComponent: (Comp) => Comp,
	},
	Easing: { linear: (t) => t },
	useSharedValue: (v) => ({ value: v }),
	withTiming: (v) => v,
	withRepeat: (v) => v,
	useAnimatedStyle: () => ({}),
}));
jest.mock('@gorhom/bottom-sheet', () => {
	const React = require('react');
	return {
		__esModule: true,
		default: ({ children }) => React.createElement('View', null, children),
		BottomSheetBackdrop: () => null,
	};
});

// Vector icons mock
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

// WatermelonDB SQLite adapter mock to avoid JSI in Jest
jest.mock('@nozbe/watermelondb/adapters/sqlite', () => {
	return function SQLiteAdapter() {
		return {};
	};
});

// react-native-gesture-handler mock
jest.mock('react-native-gesture-handler', () => {
	const React = require('react');
	const View = 'View';
	return {
		__esModule: true,
		GestureHandlerRootView: ({ children }) =>
			React.createElement(View, null, children),
		createAnimatedComponent: (Comp) => Comp,
	};
});

// WatermelonDB Database mock to avoid schema/tables access
jest.mock('@nozbe/watermelondb', () => ({
	Database: function Database() {
		return {};
	},
	Model: class {},
	tableSchema: (schema) => schema,
	appSchema: (schema) => schema,
}));

jest.mock('@nozbe/watermelondb/decorators', () => ({
	date: () => () => {},
	field: () => () => {},
	readonly: () => () => {},
	relation: () => () => {},
}));

// Google Sign-In mock
jest.mock('@react-native-google-signin/google-signin', () => ({
	GoogleSignin: {
		configure: jest.fn(),
		hasPlayServices: jest.fn().mockResolvedValue(true),
		signIn: jest.fn().mockResolvedValue({
			data: { idToken: 'fake-id-token' },
		}),
	},
}));
