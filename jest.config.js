module.exports = {
	preset: 'react-native',
	testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
	transformIgnorePatterns: [
		'node_modules/(?!(react-native|@react-native|@nozbe|@react-native-firebase|@react-navigation|react-native-gesture-handler|react-redux)/)',
	],
	setupFiles: ['<rootDir>/jest.setup.js'],
	setupFilesAfterEnv: ['react-native-gesture-handler/jestSetup'],
	moduleNameMapper: {
		'^react-native$': 'react-native',
	},
};
