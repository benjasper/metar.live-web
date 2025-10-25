import { BsClockHistory } from 'solid-icons/bs'
import { HiOutlineArrowsRightLeft } from 'solid-icons/hi'
import { Component, createMemo, createSignal, For, Match, Show, Switch } from 'solid-js'
import { useTimeStore } from '../context/TimeStore'
import Duration from '../models/duration'
import {
	AirportSearchFragment,
	ForecastChangeIndicator,
	ForecastFragment,
	TafFragment,
} from '../queries/generated/graphql'
import Slider from './Slider'
import { Tag } from './Tag'
import Toggle from './Toggle'
import AltimeterElement from './weather-elements/AltimeterElement'
import { PrecipitationElement } from './weather-elements/PrecipitationElement'
import SkyConditionsElement from './weather-elements/SkyConditionsElement'
import VisibilityElement from './weather-elements/VisibilityElement'
import WindElement from './weather-elements/WindElement'
import WindShearElement from './weather-elements/WindShearElement'

export interface ForecastElementsProps {
	taf?: TafFragment
	airport: AirportSearchFragment
	isNight: boolean
}

const changeIndicatorToSortingIndex = (changeIndicator: string): number => {
	switch (changeIndicator) {
		case '':
			return 0
		case 'BECMG':
			return 1
		case 'TEMPO':
			return 2
		case 'PROB':
			return 3
		default:
			return 4
	}
}

const changeIndicatorCodeToText = (changeIndicator: string): string => {
	switch (changeIndicator) {
		case 'BECMG':
			return 'Becoming'
		case 'TEMPO':
			return 'Temporarily'
		case 'PROB':
			return 'Probable'
		case 'FM':
			return 'From'
		default:
			return ''
	}
}

const ForecastElements: Component<ForecastElementsProps> = props => {
	const now = useTimeStore()

	const issueTime = () => new Date(props.taf?.issueTime)
	const issueTimeDuration = (): Duration => Duration.fromDates(issueTime(), now())

	const validFrom = createMemo(() => new Date(props.taf?.validFromTime))
	const validTo = createMemo(() => new Date(props.taf?.validToTime))

	const isValid = () => validFrom().getTime() <= now().getTime() && validTo().getTime() >= now().getTime()

	const validSince = createMemo(() => Duration.fromDates(validFrom(), now()))
	const validUntil = createMemo(() => Duration.fromDates(validTo(), now()))

	const [isLocalTime, setIsLocalTime] = createSignal(false)
	const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
	const timeZoneIsSameAsAirport = createMemo(
		() =>
			new Date(props.taf?.issueTime).toLocaleString('en-US', { timeZone: browserTimezone }) ===
			new Date(props.taf?.issueTime).toLocaleString('en-US', { timeZone: props.airport.timezone ?? '' })
	)

	let omitNull = (obj: any) => {
		Object.keys(obj)
			.filter(k => obj[k] === null || (typeof obj[k][Symbol.iterator] === 'function' && obj[k].length === 0))
			.forEach(k => delete obj[k])
		return obj
	}

	const forecastsSorted = createMemo(() => {
		let forecasts: ForecastFragment[] = []

		forecasts = props.taf?.forecast?.map(forecast => forecast) ?? []

		forecasts = forecasts.sort((x, y) => {
			const xChangeIndicator = changeIndicatorToSortingIndex(x.changeIndicator ?? '')
			const yChangeIndicator = changeIndicatorToSortingIndex(y.changeIndicator ?? '')

			const xIndex = new Date(x.fromTime).getTime() + xChangeIndicator
			const yIndex = new Date(y.fromTime).getTime() + yChangeIndicator

			return xIndex - yIndex
		})

		// If it is a TEMPO we want to merge it with the previous forecast
		forecasts = forecasts.map((forecast, index) => {
			if (forecast.changeIndicator === 'TEMPO') {
				// Look for the first previous forecast that is not a TEMPO
				const previousForecast = forecasts
					.slice(0, index)
					.reverse()
					.find(f => f.changeIndicator !== 'TEMPO')

				if (previousForecast) {
					return {
						...previousForecast,
						...omitNull({ ...forecast }),
					}
				}
			}

			return forecast
		})

		return forecasts
	})

	const forecasts = createMemo(
		() => forecastsSorted().filter(x => new Date(x.toTime).getTime() > now().getTime()),
		[],
		{ equals: (x, y) => x.length === y.length }
	)

	const timeFormat: Intl.DateTimeFormatOptions = {
		hour: 'numeric',
		minute: 'numeric',
	}

	return (
		<section class="dark:text-white-dark flex w-full flex-col">
			<h3 class="font-semibold text-slate-900 dark:text-white">Current forecast</h3>
			<Show when={props.taf} fallback={<span class="mx-auto py-16 text-xl">No forecast available.</span>}>
				<>
					<div class="flex w-full flex-row flex-wrap justify-between gap-2 pt-2">
						<div class="flex flex-wrap gap-2">
							<Tag
								tooltip={issueTime().toLocaleTimeString([], {
									hour: 'numeric',
									minute: '2-digit',
									day: 'numeric',
									month: 'long',
									year: 'numeric',
									timeZone: isLocalTime() ? (props.airport.timezone ?? '') : browserTimezone,
								})}>
								Issued {issueTimeDuration().humanImprecise()}
							</Tag>
							<Tag
								intent={isValid() ? 'successful' : 'warning'}
								tooltip={`Valid from ${validFrom().toLocaleDateString([], {
									hour: 'numeric',
									minute: '2-digit',
									timeZone: isLocalTime() ? (props.airport.timezone ?? '') : browserTimezone,
								})} to ${validTo().toLocaleDateString([], {
									hour: 'numeric',
									minute: '2-digit',
									timeZone: isLocalTime() ? (props.airport.timezone ?? '') : browserTimezone,
								})}`}>
								<Switch>
									<Match when={validSince().isFuture()}>
										Valid in {validSince().humanImprecise(false)}
									</Match>
									<Match when={validUntil().isFuture()}>
										Valid for {validUntil().humanPrecise(true, false)}
									</Match>
									<Match when={validUntil().isPast()}>
										Expired {validUntil().humanPrecise(true)}
									</Match>
								</Switch>
							</Tag>
						</div>
						<Show when={!timeZoneIsSameAsAirport()}>
							<Toggle
								checked={isLocalTime()}
								onChange={value => setIsLocalTime(value)}
								label="Timezone setting"
								offLabel="My time"
								onLabel="Local time"
							/>
						</Show>
					</div>
					<Slider
						class="mt-6"
						items={forecasts()}
						updateOnChange={props.taf?.rawText}
						adaptiveHeight
						noItemsMessage="No future forecasts available.">
						<For each={forecasts()}>
							{forecast => (
								<div class="mb-auto flex flex-col gap-3">
									<div class="flex flex-row flex-wrap gap-2">
										<div class="inline-block">
											<span class="dark:text-white-dark text-left">
												{new Date(forecast.fromTime).toLocaleString('default', {
													weekday: 'long',
													...timeFormat,
													timeZone: isLocalTime()
														? (props.airport.timezone ?? '')
														: browserTimezone,
												})}
											</span>
											<span class="dark:text-white-dark text-left">
												{' '}
												-{' '}
												{new Date(forecast.toTime).toLocaleString('default', {
													weekday:
														new Date(forecast.fromTime).toLocaleDateString('default', {
															weekday: 'long',
														}) !==
														new Date(forecast.toTime).toLocaleDateString('default', {
															weekday: 'long',
														})
															? 'long'
															: undefined,
													...timeFormat,
													timeZone: isLocalTime()
														? (props.airport.timezone ?? '')
														: browserTimezone,
												})}
											</span>
										</div>
										<Show when={forecast.changeIndicator}>
											<Tag
												tooltip={`Change indicator: ${changeIndicatorCodeToText(
													forecast.changeIndicator!
												)}`}>
												<Show
													when={forecast.changeIndicator === ForecastChangeIndicator.Tempo}
													fallback={<HiOutlineArrowsRightLeft class="my-auto" />}>
													<BsClockHistory class="my-auto" />
												</Show>
												<span>{forecast.changeIndicator}</span>
											</Tag>
										</Show>
										<Show when={forecast.changeProbability}>
											<Tag tooltip="Probability">
												<span>{forecast.changeProbability}%</span>
											</Tag>
										</Show>
									</div>
									<div class="flex w-full max-w-full flex-col flex-wrap gap-4 md:w-120 md:flex-row">
										<Show when={forecast.visibilityHorizontal}>
											<VisibilityElement
												visibility={forecast.visibilityHorizontal!}
												visibilityMoreThan={forecast.visibilityHorizontalIsMoreThan}
											/>
										</Show>
										<Show when={forecast.skyConditions && forecast.skyConditions.length > 0}>
											<SkyConditionsElement
												skyConditions={forecast.skyConditions!}
												airport={props.airport}
												isNight={props.isNight}
											/>
										</Show>
										<Show when={forecast.weather && forecast.weather.length > 1}>
											<PrecipitationElement weather={forecast.weather!} />
										</Show>
										<Show when={forecast.altimeter && forecast.altimeter > 0}>
											<AltimeterElement altimeter={forecast.altimeter!} />
										</Show>
										<Show when={forecast.windSpeed && forecast.windDirection}>
											<WindElement
												airport={props.airport}
												windData={{
													windDirection: forecast.windDirection!,
													windSpeed: forecast.windSpeed!,
													windGust: forecast.windGust ?? 0,
													isVariable: forecast.windDirectionVariable,
												}}
												size="small"
											/>
										</Show>
										<Show when={forecast.windShearSpeed && forecast.windShearDirection}>
											<WindShearElement
												direction={forecast.windShearDirection!}
												speed={forecast.windShearSpeed!}
												height={forecast.windShearHeight ?? 0}
											/>
										</Show>
									</div>
								</div>
							)}
						</For>
					</Slider>
					<p aria-label="TAF" class="dark:text-white-dark mx-auto w-full py-16 text-center font-mono text-xl">
						{props.taf!.rawText}
					</p>
				</>
			</Show>
		</section>
	)
}

export default ForecastElements
