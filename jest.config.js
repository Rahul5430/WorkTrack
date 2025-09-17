module.exports = {
	preset: 'react-native',
	testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
	transformIgnorePatterns: [
		'node_modules/(?!(react-native|@react-native|@nozbe|@react-native-firebase|@react-navigation|react-native-gesture-handler|react-redux)/)',
	],
	setupFiles: ['./jest.setup.js'],
	setupFilesAfterEnv: ['react-native-gesture-handler/jestSetup'],
	moduleNameMapper: {
		'^react-native$': 'react-native',
		'^@env$': './__mocks__/@env.js',
	},
	clearMocks: true,
	resetMocks: true,
	restoreMocks: true,
	maxWorkers: 1,
	collectCoverageFrom: [
		'src/**/*.{ts,tsx}',
		'!src/**/index.ts',
		'!src/**/index.tsx',
		'!src/types/**',
		'!src/**/*.d.ts',
	],
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
