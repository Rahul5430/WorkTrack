module.exports = {
	root: true,
	extends: [
		'@react-native',
		'plugin:@typescript-eslint/recommended',
		'prettier',
		'plugin:jest/recommended',
		'plugin:react/recommended',
		'plugin:react-hooks/recommended',
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		ecmaVersion: 2021,
		sourceType: 'module',
	},
	plugins: [
		'@typescript-eslint',
		'react',
		'react-hooks',
		'jest',
		'import',
		'prettier',
		'simple-import-sort',
		'unused-imports',
	],
	settings: {
		react: {
			version: 'detect',
		},
		'import/resolver': {
			typescript: {
				alwaysTryTypes: true,
			},
			node: true,
		},
	},
	rules: {
		// ✅ General Best Practices
		'no-console': 'error',
		'prettier/prettier': 'error',

		// ✅ Jest Rules
		'jest/no-disabled-tests': 'warn',
		'jest/no-focused-tests': 'error',
		'jest/no-identical-title': 'error',
		'jest/prefer-to-have-length': 'warn',
		'jest/valid-expect': 'error',
		'jest/no-conditional-expect': 'off',

		// ✅ React Rules
		'react/jsx-uses-react': 'error',
		'react/react-in-jsx-scope': 'off',
		'react/prop-types': 'off',
		'react/display-name': 'warn',

		// ✅ TypeScript Rules
		'@typescript-eslint/no-unused-vars': 'error',
		'@typescript-eslint/no-explicit-any': 'error',
		'@typescript-eslint/no-require-imports': 'off',
		'@typescript-eslint/no-namespace': 'off',
		'@typescript-eslint/no-var-requires': 'off',

		// ✅ Import Sorting
		'simple-import-sort/imports': 'error',
		'simple-import-sort/exports': 'error',
		'import/first': 'error',
		'import/newline-after-import': 'error',
		'import/no-duplicates': 'error',
		'import/no-dynamic-require': 'warn',
		'import/no-unassigned-import': 'error',

		// ✅ Unused Imports (auto-remove on save)
		'unused-imports/no-unused-imports': 'error',
		'unused-imports/no-unused-vars': [
			'error',
			{
				vars: 'all',
				varsIgnorePattern: '^_',
				args: 'after-used',
				argsIgnorePattern: '^_',
			},
		],
	},
	ignorePatterns: [
		'node_modules/',
		'dist/',
		'.expo/',
		'.expo-shared/',
		'web-build/',
		'android/',
		'ios/',
	],
};
