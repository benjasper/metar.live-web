import { HiOutlineArrowPath } from 'solid-icons/hi'
import { Component, createEffect, createMemo, Show } from 'solid-js'
import { useTimeStore } from '../context/TimeStore'
import Duration from '../models/duration'
import { AirportSearchFragment } from '../queries/generated/graphql'
import { Tag } from './Tag'
import Tooltip from './Tooltip'
import AltimeterElement from './weather-elements/AltimeterElement'
import FlightCategoryElement from './weather-elements/FlightCategoryElement'
import { PrecipitationElement } from './weather-elements/PrecipitationElement'
import SkyConditionsElement from './weather-elements/SkyConditionsElement'
import TemperatureElement from './weather-elements/TemperatureElement'
import VisibilityElement from './weather-elements/VisibilityElement'
import WindElement from './weather-elements/WindElement'

interface ParsedWeatherElementsProps {
	airport: AirportSearchFragment
	lastRefreshed: Date
	isNight: boolean
	overlayLabel?: string
	overlayTooltip?: string
}

const WeatherElements: Component<ParsedWeatherElementsProps> = props => {
	const latestMetar = createMemo(() => props.airport?.station?.metars?.edges[0]?.node)
	const previousMetar = createMemo(() => props.airport?.station?.metars?.edges[1]?.node)

	const now = useTimeStore()

	const metarObservationTime = () =>
		new Date(props.airport?.station?.metars?.edges[0]?.node.observationTime) ?? undefined
	const lastObservationDuration = (): Duration => Duration.fromDates(metarObservationTime(), now())

	const nextImportPrediction = () =>
		new Date(props.airport?.station?.metars?.edges[0]?.node.nextImportTimePrediction) ?? undefined
	const nextImportPredictionDuration = (): Duration => Duration.fromDates(nextImportPrediction(), now())

	const importTime = () => new Date(props.airport?.station?.metars?.edges[0]?.node.importTime) ?? undefined
	const importTimeDuration = (): Duration => Duration.fromDates(importTime(), now())

	const observationStatus = () => {
		if (lastObservationDuration().asMinutes() <= 60) {
			return 'successful'
		}

		if (lastObservationDuration().asMinutes() <= 120) {
			return 'warning'
		}

		return 'danger'
	}

	const nextImportPredictionStatus = () => {
		if (nextImportPredictionDuration().asMinutes() > 5 && nextImportPredictionDuration().isFuture()) {
			return 'standard' // No highlight
		}

		return 'neutral'
	}

	return (
		<>
			<div class="flex flex-col justify-between md:flex-row">
				<div class="flex flex-col">
					<h3 class="font-semibold text-slate-900 dark:text-white">Current weather</h3>
					<Show when={(props.airport?.station?.metars.edges.length ?? 0) > 0}>
						<div class="flex flex-row flex-wrap justify-start gap-2 pt-2">
							<Show when={props.overlayLabel}>
								<Tag intent="info" tooltip={props.overlayTooltip ?? props.overlayLabel}>
									{props.overlayLabel}
								</Tag>
							</Show>
							<Tag
								intent={observationStatus()}
								tooltip={metarObservationTime().toLocaleTimeString([], {
									hour: 'numeric',
									minute: '2-digit',
									day: 'numeric',
									month: 'long',
									year: 'numeric',
								})}>
								Observed {lastObservationDuration().humanImprecise()}
							</Tag>
							<Tag
								tooltip={importTime().toLocaleTimeString([], {
									hour: 'numeric',
									minute: '2-digit',
									day: 'numeric',
									month: 'long',
									year: 'numeric',
								})}>
								Published {importTimeDuration().humanImprecise()}
							</Tag>
							<Show
								when={
									!(
										nextImportPredictionDuration().isPast() &&
										nextImportPredictionDuration().asHours() > 2
									)
								}>
								<Tag
									intent={nextImportPredictionStatus()}
									tooltip={nextImportPrediction().toLocaleTimeString([], {
										hour: 'numeric',
										minute: '2-digit',
										day: 'numeric',
										month: 'long',
										year: 'numeric',
									})}>
									<Show
										when={nextImportPredictionDuration().isFuture()}
										fallback={'Next update expected any moment now'}>
										Next update expected {nextImportPredictionDuration().humanImprecise()}
									</Show>
								</Tag>
							</Show>
						</div>
					</Show>
				</div>
				<Tooltip
					text={`Refreshed ${Duration.fromDates(props.lastRefreshed, now()).humanPrecise(false)}`}
					delay={1000}>
					<span class="dark:text-white-dark mt-4 flex text-gray-700 md:mt-auto">
						<HiOutlineArrowPath class="my-auto mr-2" />
						Constantly checking for updates
					</span>
				</Tooltip>
			</div>
			<div class={'mt-4 flex flex-col justify-center gap-6 md:flex-row md:flex-wrap md:items-stretch'}>
				<Show
					when={latestMetar()}
					fallback={
						<span class="dark:text-white-dark mx-auto py-16 text-xl text-gray-700">
							No recent weather available.
						</span>
					}>
					<div class="flex shrink-0 flex-col">
						<WindElement
							airport={props.airport}
							windData={{
								windDirection: latestMetar()!.windDirection,
								windSpeed: latestMetar()!.windSpeed,
								windGust: latestMetar()!.windGust,
								variableWindDirection: latestMetar()?.rawText ?? '',
								isVariable: latestMetar()!.windDirectionVariable,
							}}
							previousWindDate={{
								windDirection: previousMetar()?.windDirection,
								windSpeed: previousMetar()?.windSpeed,
								windGust: previousMetar()?.windGust,
								variableWindDirection: previousMetar()?.rawText ?? '',
								isVariable: previousMetar()?.windDirectionVariable ?? false,
							}}
							size="large"
						/>
					</div>
					<div class="flex flex-row flex-wrap justify-center gap-6 md:flex-1 md:items-stretch md:justify-start">
						<VisibilityElement
							visibility={latestMetar()!.visibility}
							visibilityMoreThan={latestMetar()!.visibilityIsMoreThan}
							previousVisibility={previousMetar()?.visibility}
							previousVisibilityMoreThan={previousMetar()?.visibilityIsMoreThan}
						/>

						<Show when={latestMetar()!.presentWeather && (latestMetar()!.presentWeather ?? '').length > 0}>
							<PrecipitationElement
								weather={latestMetar()!.presentWeather ?? ''}
								previousWeather={previousMetar()!.presentWeather ?? undefined}
							/>
						</Show>

						<Show when={latestMetar()!.skyConditions!.length > 0}>
							<SkyConditionsElement
								skyConditions={latestMetar()!.skyConditions!}
								previousSkyConditions={previousMetar()?.skyConditions ?? undefined}
								airport={props.airport}
								isNight={props.isNight}
							/>
						</Show>

						<Show when={latestMetar()!.temperature !== undefined}>
							<TemperatureElement
								temperature={latestMetar()!.temperature!}
								previousTemperature={previousMetar()?.temperature ?? undefined}
								name="Temperature"
							/>
						</Show>

						<Show when={latestMetar()!.dewpoint !== undefined}>
							<TemperatureElement
								temperature={latestMetar()!.dewpoint!}
								previousTemperature={previousMetar()?.dewpoint ?? undefined}
								name="Dewpoint"
							/>
						</Show>

						<Show when={latestMetar()!.altimeter !== undefined}>
							<AltimeterElement
								altimeter={latestMetar()!.altimeter!}
								previousAltimeter={previousMetar()?.altimeter ?? undefined}
							/>
						</Show>

						<Show when={latestMetar()!.flightCategory}>
							<FlightCategoryElement latestMetar={latestMetar()!} previousMetar={previousMetar()} />
						</Show>
					</div>
				</Show>
			</div>
			<div class="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
				<span class="flex items-center gap-1">
					<span aria-hidden="true" class="h-2 w-2 rounded-full bg-emerald-400" />
					<span>Conditions improved</span>
				</span>
				<span class="flex items-center gap-1">
					<span aria-hidden="true" class="h-2 w-2 rounded-full bg-rose-500" />
					<span>Conditions worsened</span>
				</span>
				<span class="flex items-center gap-1">
					<span aria-hidden="true" class="h-2 w-2 rounded-full bg-sky-400" />
					<span>Changed</span>
				</span>
				<span class="flex items-center gap-1">
					<span aria-hidden="true" class="h-2 w-2 rounded-full bg-slate-400" />
					<span>No change</span>
				</span>
			</div>
			<Show when={props.airport && (props.airport?.station?.metars.edges[0] ?? false)}>
				<div class="flex flex-col gap-4 py-16">
					<p aria-label="METAR" class="dark:text-white-dark text-center font-mono text-xl">
						{props.airport!.station!.metars.edges[0].node.rawText}
					</p>
				</div>
			</Show>
		</>
	)
}

export default WeatherElements
