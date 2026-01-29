import { A } from '@solidjs/router'
import { AiFillStar } from 'solid-icons/ai'
import { Component, Show, createMemo } from 'solid-js'
import { useUnitStore } from '../context/UnitStore'
import { formatWindDirection, parseVariableWindFromMetar } from '../models/weather'
import { MultipleAirportsByIdsQuery } from '../queries/generated/graphql'
import AirportClassification from './AirportClassification'
import FlightCategorySymbol from './FlightCategorySymbol'
import RunwayAndWindRenderer from './special/RunwayAndWindRenderer'
import { Tag } from './Tag'
import { TbOutlineWindsock } from 'solid-icons/tb'

interface FavoriteAirportTileProps {
	identifier: string
	airport: MultipleAirportsByIdsQuery['getAirportsByIds'][number]
	onRemove: () => void
}

export const FavoriteAirportTileSkeleton: Component = () => (
	<div class="flex h-full w-72 shrink-0 animate-pulse flex-col gap-3 rounded-3xl border border-slate-300/60 bg-slate-50/85 px-5 py-5 text-left transition-colors duration-200 dark:border-white/10 dark:bg-slate-900/70">
		<div class="flex flex-col gap-2 pr-6">
			<div class="h-5 w-32 rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
			<div class="h-4 w-48 rounded-full bg-slate-100/80 dark:bg-slate-800/80" />
		</div>
		<div class="flex flex-wrap gap-2">
			<div class="h-8 w-24 rounded-full bg-slate-100/80 dark:bg-slate-800/80" />
			<div class="h-8 w-28 rounded-full bg-slate-100/80 dark:bg-slate-800/80" />
		</div>
		<div class="mt-2 h-64 w-full rounded-3xl bg-slate-100/70 dark:bg-slate-800/40" />
	</div>
)

export const FavoriteAirportTile: Component<FavoriteAirportTileProps> = props => {
	const [unitStore] = useUnitStore()

	const airport = () => props.airport
	const metars = createMemo(() => airport()?.station?.metars.edges ?? [])
	const latestMetar = createMemo(() => metars()[0]?.node)
	const latestFlightCategory = createMemo(() => latestMetar()?.flightCategory ?? undefined)
	const variableWind = createMemo(() => parseVariableWindFromMetar(latestMetar()?.rawText ?? undefined))
	const selectedSpeedUnit = () => unitStore.speed.units[unitStore.speed.selected]
	const windSpeed = () => latestMetar()?.windSpeed ?? 0
	const windDirection = () => latestMetar()?.windDirection ?? undefined
	const formattedWindSpeed = () => Math.round(selectedSpeedUnit().conversionFunction(windSpeed() ?? 0))

	const airportCodes = createMemo(() => {
		const airportData = airport()

		if (!airportData) {
			return props.identifier
		}

		if (airportData.icaoCode && airportData.iataCode) {
			return `${airportData.icaoCode} / ${airportData.iataCode}`
		}

		if (airportData.icaoCode) {
			return airportData.icaoCode
		}

		if (airportData.gpsCode) {
			return airportData.gpsCode
		}

		return airportData.identifier
	})

	const airportName = () => airport()?.name ?? props.identifier

	const canRenderRunways = () => (airport()?.runways.length ?? 0) > 0

	const windSummary = () => {
		if (windSpeed() === 0) {
			return 'Wind calm'
		}

		const formattedDirection = formatWindDirection(windDirection() ?? undefined)
		const directionLabel = formattedDirection ? `${formattedDirection}°` : 'VRB'
		return `${directionLabel} at ${formattedWindSpeed()} ${selectedSpeedUnit().symbol}`
	}

	const ariaLabel = () => `View live weather for ${airportCodes()}`

	return (
		<>
			<A
				href={`/airport/${airport()?.identifier ?? props.identifier}`}
				aria-label={ariaLabel()}
				class="group relative flex h-full w-72 shrink-0 flex-col gap-3 rounded-3xl border border-slate-300/60 bg-slate-50/85 px-5 py-5 text-left text-slate-900 transition-colors duration-200 hover:border-slate-300/60 hover:bg-slate-50/95 md:mx-0 dark:border-white/10 dark:bg-slate-900/70 dark:text-white dark:hover:border-white/20 dark:hover:bg-slate-900/80">
				<div class="flex flex-col gap-1 pr-6">
					<h3 class="text-lg font-semibold">{airportCodes()}</h3>
					<span class="text-sm text-slate-800 dark:text-slate-300">{airportName()}</span>
				</div>
				<Show when={latestMetar()}>
					<div class="flex flex-wrap gap-2">
						<Show
							when={latestFlightCategory()}
							fallback={
								<Show when={airport()?.type}>
									<Tag intent="neutral" class="gap-2">
										<AirportClassification type={airport()!.type!} />
									</Tag>
								</Show>
							}>
							<Tag intent="neutral" class="gap-2">
								<FlightCategorySymbol
									size="small"
									class="my-auto"
									flightCategory={latestFlightCategory()!}
								/>
								{latestFlightCategory()}
							</Tag>
						</Show>
						<Tag intent="neutral">
							<TbOutlineWindsock />
							{windSummary()}
						</Tag>
					</div>
				</Show>
				<Show when={airport() && canRenderRunways()}>
					<div class="mt-2 origin-top-left">
						<RunwayAndWindRenderer
							airport={airport()!}
							windDirection={windDirection()}
							windSpeed={windSpeed() ?? 0}
							variableWind={variableWind()}
							isVariable={latestMetar()?.windDirectionVariable ?? false}
						/>
					</div>
				</Show>
				<button
					type="button"
					onClick={event => {
						event.preventDefault()
						event.stopPropagation()
						props.onRemove()
					}}
					aria-label={`Remove ${airportCodes()} from favorites`}
					class="absolute top-3 right-3 cursor-pointer rounded-full border-slate-200/70 bg-slate-50/80 p-1 text-amber-300 transition hover:bg-slate-50 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-hidden dark:bg-slate-800/80 dark:text-amber-300 dark:hover:text-slate-400 dark:focus-visible:ring-offset-slate-900">
					<AiFillStar size={18} />
				</button>
			</A>
		</>
	)
}
