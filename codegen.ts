import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
	overwrite: true,
	schema: 'https://api.metar.live/graphql',
	documents: 'src/**/*.tsx',
	generates: {
		'src/queries/generated/graphql.ts': {
			plugins: ['typescript', 'typescript-operations', 'fragment-matcher'],
		},
		'./graphql.schema.json': {
			plugins: ['introspection'],
		},
	},
	hooks: {
		afterOneFileWrite: ['prettier --write', 'eslint --fix'],
	},
}
export default config
