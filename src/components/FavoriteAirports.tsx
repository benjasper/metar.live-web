import { Component, For, Show, createMemo, onCleanup } from 'solid-js'
import { useFavoriteAirportsStore } from '../context/FavoriteAirportsStore'
import { useGraphQL } from '../context/GraphQLClient'
import { MULTIPLE_AIRPORTS_BY_IDS } from '../queries/AirportQueries'
import { MultipleAirportsByIdsQuery, MultipleAirportsByIdsQueryVariables } from '../queries/generated/graphql'
import Slider from './Slider'
import Button from './Button'
import { TbTrashXFilled } from 'solid-icons/tb'
import { FavoriteAirportTile, FavoriteAirportTileSkeleton } from './FavoriteAirportTile'

const FavoriteAirports: Component = () => {
	const newQuery = useGraphQL()
	const [favoriteStore, favoriteActions] = useFavoriteAirportsStore()

	const sortedFavorites = createMemo(() => {
		return [...favoriteStore.favorites].sort((a, b) => b.addedAt - a.addedAt).slice(0, 10)
	})

	const hasFavorites = () => sortedFavorites().length > 0

	const [airportRequest, { refetch }] = newQuery<MultipleAirportsByIdsQuery, MultipleAirportsByIdsQueryVariables>(
		MULTIPLE_AIRPORTS_BY_IDS,
		// eslint-disable-next-line solid/reactivity
		() => ({
			identifiers: sortedFavorites().map(favorite => favorite.identifier),
		})
	)

	const refetchInterval = setInterval(() => {
		refetch()
	}, 1000 * 30)

	onCleanup(() => {
		clearInterval(refetchInterval)
	})

	const airportsById = () =>
		airportRequest()?.getAirportsByIds.reduce(
			(acc, airport) => {
				acc[airport.identifier] = airport
				return acc
			},
			{} as Record<string, MultipleAirportsByIdsQuery['getAirportsByIds'][number]>
		)

	return (
		<Show when={hasFavorites()}>
			<section class="mt-36 flex flex-col gap-3">
				<div class="flex flex-row justify-between gap-1">
					<h3 class="text-2xl font-semibold text-slate-900 dark:text-white">Favorite airports</h3>
					<Button
						onClick={() => favoriteActions.clear()}
						aria-label="Clear favorites"
						class="flex items-center gap-1">
						<TbTrashXFilled size={18} />
						Clear
					</Button>
				</div>
				<div class="flex flex-row gap-8">
					<Show
						when={!airportRequest.loading || (airportRequest()?.getAirportsByIds.length ?? 0) > 0}
						fallback={
							<Slider items={Array(3).fill(0)} mobileCentered={true}>
								<For each={Array(3).fill(0)}>{_ => <FavoriteAirportTileSkeleton />}</For>
							</Slider>
						}>
						<Slider items={sortedFavorites()} mobileCentered={true}>
							<For each={sortedFavorites()}>
								{favorite => (
									<FavoriteAirportTile
										identifier={favorite.identifier}
										airport={airportsById()![favorite.identifier] ?? undefined}
										onRemove={() => favoriteActions.removeFavorite(favorite.identifier)}
									/>
								)}
							</For>
						</Slider>
					</Show>
				</div>
			</section>
		</Show>
	)
}

export default FavoriteAirports
