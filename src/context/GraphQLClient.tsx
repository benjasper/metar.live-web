import { createGraphQLClient, GraphQLClientQuery } from '@solid-primitives/graphql'
import { createContext, ParentComponent, useContext } from 'solid-js'

const client = createGraphQLClient('https://api.metar.live/graphql')

const GraphQLContext = createContext<GraphQLClientQuery>(client)

const GraphQLProvider: ParentComponent = props => {
	return <GraphQLContext.Provider value={client}>{props.children}</GraphQLContext.Provider>
}

function useGraphQL() {
	return useContext<GraphQLClientQuery>(GraphQLContext)
}

function createAbortableGraphQLClient(url: string) {
	let abortController: AbortController | null = null
	const client = createGraphQLClient(url, {
		fetcher: (input, init) => {
			abortController?.abort()
			abortController = new AbortController()
			return fetch(input, { ...init, signal: abortController.signal })
		},
	})

	return {
		client,
		abort: () => abortController?.abort(),
	}
}

export { GraphQLProvider, useGraphQL, createAbortableGraphQLClient }
