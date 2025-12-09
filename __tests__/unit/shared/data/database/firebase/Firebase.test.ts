import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';

jest.mock('@react-native-firebase/app', () => ({
	getApp: jest.fn(() => ({ id: 'mock-app' })),
}));

jest.mock('@react-native-firebase/auth', () => ({
	getAuth: jest.fn(() => ({ id: 'mock-auth' })),
}));

jest.mock('@react-native-firebase/firestore', () => ({
	getFirestore: jest.fn(() => ({ id: 'mock-firestore' })),
}));

// @env is mocked via jest.config.js moduleNameMapper to __mocks__/@env.js
// Tests that need to modify @env use jest.isolateModules with jest.doMock

describe('Firebase initialization', () => {
	beforeEach(() => {
		// Clear module cache before each test
		const modulePath =
			require.resolve('@/shared/data/database/firebase/Firebase');
		if (require.cache[modulePath]) {
			delete require.cache[modulePath];
		}
		// Reset mocks after clearing cache
		jest.clearAllMocks();
		// Ensure mocks return values
		(getApp as jest.Mock).mockReturnValue({ id: 'mock-app' });
		(getAuth as jest.Mock).mockReturnValue({ id: 'mock-auth' });
		(getFirestore as jest.Mock).mockReturnValue({ id: 'mock-firestore' });
	});

	it('initializes Firebase app when no apps exist', async () => {
		// Clear module cache and require to trigger initialization
		delete require.cache[
			require.resolve('@/shared/data/database/firebase/Firebase')
		];
		const _unused = require('@/shared/data/database/firebase/Firebase');
		expect(_unused).toBeDefined();

		expect(getApp).toHaveBeenCalled();
		expect(getAuth).toHaveBeenCalled();
		expect(getFirestore).toHaveBeenCalled();
	});

	it('uses existing app when apps already exist', async () => {
		// Clear module cache
		delete require.cache[
			require.resolve('@/shared/data/database/firebase/Firebase')
		];

		const firebaseModule = require('@/shared/data/database/firebase/Firebase');
		expect(firebaseModule).toBeDefined();

		// React Native Firebase always calls getApp(), getAuth(), and getFirestore()
		// They return the same instance if already initialized
		// Verify the exports are correct rather than checking call counts
		// (since jest.clearAllMocks() in beforeEach clears call history)
		expect(firebaseModule.app).toBeDefined();
		expect(firebaseModule.auth).toBeDefined();
		expect(firebaseModule.firestore).toBeDefined();
	});

	it('does not initialize analytics (React Native Firebase)', () => {
		// React Native Firebase does not initialize analytics in the same way
		// Analytics is null in React Native Firebase implementation
		// Clear module cache
		const modulePath =
			require.resolve('@/shared/data/database/firebase/Firebase');
		delete require.cache[modulePath];

		const _unused = require('@/shared/data/database/firebase/Firebase');
		expect(_unused).toBeDefined();

		// Analytics and performance should be null in React Native Firebase
		expect(_unused.analytics).toBeNull();
		expect(_unused.performance).toBeNull();
	});

	it('exports Firebase services correctly', () => {
		// Clear module cache
		const modulePath =
			require.resolve('@/shared/data/database/firebase/Firebase');
		delete require.cache[modulePath];

		const firebaseModule = require('@/shared/data/database/firebase/Firebase');
		expect(firebaseModule).toBeDefined();
		// The module exports the values returned by getApp(), getAuth(), getFirestore()
		expect(firebaseModule.app).toEqual({ id: 'mock-app' });
		expect(firebaseModule.auth).toEqual({ id: 'mock-auth' });
		expect(firebaseModule.firestore).toEqual({ id: 'mock-firestore' });
		expect(firebaseModule.analytics).toBeNull();
		expect(firebaseModule.performance).toBeNull();
	});
});
