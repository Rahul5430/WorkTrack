module.exports = {
	presets: ['module:@react-native/babel-preset'],
	plugins: [
		'module:react-native-dotenv',
		['@babel/plugin-proposal-decorators', { legacy: true }],
		'@babel/plugin-transform-export-namespace-from',
		'react-native-worklets/plugin',
	],
	env: {
		production: {
			plugins: ['react-native-paper/babel'],
		},
	},
};
