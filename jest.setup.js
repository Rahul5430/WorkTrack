// Ensure RN Firebase modules load their manual mocks from __mocks__
jest.mock('@react-native-firebase/app');
jest.mock('@react-native-firebase/auth');
jest.mock('@react-native-firebase/firestore');

// Provide env vars globally for tests
// @env is mocked via jest.config.js moduleNameMapper to __mocks__/@env.js
// That mock exports a mutable object that tests can modify directly

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

// Safe area context mock
jest.mock('react-native-safe-area-context', () => ({
	useSafeAreaInsets: jest.fn(() => ({
		top: 44,
		bottom: 34,
		left: 0,
		right: 0,
	})),
}));

// Switch mock
jest.mock('react-native', () => {
	const RN = jest.requireActual('react-native');
	RN.Switch = 'Switch';
	RN.Platform = {
		select: jest.fn((obj) => obj.default || obj.ios),
		OS: 'ios',
	};
	RN.useWindowDimensions = jest.fn(() => ({
		width: 375,
		height: 812,
	}));
	return RN;
});

// Mock ListItem component - removed to allow real component rendering

// WatermelonDB SQLite adapter mock to avoid JSI in Jest
jest.mock('@nozbe/watermelondb/adapters/sqlite', () => {
	return function SQLiteAdapter() {
		return {};
	};
});

// react-native-gesture-handler mock
jest.mock('react-native-gesture-handler', () => ({
	__esModule: true,
	GestureHandlerRootView: ({ children }) => children,
	createAnimatedComponent: (Comp) => Comp,
}));

// WatermelonDB Database mock to avoid schema/tables access
jest.mock('@nozbe/watermelondb', () => ({
	Database: function Database() {
		return {};
	},
	Model: class {},
	tableSchema: (schema) => schema,
	appSchema: (schema) => schema,
	Q: {
		where: jest.fn((field, value) => ({ field, value, type: 'where' })),
		sortBy: jest.fn((field, direction) => ({
			field,
			direction,
			type: 'sortBy',
		})),
		take: jest.fn((count) => ({ count, type: 'take' })),
		oneOf: jest.fn((values) => ({ values, type: 'oneOf' })),
		lte: jest.fn((value) => ({ comparator: 'lte', value })),
		asc: 'asc',
		desc: 'desc',
	},
}));

jest.mock('@nozbe/watermelondb/decorators', () => ({
	date: () => () => {},
	field: () => () => {},
	readonly: () => () => {},
	relation: () => () => {},
}));

// Simplify react-native-paper Button for tests to make press events reliable
jest.mock('react-native-paper', () => {
	const React = require('react');
	const { Text } = require('react-native');
	return {
		__esModule: true,
		Button: ({ onPress, children }) =>
			React.createElement(Text, { onPress }, children),
	};
});

// Mock Firebase Web Auth ESM for Jest (avoid ESM parsing issues)
jest.mock('firebase/auth', () => ({
	getAuth: jest.fn(() => ({
		currentUser: null,
	})),
	GoogleAuthProvider: { credential: jest.fn() },
	signInWithCredential: jest.fn(async () => undefined),
	signOut: jest.fn(async () => undefined),
}));

// Mock Firebase App ESM
jest.mock('firebase/app', () => ({
	getApps: jest.fn(() => []),
	initializeApp: jest.fn(() => ({ name: 'test-app' })),
}));

// Mock Firebase Analytics ESM
jest.mock('firebase/analytics', () => ({
	getAnalytics: jest.fn(() => ({})),
}));

// Mock Firebase Performance ESM
jest.mock('firebase/performance', () => ({
	getPerformance: jest.fn(() => ({})),
}));

// Mock Firebase Firestore ESM
jest.mock('firebase/firestore', () => ({
	getFirestore: jest.fn(() => ({})),
	connectFirestoreEmulator: jest.fn(),
	collection: jest.fn(() => ({})),
	doc: jest.fn(() => ({})),
	batch: jest.fn(() => ({
		set: jest.fn(),
		delete: jest.fn(),
		commit: jest.fn(),
	})),
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
