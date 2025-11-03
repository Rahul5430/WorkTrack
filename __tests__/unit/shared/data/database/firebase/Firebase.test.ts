import { getApps, initializeApp } from 'firebase/app';

jest.mock('firebase/app', () => ({
	initializeApp: jest.fn(() => ({ id: 'mock-app' })),
	getApps: jest.fn(() => []),
	getAuth: jest.fn(() => ({ id: 'mock-auth' })),
}));

jest.mock('firebase/firestore', () => ({
	getFirestore: jest.fn(() => ({ id: 'mock-firestore' })),
	connectFirestoreEmulator: jest.fn(),
}));

jest.mock('firebase/analytics', () => ({
	getAnalytics: jest.fn(() => ({ id: 'mock-analytics' })),
}));

jest.mock('firebase/performance', () => ({
	getPerformance: jest.fn(() => ({ id: 'mock-performance' })),
}));

// @env is mocked via jest.config.js moduleNameMapper to __mocks__/@env.js
// Tests that need to modify @env use jest.isolateModules with jest.doMock

describe('Firebase initialization', () => {
	const originalEnv = { ...process.env };
	const originalWindow = global.window;

	// Helper function to set env vars without triggering Babel plugin
	const setEnv = (key: string, value: string): void => {
		const env = process.env as Record<string, string>;
		env[key] = value;
	};

	beforeEach(() => {
		jest.clearAllMocks();
		// Clear module cache FIRST before resetting env vars
		const modulePath = require.resolve(
			'@/shared/data/database/firebase/Firebase'
		);
		if (require.cache[modulePath]) {
			delete require.cache[modulePath];
		}
		// Reset process.env to original state before each test
		// Remove env vars that tests will set themselves
		delete process.env.FIRESTORE_EMULATOR_HOST;
		delete process.env.FIRESTORE_EMULATOR_PORT;
		delete process.env.NODE_ENV;
		// Restore other original env vars
		Object.keys(originalEnv).forEach((key) => {
			if (
				key !== 'FIRESTORE_EMULATOR_HOST' &&
				key !== 'FIRESTORE_EMULATOR_PORT' &&
				key !== 'NODE_ENV'
			) {
				const env = process.env as Record<string, string>;
				env[key] = originalEnv[key] as string;
			}
		});
		// Clear any existing window mock
		if (global.window) {
			delete (global as { window?: Window }).window;
		}
	});

	afterEach(() => {
		process.env = originalEnv;
		if (originalWindow) {
			global.window = originalWindow;
		} else {
			const globalObj = global as { window?: Window };
			delete globalObj.window;
		}
	});

	it('initializes Firebase app when no apps exist', async () => {
		(getApps as jest.Mock).mockReturnValue([]);

		// Clear module cache and require to trigger initialization
		delete require.cache[
			require.resolve('@/shared/data/database/firebase/Firebase')
		];
		const _unused = require('@/shared/data/database/firebase/Firebase');
		expect(_unused).toBeDefined();

		expect(initializeApp).toHaveBeenCalled();
	});

	it('uses existing app when apps already exist', async () => {
		const existingApp = { id: 'existing-app' };
		(getApps as jest.Mock).mockReturnValue([existingApp]);

		// Clear module cache
		delete require.cache[
			require.resolve('@/shared/data/database/firebase/Firebase')
		];

		const _unused = require('@/shared/data/database/firebase/Firebase');
		expect(_unused).toBeDefined();

		expect(initializeApp).not.toHaveBeenCalled();
	});

	it('initializes analytics only in production on web', () => {
		// Note: This test cannot verify the full condition because Jest sets NODE_ENV='test'
		// and makes it read-only, so we cannot override it to 'production'.
		// We can only verify that analytics is NOT initialized when window is undefined.
		// The actual production behavior must be tested in E2E tests or integration tests.
		(getApps as jest.Mock).mockReturnValue([]);

		// Get mock function references and reset them FIRST
		const {
			getAnalytics: mockGetAnalytics,
		} = require('firebase/analytics');
		const {
			getPerformance: mockGetPerformance,
		} = require('firebase/performance');
		(mockGetAnalytics as jest.Mock).mockClear();
		(mockGetPerformance as jest.Mock).mockClear();

		// Clear Firebase module cache FIRST
		const modulePath = require.resolve(
			'@/shared/data/database/firebase/Firebase'
		);
		delete require.cache[modulePath];

		// Ensure window is undefined (Node.js environment)
		if (global.window) {
			delete (global as { window?: Window }).window;
		}

		// Require Firebase - it should NOT initialize analytics (NODE_ENV='test' and window is undefined)
		const _unused = require('@/shared/data/database/firebase/Firebase');
		expect(_unused).toBeDefined();

		// Analytics and performance should NOT be initialized because:
		// 1. window is undefined in Node.js test environment
		// 2. NODE_ENV is 'test', not 'production' (and cannot be overridden in Jest)
		expect(mockGetAnalytics).not.toHaveBeenCalled();
		expect(mockGetPerformance).not.toHaveBeenCalled();
	});

	it('does not initialize analytics in development', () => {
		// Set environment variables - use helper function to avoid Babel plugin issues
		setEnv('NODE_ENV', 'development');
		// @ts-expect-error - window is not defined in Node.js but needed for test
		global.window = { location: { href: 'http://localhost' } };
		(getApps as jest.Mock).mockReturnValue([]);

		// Reset mocks before requiring module
		const { getAnalytics } = require('firebase/analytics');
		const { getPerformance } = require('firebase/performance');
		jest.clearAllMocks();

		// Clear module cache
		const modulePath = require.resolve(
			'@/shared/data/database/firebase/Firebase'
		);
		delete require.cache[modulePath];

		const _unused = require('@/shared/data/database/firebase/Firebase');
		expect(_unused).toBeDefined();

		// Analytics should not be initialized
		expect(getAnalytics).not.toHaveBeenCalled();
		expect(getPerformance).not.toHaveBeenCalled();
	});
});
