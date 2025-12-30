import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import jest from 'eslint-plugin-jest';
import prettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

export default [
	// Ignore patterns
	{
		ignores: [
			'node_modules/**',
			'dist/**',
			'.expo/**',
			'.expo-shared/**',
			'.git/**',
			'.bundle/**',
			'web-build/**',
			'android/**',
			'ios/**',
			'coverage/**',
		],
	},
	// React Native config (using compat for legacy config)
	// Filter out incompatible plugins (ft-flow, react-native) that use ESLint 8 APIs
	// See: https://github.com/Intellicode/eslint-plugin-react-native/issues/333
	// PR #336 adds flat config support but may not be merged yet
	...compat
		.extends('@react-native')
		.map((config) => {
			// Create a new config object to avoid mutating the original
			const filteredConfig = { ...config };

			// Remove incompatible plugins completely
			if (filteredConfig.plugins) {
				filteredConfig.plugins = Object.fromEntries(
					Object.entries(filteredConfig.plugins).filter(
						([key]) => key !== 'ft-flow' && key !== 'react-native'
					)
				);
			}

			// Ensure rules object exists
			if (!filteredConfig.rules) {
				filteredConfig.rules = {};
			} else {
				filteredConfig.rules = { ...filteredConfig.rules };
			}

			// Disable all incompatible rules
			const incompatibleRules = {
				'ft-flow/define-flow-type': 'off',
				'ft-flow/use-flow-type': 'off',
				'ft-flow/valid-syntax': 'off',
				'react-native/no-inline-styles': 'off',
				'react-native/no-unused-styles': 'off',
				'react-native/split-platform-components': 'off',
				'react-native/no-color-literals': 'off',
				'react-native/no-raw-text': 'off',
				'react-native/no-single-element-style-arrays': 'off',
			};

			// Merge incompatible rules (they override any existing rules)
			Object.assign(filteredConfig.rules, incompatibleRules);

			return filteredConfig;
		})
		.filter((config) => {
			// Additional safety: skip configs that still reference incompatible plugins
			if (config.plugins) {
				return !(
					'ft-flow' in config.plugins ||
					'react-native' in config.plugins
				);
			}
			return true;
		}),
	// TypeScript ESLint recommended config
	...tseslint.configs.recommended,
	// Prettier config (must be last to override other configs)
	prettierConfig,
	// Global settings
	{
		languageOptions: {
			globals: {
				...globals.node,
				...globals.es2021,
				...globals.jest,
			},
			parser: tsParser,
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
				ecmaVersion: 2021,
				sourceType: 'module',
			},
		},
		plugins: {
			react,
			'react-hooks': reactHooks,
			jest,
			import: importPlugin,
			prettier,
			'simple-import-sort': simpleImportSort,
			'unused-imports': unusedImports,
		},
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
	},
];
