import { BsClockHistory, BsSunrise, BsSunset } from 'solid-icons/bs'
import { HiOutlineArrowsRightLeft } from 'solid-icons/hi'
import { Component, For, JSXElement, Show, createMemo, createSignal } from 'solid-js'
import * as SunCalc from 'suncalc'
import {
	AirportSearchFragment,
	ForecastFragment,
	TafFragment,
} from '../../queries/generated/graphql'
import { Tag } from '../Tag'
import {
	changeIndicatorCodeToText,
	changeIndicatorToSortingIndex,
	changeTypeLabel,
	changeTypePriority,
	classesForChangeType,
} from './changeIndicators'
import {
	ForecastUnitSelection,
	formatAltimeter,
	formatSkyConditions,
	formatVisibility,
	formatWind,
	formatWindCompact,
	formatWindShear,
} from './formatters'
import { WeatherDescription, decodeWeatherToken, parseWeatherTokens } from './weather'

type SunEventType = 'sunrise' | 'sunset'

interface SunEventMarker {
	type: SunEventType
	time: Date
}

export interface TimelineSegmentDisplay {
	start: Date
	end: Date
	leftPercent: number
	widthPercent: number
	forecast: ForecastFragment
	changeType: string
	weatherDetails: WeatherDescription[]
}

interface TimelineRow {
	type: string
	label: string
	segments: TimelineSegmentDisplay[]
}

interface DetailRow {
	label: string
	values: string[]
	weatherDetails?: WeatherDescription[]
}

const defined = <T,>(value: T | undefined | null): value is T => value !== undefined && value !== null

const omitNull = <T extends Record<string, unknown>>(obj: T): T => {
	const clone = { ...obj }
	Object.keys(clone)
		.filter(key => {
			const value = clone[key]
			if (value === null) {
				return true
			}
			if (Array.isArray(value)) {
				return value.length === 0
			}
			return false
		})
		.forEach(key => delete clone[key])
	return clone
}

export interface ForecastTimelineProps {
	taf?: TafFragment
	airport: AirportSearchFragment
	units: ForecastUnitSelection
	now: () => Date
	formatHourLabel: (date: Date) => string
	formatDayLabel: (date: Date) => string
	formatRange: (start: Date, end: Date) => string
	timeDisplayLabel: string
}

const ForecastTimeline: Component<ForecastTimelineProps> = props => {
	const [selectedTime, setSelectedTime] = createSignal<Date | undefined>()

	const forecastsSorted = createMemo(() => {
		let forecasts: ForecastFragment[] = props.taf?.forecast?.map(forecast => forecast) ?? []

		forecasts = forecasts.sort((x, y) => {
			const xChangeIndicator = changeIndicatorToSortingIndex(x.changeIndicator ?? '')
			const yChangeIndicator = changeIndicatorToSortingIndex(y.changeIndicator ?? '')

			const xIndex = new Date(x.fromTime).getTime() + xChangeIndicator
			const yIndex = new Date(y.fromTime).getTime() + yChangeIndicator

			return xIndex - yIndex
		})

		forecasts = forecasts.map((forecast, index, all) => {
			if (forecast.changeIndicator === 'TEMPO') {
				const previousForecast = all
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

	const timelineStart = createMemo<Date | undefined>(() => {
		if (!props.taf) {
			return undefined
		}

		const from = new Date(props.taf.validFromTime)
		const current = props.now()

		if (Number.isNaN(from.getTime()) || Number.isNaN(current.getTime())) {
			return undefined
		}

		return new Date(Math.max(from.getTime(), current.getTime()))
	})

	const timelineEnd = createMemo<Date | undefined>(() => {
		if (!props.taf) {
			return undefined
		}

		const end = new Date(props.taf.validToTime)
		return Number.isNaN(end.getTime()) ? undefined : end
	})

	const timelineDurationMs = createMemo(() => {
		const start = timelineStart()
		const end = timelineEnd()

		if (!start || !end) {
			return 0
		}

		return Math.max(end.getTime() - start.getTime(), 0)
	})

	const clampToTimeline = (timeMs: number): number | undefined => {
		const start = timelineStart()
		const end = timelineEnd()

		if (!start || !end) {
			return undefined
		}

		return Math.min(Math.max(timeMs, start.getTime()), end.getTime())
	}

	const timelineSegments = createMemo<TimelineSegmentDisplay[]>(() => {
		const start = timelineStart()
		const duration = timelineDurationMs()
		const end = timelineEnd()

		if (!start || !end || duration === 0) {
			return []
		}

		return forecastsSorted()
			.map(forecast => {
				const from = new Date(forecast.fromTime)
				const to = new Date(forecast.toTime)

				if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
					return undefined
				}

				const segmentStartMs = Math.max(from.getTime(), start.getTime())
				const segmentEndMs = Math.min(to.getTime(), end.getTime())

				if (segmentEndMs <= segmentStartMs) {
					return undefined
				}

				const changeType = forecast.changeIndicator ?? 'BASE'
				const weatherDetails = parseWeatherTokens(forecast.weather).map(token => decodeWeatherToken(token))

				return {
					start: new Date(segmentStartMs),
					end: new Date(segmentEndMs),
					leftPercent: ((segmentStartMs - start.getTime()) / duration) * 100,
					widthPercent: ((segmentEndMs - segmentStartMs) / duration) * 100,
					forecast,
					changeType,
					weatherDetails,
				}
			})
			.filter(defined)
	})

	const timelineRows = createMemo<TimelineRow[]>(() => {
		const segments = timelineSegments()

		if (!segments.length) {
			return []
		}

		const map = new Map<string, TimelineRow>()

		segments.forEach(segment => {
			const type = segment.changeType
			let row = map.get(type)

			if (!row) {
				row = {
					type,
					label: changeTypeLabel(type),
					segments: [],
				}
				map.set(type, row)
			}

			row.segments.push(segment)
		})

		return Array.from(map.values()).sort((a, b) => changeTypePriority(a.type) - changeTypePriority(b.type))
	})

	const sunEvents = createMemo<SunEventMarker[]>(() => {
		const start = timelineStart()
		const end = timelineEnd()

		if (!start || !end) {
			return []
		}

		const latitude = props.airport.latitude
		const longitude = props.airport.longitude

		const events: SunEventMarker[] = []
		const dayCursor = new Date(start)
		dayCursor.setHours(0, 0, 0, 0)

		while (dayCursor.getTime() <= end.getTime()) {
			const times = SunCalc.getTimes(new Date(dayCursor), latitude, longitude)

			const sunrise = times.sunrise
			const sunset = times.sunset

			if (sunrise && sunrise.getTime() >= start.getTime() && sunrise.getTime() <= end.getTime()) {
				events.push({ type: 'sunrise', time: sunrise })
			}

			if (sunset && sunset.getTime() >= start.getTime() && sunset.getTime() <= end.getTime()) {
				events.push({ type: 'sunset', time: sunset })
			}

			dayCursor.setDate(dayCursor.getDate() + 1)
		}

		return events.sort((a, b) => a.time.getTime() - b.time.getTime())
	})

	const sunEventPositions = createMemo(() => {
		const events = sunEvents()
		const start = timelineStart()
		const duration = timelineDurationMs()

		if (!start || duration === 0) {
			return []
		}

		return events.map(event => ({
			...event,
			leftPercent: ((event.time.getTime() - start.getTime()) / duration) * 100,
		}))
	})

	const findForecastForTime = (time: Date): ForecastFragment | undefined => {
		const entries = forecastsSorted()

		if (!entries.length) {
			return undefined
		}

		const timestamp = time.getTime()

		const matching = entries.find(forecast => {
			const from = new Date(forecast.fromTime)
			const to = new Date(forecast.toTime)

			return from.getTime() <= timestamp && to.getTime() > timestamp
		})

		if (matching) {
			return matching
		}

		const previous = entries
			.filter(forecast => new Date(forecast.fromTime).getTime() <= timestamp)
			.sort((a, b) => new Date(b.fromTime).getTime() - new Date(a.fromTime).getTime())[0]

		return previous ?? entries[0]
	}

	const cursorTime = createMemo<Date | undefined>(() => {
		const start = timelineStart()
		const end = timelineEnd()
		const duration = timelineDurationMs()

		if (!start || !end || duration === 0) {
			return undefined
		}

		const explicit = selectedTime()
		if (explicit) {
			const clamped = clampToTimeline(explicit.getTime())
			return clamped !== undefined ? new Date(clamped) : undefined
		}

		const current = props.now()
		const clamped = clampToTimeline(current.getTime())
		return clamped !== undefined ? new Date(clamped) : undefined
	})

	const cursorPercent = createMemo(() => {
		const start = timelineStart()
		const duration = timelineDurationMs()
		const time = cursorTime()

		if (!start || duration === 0 || !time) {
			return 0
		}

		return ((time.getTime() - start.getTime()) / duration) * 100
	})

	const activeSegment = createMemo<TimelineSegmentDisplay | undefined>(() => {
		const segments = timelineSegments()
		const time = cursorTime()

		if (!segments.length || !time) {
			return undefined
		}

		const timestamp = time.getTime()

		const within = segments.find(
			segment => segment.start.getTime() <= timestamp && segment.end.getTime() >= timestamp
		)

		if (within) {
			return within
		}

		return segments
			.filter(segment => segment.start.getTime() <= timestamp)
			.sort((a, b) => b.start.getTime() - a.start.getTime())[0]
	})

	const activeForecast = createMemo(() => {
		const segmentForecast = activeSegment()?.forecast

		if (segmentForecast) {
			return segmentForecast
		}

		const time = cursorTime()

		return time ? findForecastForTime(time) : undefined
	})

	const activeForecastWindow = createMemo(() => {
		const forecast = activeForecast()
		const start = timelineStart()
		const end = timelineEnd()

		if (!forecast || !start || !end) {
			return undefined
		}

		const from = new Date(forecast.fromTime)
		const to = new Date(forecast.toTime)

		if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
			return undefined
		}

		const windowStart = new Date(Math.max(from.getTime(), start.getTime()))
		const windowEnd = new Date(Math.min(to.getTime(), end.getTime()))

		return {
			start: windowStart,
			end: windowEnd,
		}
	})

	const detailRows = createMemo<DetailRow[]>(() => {
		const forecast = activeForecast()

		if (!forecast) {
			return []
		}

		const rows: DetailRow[] = []

		const wind = formatWind(forecast, props.units)
		if (wind) {
			rows.push({ label: 'Wind', values: [wind] })
		}

		const visibility = formatVisibility(forecast, props.units)
		if (visibility) {
			rows.push({ label: 'Visibility', values: [visibility] })
		}

		const skyConditions = formatSkyConditions(forecast, props.units)
		if (skyConditions.length > 0) {
			rows.push({ label: 'Sky', values: skyConditions })
		}

		const weatherTokens = parseWeatherTokens(forecast.weather)
		if (weatherTokens.length > 0) {
			const weatherDescriptions = weatherTokens.map(token => decodeWeatherToken(token))
			rows.push({
				label: 'Weather',
				values: weatherDescriptions.map(detail => detail.text),
				weatherDetails: weatherDescriptions,
			})
		}

		const altimeter = formatAltimeter(forecast, props.units)
		if (altimeter) {
			rows.push({ label: 'Altimeter', values: [altimeter] })
		}

		const windShear = formatWindShear(forecast, props.units)
		if (windShear) {
			rows.push({ label: 'Wind shear', values: [windShear] })
		}

		return rows
	})

	const timelineTicks = createMemo(() => {
		const start = timelineStart()
		const end = timelineEnd()
		const duration = timelineDurationMs()

		if (!start || !end || duration === 0) {
			return []
		}

		const ticks: Array<{ time: Date; leftPercent: number; major: boolean }> = []
		const hours = duration / (1000 * 60 * 60)
		const stepHours = hours > 48 ? 6 : hours > 24 ? 4 : hours > 12 ? 3 : 1

		const cursor = new Date(start)
		cursor.setMinutes(0, 0, 0)

		if (cursor.getTime() < start.getTime()) {
			cursor.setHours(cursor.getHours() + 1)
		}

		while (cursor.getTime() < end.getTime()) {
			const leftPercent = ((cursor.getTime() - start.getTime()) / duration) * 100
			const major = cursor.getHours() === 0 || cursor.getHours() === 12
			ticks.push({
				time: new Date(cursor),
				leftPercent,
				major,
			})
			cursor.setHours(cursor.getHours() + stepHours)
		}

		return ticks
	})

	const sunEventIcon = (event: SunEventMarker, size = 16): JSXElement =>
		event.type === 'sunrise' ? <BsSunrise size={size} /> : <BsSunset size={size} />

	const formatSunEventTooltip = (event: SunEventMarker) =>
		`${event.type === 'sunrise' ? 'Sunrise' : 'Sunset'} ${props.formatHourLabel(event.time)}`

	const midpointForSegment = (segment: TimelineSegmentDisplay): number => {
		const duration = segment.end.getTime() - segment.start.getTime()
		return segment.start.getTime() + duration / 2
	}

	const handleSegmentActivate = (segment: TimelineSegmentDisplay) => {
		const midpoint = midpointForSegment(segment)
		const clamped = clampToTimeline(midpoint)
		if (clamped !== undefined) {
			setSelectedTime(new Date(clamped))
		}
	}

	const resetSelection = () => setSelectedTime(undefined)

	return (
		<div class="w-full">
			<div class="relative w-full rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/60">
				<div class="relative grid grid-cols-[auto_1fr] gap-x-6 overflow-visible">
					<For each={timelineRows()}>
						{row => [
							<div class="flex items-center justify-end pr-2">
								<span class="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
									{row.label}
								</span>
							</div>,
							<div
								class="relative min-h-[7rem] py-4"
								onMouseLeave={resetSelection}>
								<div class="pointer-events-none absolute inset-y-4 right-0 left-0 rounded-lg border border-dashed border-slate-200 dark:border-slate-700" />
								<For each={row.segments}>
									{segment => {
										const isActive = () => activeSegment()?.forecast === segment.forecast
										const weatherPreview = () => segment.weatherDetails.slice(0, 3)
										const primaryWeather = () => weatherPreview()[0]
										const metricLines = () =>
											[
												formatWindCompact(segment.forecast, props.units),
												formatVisibility(segment.forecast, props.units),
												formatAltimeter(segment.forecast, props.units),
											]
												.filter(defined)
												.slice(0, 2)
										const clampedLeftPercent = Math.min(Math.max(segment.leftPercent, 0), 100)
										const rawWidthPercent = Math.max(segment.widthPercent, 0)
										const minWidthPercent = 0.6
										const desiredWidthPercent = Math.max(rawWidthPercent, minWidthPercent)
										const maxAllowedWidth = Math.max(rawWidthPercent, 100 - clampedLeftPercent)
										const widthPercent = Math.min(desiredWidthPercent, maxAllowedWidth)

										return (
											<button
												type="button"
												title={props.formatRange(segment.start, segment.end)}
												class={`absolute top-1/2 flex -translate-y-1/2 flex-col justify-center gap-2 rounded-lg border px-3 py-2 text-[0.65rem] leading-tight transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${classesForChangeType(segment.changeType, isActive())} ${isActive() ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-200'}`}
												style={{
													left: `${clampedLeftPercent}%`,
													width: `${widthPercent.toFixed(4)}%`,
												}}
												onMouseEnter={() => handleSegmentActivate(segment)}
												onFocus={() => handleSegmentActivate(segment)}
												onMouseLeave={resetSelection}
												onBlur={resetSelection}
												onClick={() => handleSegmentActivate(segment)}>
												<div class="flex flex-wrap items-center justify-center gap-1 text-[0.58rem] font-semibold tracking-wide uppercase">
													<span>{props.formatHourLabel(segment.start)}</span>
													<span>→</span>
													<span>{props.formatHourLabel(segment.end)}</span>
												</div>
												<div class="flex flex-col items-center justify-center gap-2">
													<Show
														when={weatherPreview().length > 0}
														fallback={
															<span class="text-[0.58rem] text-slate-500 dark:text-slate-300">
																No wx data
															</span>
														}>
														<div class="flex items-center justify-center gap-1">
															<For each={weatherPreview()}>
																{detail => (
																	<span
																		class="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-base text-slate-700 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"
																		title={detail.text}>
																		<Show
																			when={detail.icon}
																			fallback={
																				<span class="text-[0.6rem] font-semibold uppercase">
																					{detail.token}
																				</span>
																			}>
																			{detail.icon}
																		</Show>
																	</span>
																)}
															</For>
														</div>
														<Show when={primaryWeather()?.text}>
															<span class="text-[0.6rem] text-slate-500 dark:text-slate-300">
																{primaryWeather()!.text}
															</span>
														</Show>
													</Show>
													<Show when={metricLines().length > 0}>
														<div class="flex flex-col items-center text-[0.58rem] text-slate-600 dark:text-slate-300">
															<For each={metricLines()}>{line => <span>{line}</span>}</For>
														</div>
													</Show>
												</div>
												<div class="flex items-center justify-center gap-2 text-[0.55rem] tracking-wide uppercase">
													<Show when={segment.forecast.changeIndicator}>
														<span>{segment.forecast.changeIndicator}</span>
													</Show>
													<Show
														when={
															segment.forecast.changeProbability !== null &&
															segment.forecast.changeProbability !== undefined
														}>
														<span>{segment.forecast.changeProbability}%</span>
													</Show>
												</div>
											</button>
										)
									}}
								</For>
							</div>,
						]}
					</For>
				</div>
				<For each={sunEventPositions()}>
					{event => (
						<div
							class="pointer-events-none absolute top-6 flex -translate-x-1/2 transform flex-col items-center gap-1 text-amber-500 dark:text-amber-300"
							style={{ left: `${event.leftPercent}%` }}>
							<span
								class="rounded-full bg-white/70 p-1 shadow-sm dark:bg-slate-800/80"
								title={formatSunEventTooltip(event)}>
								{sunEventIcon(event)}
							</span>
							<span class="text-[0.55rem] text-amber-500/80 dark:text-amber-300/80">
								{props.formatHourLabel(event.time)}
							</span>
						</div>
					)}
				</For>
				<Show when={timelineTicks().length > 0}>
					<div class="pointer-events-none absolute right-0 -bottom-12 left-0">
						<For each={timelineTicks()}>
							{tick => (
								<div
									class={`absolute flex -translate-x-1/2 transform flex-col items-center gap-1 text-[0.55rem] text-slate-400 dark:text-slate-500 ${
										tick.major ? 'font-semibold text-slate-500 dark:text-slate-300' : ''
									}`}
									style={{ left: `${tick.leftPercent}%` }}>
									<span class="h-3 w-px bg-slate-300 dark:bg-slate-600" />
									<span>{props.formatHourLabel(tick.time)}</span>
									<span class="text-[0.5rem]">{props.formatDayLabel(tick.time)}</span>
								</div>
							)}
						</For>
					</div>
				</Show>
				<Show when={cursorTime()}>
					{time => (
						<div
							class="pointer-events-none absolute top-0 bottom-0 -translate-x-1/2 transform"
							style={{ left: `${cursorPercent()}%` }}>
							<div class="flex flex-col items-center gap-2">
								<span class="rounded-md bg-sky-500 px-2 py-1 text-[0.6rem] font-semibold text-white shadow-sm dark:bg-sky-400 dark:text-slate-900">
									{props.formatHourLabel(time())}
								</span>
								<div class="h-full w-px bg-sky-500/60 dark:bg-sky-400/60" />
							</div>
						</div>
					)}
				</Show>
			</div>
			<Show when={activeForecast()}>
				{forecast => (
					<div class="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/50">
						<div class="flex flex-wrap items-baseline justify-between gap-3">
							<div>
								{(() => {
									const window = activeForecastWindow()

									if (!window) {
										return (
											<p class="text-sm text-slate-500 dark:text-slate-400">
												Forecast window unavailable
											</p>
										)
									}

									return (
										<>
											<p class="text-sm font-semibold text-slate-600 dark:text-slate-300">
												{props.formatDayLabel(window.start)}
											</p>
											<p class="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
												Forecast window ({props.timeDisplayLabel})
											</p>
											<p class="dark:text-white-dark text-lg font-semibold text-slate-900">
												{props.formatRange(window.start, window.end)}
											</p>
										</>
									)
								})()}
							</div>
							<div class="flex flex-wrap gap-2">
								<Show when={forecast().changeIndicator}>
									{indicator => (
										<Tag
											tooltip={`Change indicator: ${changeIndicatorCodeToText(indicator) || indicator}`}>
											<Show
												when={indicator === 'TEMPO'}
												fallback={<HiOutlineArrowsRightLeft class="my-auto" />}>
												<BsClockHistory class="my-auto" />
											</Show>
											<span>{indicator}</span>
										</Tag>
									)}
								</Show>
								<Show
									when={
										forecast().changeProbability !== null &&
										forecast().changeProbability !== undefined
									}>
									<Tag tooltip="Probability">
										<span>{forecast().changeProbability}%</span>
									</Tag>
								</Show>
							</div>
						</div>
						<Show
							when={detailRows().length > 0}
							fallback={
								<p class="mt-4 text-sm text-slate-500 dark:text-slate-400">
									No detailed conditions for this hour.
								</p>
							}>
							<div class="mt-4 grid gap-4 md:grid-cols-2">
								<For each={detailRows()}>
									{row => (
										<div class="flex flex-col gap-2 rounded-lg bg-slate-100/70 p-3 text-sm text-slate-800 dark:bg-slate-800/40 dark:text-slate-200">
											<span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
												{row.label}
											</span>
											<Show
												when={row.weatherDetails && row.weatherDetails.length > 0}
												fallback={
													<div class="space-y-1">
														<For each={row.values}>{value => <p>{value}</p>}</For>
													</div>
												}>
												<div class="flex flex-wrap gap-2">
													<For each={row.weatherDetails}>
														{detail => (
															<div class="flex items-center gap-2 rounded-md bg-white/80 px-2 py-1 text-xs font-medium text-slate-700 shadow-sm dark:bg-slate-900/60 dark:text-slate-200">
																<Show when={detail.icon}>
																	<span class="text-base text-slate-600 dark:text-slate-200">
																		{detail.icon}
																	</span>
																</Show>
																<span>{detail.text}</span>
															</div>
														)}
													</For>
												</div>
											</Show>
										</div>
									)}
								</For>
							</div>
						</Show>
					</div>
				)}
			</Show>
		</div>
	)
}

export default ForecastTimeline
