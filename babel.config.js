module.exports = {
	presets: ['module:@react-native/babel-preset'],
	plugins: [
		'module:react-native-dotenv',
		['@babel/plugin-proposal-decorators', { legacy: true }],
		'react-native-reanimated/plugin',
	],
	env: {
		production: {
			plugins: ['react-native-paper/babel'],
		},
	},
};
