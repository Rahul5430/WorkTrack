// @ts-check

import pluginImport from 'eslint-plugin-import';
import pluginJest from 'eslint-plugin-jest';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginReact from 'eslint-plugin-react';
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config({
	files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
	ignores: [
		'node_modules',
		'dist',
		'.expo',
		'.expo-shared',
		'web-build',
		'android',
		'ios',
	],
	languageOptions: {
		globals: globals.browser,
		parser: tseslint.parser,
		parserOptions: {
			ecmaVersion: 'latest',
			ecmaFeatures: {
				jsx: true,
			},
		},
	},
	plugins: {
		react: pluginReact,
		prettier: pluginPrettier,
		jest: pluginJest,
		import: pluginImport,
		'simple-import-sort': pluginSimpleImportSort,
	},
	rules: {
		// ✅ General Best Practices
		'no-console': 0,
		'prettier/prettier': 2,

		// ✅ Jest Rules
		'jest/no-disabled-tests': 'warn',
		'jest/no-focused-tests': 'error',
		'jest/no-identical-title': 'error',
		'jest/prefer-to-have-length': 'warn',
		'jest/valid-expect': 'error',

		// ✅ React Rules
		'react/jsx-uses-react': 'off',
		'react/react-in-jsx-scope': 'off',
		'react/prop-types': 0,
		'react/display-name': 'off',

		// ✅ TypeScript Rules
		'@typescript-eslint/no-unused-vars': 'off',
		'@typescript-eslint/no-explicit-any': 'off',

		// ✅ Import Sorting
		'simple-import-sort/imports': 'error',
		'simple-import-sort/exports': 'error',
		'import/first': 'error',
		'import/newline-after-import': 'error',
		'import/no-duplicates': 'error',
		'import/no-dynamic-require': 'warn',
		'import/no-nodejs-modules': 'warn',
	},
	settings: {
		react: {
			pragma: 'React',
			version: 'detect',
		},
		'import/resolver': {
			typescript: {
				alwaysTryTypes: true,
				bun: true,
			},
			node: true,
		},
	},
	// env: {
	//   es6: true,
	//   "jest/globals": true,
	//   node: true,
	// },
});
