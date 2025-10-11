// Mock Firebase modules

jest.mock('@react-native-firebase/app', () => ({
	getApp: jest.fn(() => ({ name: 'test-app' })),
}));

jest.mock('@react-native-firebase/firestore', () => ({
	getFirestore: jest.fn(() => ({ app: { name: 'test-app' } })),
	connectFirestoreEmulator: jest.fn(),
}));

jest.mock('@env', () => ({
	FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080',
}));

jest.mock('../../../src/logging', () => ({
	logger: {
		debug: jest.fn(),
		warn: jest.fn(),
	},
}));

// Mock global __DEV__
const originalDev = (global as { __DEV__?: boolean }).__DEV__;

describe('firebase service - branch coverage', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		// Reset the module to clear singleton state
		jest.resetModules();
	});

	afterEach(() => {
		(global as { __DEV__?: boolean }).__DEV__ = originalDev;
	});

	describe('getFirestoreInstance', () => {
		it('returns cached instance on subsequent calls', () => {
			const {
				getFirestoreInstance,
			} = require('../../../src/services/firebase');
			const instance1 = getFirestoreInstance();
			const instance2 = getFirestoreInstance();
			expect(instance1).toBe(instance2);
		});

		it('connects to emulator in development with valid host', () => {
			(global as { __DEV__?: boolean }).__DEV__ = true;
			const {
				getFirestoreInstance,
			} = require('../../../src/services/firebase');
			const {
				connectFirestoreEmulator,
			} = require('@react-native-firebase/firestore');

			getFirestoreInstance();

			expect(connectFirestoreEmulator).toHaveBeenCalledWith(
				expect.any(Object),
				'127.0.0.1',
				8080
			);
		});

		it('handles emulator connection error gracefully', () => {
			(global as { __DEV__?: boolean }).__DEV__ = true;
			const {
				connectFirestoreEmulator,
			} = require('@react-native-firebase/firestore');
			connectFirestoreEmulator.mockImplementation(() => {
				throw new Error('Already connected');
			});

			const {
				getFirestoreInstance,
			} = require('../../../src/services/firebase');
			const { logger } = require('../../../src/logging');

			// Should not throw
			const instance = getFirestoreInstance();
			expect(instance).toBeDefined();
			expect(logger.warn).toHaveBeenCalledWith(
				'Firestore emulator connection warning:',
				expect.any(Error)
			);
		});

		it('skips emulator connection when not in development', () => {
			(global as { __DEV__?: boolean }).__DEV__ = false;
			const {
				getFirestoreInstance,
			} = require('../../../src/services/firebase');
			const {
				connectFirestoreEmulator,
			} = require('@react-native-firebase/firestore');

			getFirestoreInstance();

			expect(connectFirestoreEmulator).not.toHaveBeenCalled();
		});
	});

	describe('getFirebaseApp', () => {
		it('returns Firebase app instance', () => {
			const {
				getFirebaseApp,
			} = require('../../../src/services/firebase');
			const { getApp } = require('@react-native-firebase/app');

			const app = getFirebaseApp();

			expect(getApp).toHaveBeenCalled();
			expect(app).toEqual({ name: 'test-app' });
		});
	});
});
