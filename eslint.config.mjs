// @ts-check
import * as pluginImport from 'eslint-plugin-import';
import pluginJest from 'eslint-plugin-jest';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginReact from 'eslint-plugin-react';
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import pluginUnusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import * as tseslint from 'typescript-eslint';

const baseConfig = {
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
		'unused-imports': pluginUnusedImports,
		'@typescript-eslint': tseslint.plugin,
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
};

export default tseslint.config(
	tseslint.configs.recommended,
	{
		...baseConfig,
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
			'@typescript-eslint/no-empty-object-type': 'off',

			// ✅ Import Sorting
			'simple-import-sort/imports': 'error',
			'simple-import-sort/exports': 'error',
			'import/first': 'error',
			'import/newline-after-import': 'error',
			'import/no-duplicates': 'error',
			'import/no-dynamic-require': 'warn',
			'import/no-nodejs-modules': 'warn',
			'import/no-unassigned-import': 'error',

			// ✅ Unused Imports (auto-remove on save)
			'unused-imports/no-unused-imports': 'error',
			'unused-imports/no-unused-vars': [
				'error',
				{ vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
			],
		},
	}
);
