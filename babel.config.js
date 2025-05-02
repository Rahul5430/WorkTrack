module.exports = {
	presets: ['module:@react-native/babel-preset'],
	plugins: [
		'module:react-native-dotenv',
		['@babel/plugin-proposal-decorators', { legacy: true }],
	],
	env: {
		production: {
			plugins: ['react-native-paper/babel'],
		},
	},
};
