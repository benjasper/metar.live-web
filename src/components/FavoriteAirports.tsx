import { Component, For, Show, createEffect, createMemo, onCleanup } from 'solid-js'
import { useFavoriteAirportsStore } from '../context/FavoriteAirportsStore'
import { useGraphQL } from '../context/GraphQLClient'
import { useStatusStore } from '../context/StatusStore'
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

	const favoriteAirportsVariables = (): MultipleAirportsByIdsQueryVariables | false => {
		if (sortedFavorites().length === 0) {
			return false
		}

		return {
			identifiers: sortedFavorites().map(favorite => favorite.identifier),
		}
	}

	const [airportRequest, { refetch }] = newQuery<MultipleAirportsByIdsQuery, MultipleAirportsByIdsQueryVariables>(
		MULTIPLE_AIRPORTS_BY_IDS,
		// eslint-disable-next-line solid/reactivity
		favoriteAirportsVariables()
	)

	const airportData = createMemo(() => {
		if (airportRequest.state === 'ready') {
			return airportRequest()
		}

		return airportRequest.latest
	})

	const [, setStatus] = useStatusStore()

	createEffect(() => {
		const status = airportData()?.status?.lastWeatherSync ?? null
		setStatus(status)
	})

	const refetchInterval = setInterval(() => {
		refetch()
	}, 1000 * 30)

	onCleanup(() => {
		clearInterval(refetchInterval)
	})

	const airportsById = createMemo(() => {
		const airports = airportData()?.getAirportsByIds ?? []
		return airports.reduce(
			(acc, airport) => {
				acc[airport.identifier] = airport
				return acc
			},
			{} as Record<string, MultipleAirportsByIdsQuery['getAirportsByIds'][number]>
		)
	})

	const hasLoadedAirports = createMemo(() => (airportData()?.getAirportsByIds?.length ?? 0) > 0)

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
						when={!airportRequest.loading || hasLoadedAirports()}
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
										airport={airportsById()[favorite.identifier] ?? undefined}
										onRemove={() => favoriteActions.removeFavorite(favorite.identifier)}
									/>
								)}
							</For>
						</Slider>
					</Show>
					<Show when={airportRequest.error}>
						<div
							role="alert"
							class="mt-4 rounded-2xl border border-rose-200/70 bg-rose-50/80 px-5 py-4 text-sm text-rose-900 shadow-sm dark:border-rose-400/40 dark:bg-rose-500/10 dark:text-rose-100">
							<p class="font-semibold">Can't refresh favorite airports right now.</p>
							<p class="mt-1 text-rose-900/80 dark:text-rose-100/80">
								We'll keep showing the last loaded data until the connection recovers.
							</p>
							<Button class="mt-3" onClick={() => refetch()}>
								Retry
							</Button>
						</div>
					</Show>
				</div>
			</section>
		</Show>
	)
}

export default FavoriteAirports
