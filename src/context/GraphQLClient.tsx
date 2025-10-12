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

export { GraphQLProvider, useGraphQL }
