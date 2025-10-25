import tsParser from '@typescript-eslint/parser'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import solid from 'eslint-plugin-solid'

const solidTypescriptRules = solid.configs['flat/typescript']?.rules ?? {}

export default [
	{
		ignores: ['dist/**', 'node_modules/**', 'public/**', 'graphql.schema.json'],
	},
	{
		files: ['src/**/*.{ts,tsx}'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				ecmaFeatures: {
					jsx: true,
				},
			},
			globals: {
				document: 'readonly',
				window: 'readonly',
				navigator: 'readonly',
				console: 'readonly',
				localStorage: 'readonly',
				sessionStorage: 'readonly',
				fetch: 'readonly',
				Request: 'readonly',
				Response: 'readonly',
				AbortController: 'readonly',
				FormData: 'readonly',
				setTimeout: 'readonly',
				clearTimeout: 'readonly',
				setInterval: 'readonly',
				clearInterval: 'readonly',
			},
		},
		plugins: {
			solid,
		},
		rules: {
			...solidTypescriptRules,
			'linebreak-style': ['error', 'unix'],
			quotes: ['error', 'single'],
			semi: ['error', 'never'],
		},
	},
	prettierRecommended,
	{
		rules: {
			'prettier/prettier': 'warn',
		},
	},
]
