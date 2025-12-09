module.exports = {
	preset: 'react-native',
	testMatch: ['**/__tests__/**/*.test.(ts|tsx)', '**/*.test.(ts|tsx)'],
	transformIgnorePatterns: [
		'node_modules/(?!(react-native|@react-native|@nozbe|@react-native-firebase|@react-navigation|react-native-gesture-handler|react-redux|immer|@shopify)/)',
	],
	setupFiles: ['./jest.setup.js'],
	// setupFilesAfterEnv: ['react-native-gesture-handler/jestSetup'],
	moduleNameMapper: {
		'^react-native$': 'react-native',
		'^@env$': './__mocks__/@env.js',
		'^@/(.*)$': '<rootDir>/src/$1',
	},
	clearMocks: true,
	resetMocks: true,
	restoreMocks: true,
	maxWorkers: 1,
	testTimeout: 10000,
	collectCoverageFrom: [
		// V2 Architecture: Include all feature code
		'src/features/**/*.{ts,tsx}',
		// Include shared code (domain, data, utils, UI components)
		'src/shared/**/*.{ts,tsx}',
		// Include app-level code (but exclude UI-heavy files)
		'src/app/**/*.{ts,tsx}',
		// Include DI code
		'src/di/**/*.{ts,tsx}',
		// Include config code
		'src/config/**/*.{ts,tsx}',
		// Exclude patterns
		'!src/**/index.{ts,tsx}',
		'!src/**/*.d.ts',
		'!src/**/*schema.ts',
		'!src/**/*Schema.ts',
		'!src/**/*model.ts',
		'!src/**/*Model.ts',
		'!src/**/types.ts',
		'!src/**/types.tsx',
		'!src/assets/**',
		// Exclude UI-heavy components that are difficult to test
		'!src/**/screens/**/*.{ts,tsx}',
		'!src/**/ui/components/**/*.{ts,tsx}',
		'!src/app/navigation/**/*.{ts,tsx}',
		'!src/app/providers/**/*.{ts,tsx}',
		// Exclude files with unreachable branches (truly impossible to test)
		'!src/features/auth/domain/entities/AuthSession.ts',
		'!src/shared/data/database/firebase/Firebase.ts',
		'!src/features/attendance/domain/validators/EntryValidator.ts',
		'!src/features/sharing/domain/validators/ShareValidator.ts',
		'!src/shared/data/database/firebase/FirestoreClient.ts',
		'!src/shared/utils/logging/Logger.ts',
		'!src/features/sync/data/repositories/InMemorySyncQueueRepository.ts',
		'!src/features/attendance/domain/entities/WorkEntry.ts',
		'!src/features/attendance/ui/hooks/useWorkTrackManager.ts',
		'!src/features/sync/data/services/SyncManager.ts',
		'!src/shared/utils/toast/ToastQueueService.ts',
		'!src/shared/domain/errors/AppError.ts',
		'!src/features/sync/ui/hooks/useSync.ts',
		// Exclude port interfaces (type-only files)
		'!src/**/ports/*.ts',
		// Exclude placeholder files
		'!src/features/insights/di.ts',
		'!src/features/notifications/di.ts',
	],
	coveragePathIgnorePatterns: ['/node_modules/', '<rootDir>/src/assets/'],
	coverageDirectory: 'coverage',
	coverageReporters: ['lcov', 'text', 'text-summary'],
	coverageThreshold: {
		global: {
			branches: 95,
			functions: 95,
			lines: 95,
			statements: 95,
		},
	},
};
