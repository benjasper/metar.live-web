import { BsClockHistory, BsSunrise, BsSunset } from 'solid-icons/bs'
import { HiOutlineArrowsRightLeft } from 'solid-icons/hi'
import {
	RiWeatherDrizzleLine,
	RiWeatherFoggyLine,
	RiWeatherHailLine,
	RiWeatherHazeLine,
	RiWeatherMistLine,
	RiWeatherShowersLine,
	RiWeatherSnowyLine,
	RiWeatherThunderstormsLine,
	RiWeatherTornadoLine,
	RiWeatherWindyLine,
} from 'solid-icons/ri'
import { Component, JSXElement, createEffect, createMemo, createSignal, For, Match, Show, Switch } from 'solid-js'
import { useTimeStore } from '../context/TimeStore'
import { useUnitStore } from '../context/UnitStore'
import Duration from '../models/duration'
import { PressureUnit } from '../models/units'
import {
	AirportSearchFragment,
	ForecastChangeIndicator,
	ForecastFragment,
	TafFragment,
} from '../queries/generated/graphql'
import { Tag } from './Tag'
import Toggle from './Toggle'
import * as SunCalc from 'suncalc'

export interface ForecastElementsProps {
	taf?: TafFragment
	airport: AirportSearchFragment
	isNight: boolean
}

type SunEventType = 'sunrise' | 'sunset'

interface SunEventMarker {
	type: SunEventType
	time: Date
}

interface TimelineSliceData {
	start: Date
	end: Date
	forecast?: ForecastFragment
	sunEvents: SunEventMarker[]
	index: number
}

interface WeatherDescription {
	token: string
	text: string
	icon?: JSXElement
}

interface DetailRow {
	label: string
	values: string[]
	weatherDetails?: WeatherDescription[]
}

interface TimelineDayGroup {
	key: string
	slices: TimelineSliceData[]
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

const sunEventIcon = (event: SunEventMarker, size = 16) =>
	event.type === 'sunrise' ? <BsSunrise size={size} /> : <BsSunset size={size} />

const intensityText: Record<string, string> = {
	'-': 'Light',
	'+': 'Heavy',
}

const proximityText: Record<string, string> = {
	VC: 'Vicinity',
	RE: 'Recent',
}

const descriptorText: Record<string, string> = {
	MI: 'Shallow',
	PR: 'Partial',
	BC: 'Patches',
	DR: 'Low drifting',
	BL: 'Blowing',
	SH: 'Showers',
	TS: 'Thunderstorm',
	FZ: 'Freezing',
}

const precipitationText: Record<string, string> = {
	DZ: 'Drizzle',
	RA: 'Rain',
	SN: 'Snow',
	SG: 'Snow grains',
	GR: 'Hail',
	GS: 'Small hail',
	PL: 'Ice pellets',
	IC: 'Ice crystals',
	UP: 'Unknown precipitation',
}

const obscurationText: Record<string, string> = {
	BR: 'Mist',
	FG: 'Fog',
	FU: 'Smoke',
	VA: 'Volcanic ash',
	DU: 'Dust',
	SA: 'Sand',
	HZ: 'Haze',
	PY: 'Spray',
}

const otherWeatherText: Record<string, string> = {
	PO: 'Dust whirls',
	DS: 'Duststorm',
	SS: 'Sandstorm',
	SQ: 'Squalls',
	FC: 'Funnel cloud',
}

const chooseWeatherIcon = (params: {
	descriptors: string[]
	precipitation: string[]
	obscurations: string[]
	other: string[]
}): JSXElement | undefined => {
	const { descriptors, precipitation, obscurations, other } = params

	if (other.includes('FC')) {
		return <RiWeatherTornadoLine />
	}

	if (descriptors.includes('TS')) {
		return <RiWeatherThunderstormsLine />
	}

	if (precipitation.includes('SN') || precipitation.includes('SG')) {
		return <RiWeatherSnowyLine />
	}

	if (precipitation.includes('GR') || precipitation.includes('GS') || precipitation.includes('PL')) {
		return <RiWeatherHailLine />
	}

	if (obscurations.includes('FG')) {
		return <RiWeatherFoggyLine />
	}

	if (obscurations.includes('BR') || obscurations.includes('PY')) {
		return <RiWeatherMistLine />
	}

	if (obscurations.includes('HZ') || obscurations.includes('FU') || obscurations.includes('VA')) {
		return <RiWeatherHazeLine />
	}

	if (precipitation.includes('DZ')) {
		return <RiWeatherDrizzleLine />
	}

	if (precipitation.includes('RA') || descriptors.includes('SH')) {
		return <RiWeatherShowersLine />
	}

	if (
		other.includes('DS') ||
		other.includes('SS') ||
		other.includes('SQ') ||
		descriptors.includes('BL') ||
		descriptors.includes('DR')
	) {
		return <RiWeatherWindyLine />
	}

	return undefined
}

const decodeWeatherToken = (token: string): WeatherDescription => {
	const originalToken = token
	let working = token.trim().toUpperCase()

	if (!working) {
		return {
			token: originalToken,
			text: 'No weather reported',
		}
	}

	let intensity: string | undefined
	if (working.startsWith('+') || working.startsWith('-')) {
		intensity = working[0]
		working = working.slice(1)
	}

	const proximities: string[] = []
	for (const proximity of ['VC', 'RE']) {
		if (working.startsWith(proximity)) {
			proximities.push(proximity)
			working = working.slice(proximity.length)
		}
	}

	if (working === 'NSW') {
		return {
			token: originalToken,
			text: 'No significant weather',
		}
	}

	const descriptorCodes = Object.keys(descriptorText)
	const descriptors: string[] = []
	let matchedDescriptor = true
	while (matchedDescriptor) {
		matchedDescriptor = false
		for (const code of descriptorCodes) {
			if (working.startsWith(code)) {
				descriptors.push(code)
				working = working.slice(code.length)
				matchedDescriptor = true
				break
			}
		}
	}

	const precipitation: string[] = []
	const obscurations: string[] = []
	const other: string[] = []

	while (working.length > 0) {
		if (working.length >= 2) {
			const code = working.slice(0, 2)
			if (precipitationText[code]) {
				precipitation.push(code)
				working = working.slice(2)
				continue
			}

			if (obscurationText[code]) {
				obscurations.push(code)
				working = working.slice(2)
				continue
			}

			if (otherWeatherText[code]) {
				other.push(code)
				working = working.slice(2)
				continue
			}
		}

		// Fallback: consume the rest to avoid an infinite loop
		if (working) {
			other.push(working)
			working = ''
		}
	}

	const proximityWords = proximities.map(code => proximityText[code] ?? code)
	const intensityWord = intensity ? (intensityText[intensity] ?? intensity) : undefined
	const descriptorWords = descriptors.map(code => descriptorText[code] ?? code)
	const precipitationWords = precipitation.map(code => precipitationText[code] ?? code)
	const obscurationWords = obscurations.map(code => obscurationText[code] ?? code)
	const otherWords = other.map(code => otherWeatherText[code] ?? code)

	const textParts = [
		...proximityWords,
		intensityWord,
		...descriptorWords,
		...precipitationWords,
		...obscurationWords,
		...otherWords,
	].filter(Boolean) as string[]

	const icon = chooseWeatherIcon({
		descriptors,
		precipitation,
		obscurations,
		other,
	})

	return {
		token: originalToken,
		text: textParts.length > 0 ? textParts.join(' ') : originalToken,
		icon,
	}
}

const ForecastElements: Component<ForecastElementsProps> = props => {
	const now = useTimeStore()
	const [unitStore] = useUnitStore()
	const [activeSliceIndex, setActiveSliceIndex] = createSignal(0)

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

	const selectedSpeedUnit = () => unitStore.speed.units[unitStore.speed.selected]
	const selectedLengthUnit = () => unitStore.length.units[unitStore.length.selected]
	const selectedHeightUnit = () => unitStore.height.units[unitStore.height.selected]
	const selectedPressureUnit = () => unitStore.pressure.units[unitStore.pressure.selected]

	const selectedTimeZone = () => (isLocalTime() ? (props.airport.timezone ?? '') : browserTimezone)

	const isValidDate = (date: Date) => !Number.isNaN(date.getTime())

	const defined = <T,>(value: T | undefined | null): value is T => value !== undefined && value !== null

	const timelineStart = createMemo<Date | undefined>(() => {
		if (!props.taf) {
			return undefined
		}

		const from = validFrom()
		const current = now()

		if (!isValidDate(from) || !isValidDate(current)) {
			return undefined
		}

		const start = new Date(Math.max(from.getTime(), current.getTime()))

		return isValidDate(start) ? start : undefined
	})

	const timelineEnd = createMemo<Date | undefined>(() => {
		if (!props.taf) {
			return undefined
		}

		const end = validTo()

		return isValidDate(end) ? end : undefined
	})

	const timelineSlices = createMemo<Array<{ start: Date; end: Date }>>(() => {
		const start = timelineStart()
		const end = timelineEnd()

		if (!start || !end) {
			return []
		}

		const alignToHour = (date: Date) => {
			const aligned = new Date(date)
			aligned.setMinutes(0, 0, 0)
			return aligned
		}

		const slices: Array<{ start: Date; end: Date }> = []
		const firstHourStart = alignToHour(start)

		if (firstHourStart.getTime() > start.getTime()) {
			firstHourStart.setHours(firstHourStart.getHours() - 1)
		}

		const cursor = new Date(firstHourStart)

		while (cursor.getTime() < end.getTime()) {
			const sliceStart = new Date(cursor)
			const sliceEnd = new Date(cursor)
			sliceEnd.setHours(sliceEnd.getHours() + 1)
			slices.push({ start: sliceStart, end: sliceEnd })
			cursor.setHours(cursor.getHours() + 1)
		}

		return slices
			.filter(slice => slice.end.getTime() > start.getTime())
			.map((slice, index) => ({
				start: index === 0 ? start : slice.start,
				end: slice.end.getTime() > end.getTime() ? end : slice.end,
			}))
	})

	const findForecastForTime = (time: Date): ForecastFragment | undefined => {
		const entries = forecastsSorted()

		if (!entries.length) {
			return undefined
		}

		const matching = entries.find(forecast => {
			const from = new Date(forecast.fromTime)
			const to = new Date(forecast.toTime)

			return from.getTime() <= time.getTime() && to.getTime() > time.getTime()
		})

		if (matching) {
			return matching
		}

		const previous = entries
			.filter(forecast => new Date(forecast.fromTime).getTime() <= time.getTime())
			.sort((a, b) => new Date(b.fromTime).getTime() - new Date(a.fromTime).getTime())[0]

		return previous ?? entries[0]
	}

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

	const slicesWithData = createMemo<TimelineSliceData[]>(() =>
		timelineSlices().map((slice, index) => {
			const midpoint = new Date((slice.start.getTime() + slice.end.getTime()) / 2)
			const forecast = findForecastForTime(midpoint)
			const markers = sunEvents().filter(
				event => event.time.getTime() >= slice.start.getTime() && event.time.getTime() < slice.end.getTime()
			)

			return {
				start: slice.start,
				end: slice.end,
				forecast,
				sunEvents: markers,
				index,
			}
		})
	)

	const slicesGroupedByDay = createMemo<TimelineDayGroup[]>(() => {
		const timezone = selectedTimeZone()
		const slices = slicesWithData()

		if (!slices.length) {
			return []
		}

		const groups: TimelineDayGroup[] = []
		const map = new Map<string, TimelineDayGroup>()

		slices.forEach(slice => {
			const key = slice.start.toLocaleDateString('en-CA', { timeZone: timezone })
			let group = map.get(key)

			if (!group) {
				group = { key, slices: [] }
				map.set(key, group)
				groups.push(group)
			}

			group.slices.push(slice)
		})

		return groups
	})

	createEffect(() => {
		const slices = slicesWithData()

		if (!slices.length) {
			setActiveSliceIndex(0)
			return
		}

		if (activeSliceIndex() > slices.length - 1) {
			setActiveSliceIndex(slices.length - 1)
		}
	})

	const activeSlice = createMemo<TimelineSliceData | undefined>(() => {
		const slices = slicesWithData()

		if (!slices.length) {
			return undefined
		}

		const index = Math.min(activeSliceIndex(), slices.length - 1)

		return slices[index]
	})

	const activeForecast = createMemo(() => activeSlice()?.forecast)

	const formatHourLabel = (date: Date) =>
		date.toLocaleTimeString([], {
			hour: 'numeric',
			minute: '2-digit',
			timeZone: selectedTimeZone(),
		})

	const formatDayLabel = (date: Date) =>
		date.toLocaleDateString([], {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			timeZone: selectedTimeZone(),
		})

	const formatRange = (start: Date, end: Date) => {
		const sameDay = start.toDateString() === end.toDateString()

		const startOptions: Intl.DateTimeFormatOptions = sameDay
			? { hour: 'numeric', minute: '2-digit', timeZone: selectedTimeZone() }
			: {
					weekday: 'short',
					month: 'short',
					day: 'numeric',
					hour: 'numeric',
					minute: '2-digit',
					timeZone: selectedTimeZone(),
				}

		const endOptions: Intl.DateTimeFormatOptions = sameDay
			? { hour: 'numeric', minute: '2-digit', timeZone: selectedTimeZone() }
			: { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: selectedTimeZone() }

		return `${start.toLocaleString([], startOptions)} – ${end.toLocaleString([], endOptions)}`
	}

	const formatSunEventTooltip = (event: SunEventMarker) =>
		`${event.type === 'sunrise' ? 'Sunrise' : 'Sunset'} ${event.time.toLocaleTimeString([], {
			hour: 'numeric',
			minute: '2-digit',
			timeZone: selectedTimeZone(),
		})}`

	const formatWind = (forecast?: ForecastFragment): string | undefined => {
		if (!forecast) {
			return undefined
		}

		if (!forecast.windSpeed || forecast.windSpeed === 0) {
			return 'Calm'
		}

		const parts: string[] = []

		if (forecast.windDirectionVariable) {
			parts.push('VRB')
		} else if (forecast.windDirection) {
			parts.push(`${forecast.windDirection}°`)
		} else {
			parts.push('Variable')
		}

		const speed = Math.round(selectedSpeedUnit().conversionFunction(forecast.windSpeed))
		parts.push(`at ${speed} ${selectedSpeedUnit().symbol}`)

		if (forecast.windGust) {
			const gust = Math.round(selectedSpeedUnit().conversionFunction(forecast.windGust))
			parts.push(`gusting ${gust} ${selectedSpeedUnit().symbol}`)
		}

		return parts.join(' ')
	}

	const formatWindCompact = (forecast?: ForecastFragment): string | undefined => {
		if (!forecast) {
			return undefined
		}

		if (!forecast.windSpeed || forecast.windSpeed === 0) {
			return 'Calm'
		}

		const direction = forecast.windDirectionVariable
			? 'VRB'
			: forecast.windDirection
				? `${forecast.windDirection}°`
				: 'VAR'

		const speed = Math.round(selectedSpeedUnit().conversionFunction(forecast.windSpeed))
		const gust = forecast.windGust
			? Math.round(selectedSpeedUnit().conversionFunction(forecast.windGust))
			: undefined

		return `${direction} ${speed}${selectedSpeedUnit().symbol}${gust ? ` G${gust}` : ''}`
	}

	const formatVisibility = (forecast?: ForecastFragment): string | undefined => {
		if (!forecast || !forecast.visibilityHorizontal) {
			return undefined
		}

		const converted = selectedLengthUnit().conversionFunction(forecast.visibilityHorizontal)
		const formatted =
			converted >= 10 ? Math.round(converted).toString() : (Math.round(converted * 10) / 10).toFixed(1)

		if (forecast.visibilityHorizontalIsMoreThan) {
			return `≥ ${formatted} ${selectedLengthUnit().symbol}`
		}

		return `${formatted} ${selectedLengthUnit().symbol}`
	}

	const formatAltimeter = (forecast?: ForecastFragment): string | undefined => {
		if (!forecast || !forecast.altimeter) {
			return undefined
		}

		const unit = selectedPressureUnit()
		const converted = unit.conversionFunction(forecast.altimeter)

		const formatted =
			unit.symbol === PressureUnit.InchesOfMercury
				? (Math.round((converted + Number.EPSILON) * 100) / 100).toFixed(2)
				: Math.round(converted).toString()

		return `${formatted} ${unit.symbol}`
	}

	const skyCoverText: Record<string, string> = {
		SKC: 'Sky clear',
		CLR: 'Clear',
		NSC: 'No significant clouds',
		FEW: 'Few',
		SCT: 'Scattered',
		BKN: 'Broken',
		OVC: 'Overcast',
		VV: 'Vertical visibility',
	}

	const formatSkyConditions = (forecast?: ForecastFragment): string[] => {
		if (!forecast || !forecast.skyConditions || forecast.skyConditions.length === 0) {
			return []
		}

		return forecast.skyConditions.map(condition => {
			const cover = skyCoverText[condition.skyCover] ?? condition.skyCover
			const base =
				condition.cloudBase !== null && condition.cloudBase !== undefined
					? Math.round(selectedHeightUnit().conversionFunction(condition.cloudBase))
					: undefined
			const baseText = base !== undefined ? `${base.toLocaleString()} ${selectedHeightUnit().symbol}` : undefined
			const typeText = condition.cloudType ? ` (${condition.cloudType})` : ''

			return baseText ? `${cover} @ ${baseText}${typeText}` : `${cover}${typeText}`
		})
	}

	const parseWeatherTokens = (weather?: string | null): string[] => {
		if (!weather) {
			return []
		}

		const tokens = weather.match(/(?:\+|-)?(?:VC|RE)?[A-Z]{2,3}|NSW/g)

		if (tokens && tokens.length > 0) {
			return tokens
		}

		return [weather.trim()].filter(Boolean)
	}

	const formatWindShear = (forecast?: ForecastFragment): string | undefined => {
		if (!forecast || !forecast.windShearSpeed) {
			return undefined
		}

		const direction = forecast.windShearDirection ? `${forecast.windShearDirection}°` : 'Variable'
		const speed = Math.round(selectedSpeedUnit().conversionFunction(forecast.windShearSpeed))
		const height =
			forecast.windShearHeight !== null && forecast.windShearHeight !== undefined
				? Math.round(selectedHeightUnit().conversionFunction(forecast.windShearHeight))
				: undefined
		const heightText = height !== undefined ? ` near ${height} ${selectedHeightUnit().symbol}` : ''

		return `${direction} at ${speed} ${selectedSpeedUnit().symbol}${heightText}`
	}

	const detailRows = createMemo<DetailRow[]>(() => {
		const forecast = activeForecast()

		if (!forecast) {
			return []
		}

		const rows: DetailRow[] = []

		const wind = formatWind(forecast)
		if (wind) {
			rows.push({ label: 'Wind', values: [wind] })
		}

		const visibility = formatVisibility(forecast)
		if (visibility) {
			rows.push({ label: 'Visibility', values: [visibility] })
		}

		const skyConditions = formatSkyConditions(forecast)
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

		const altimeter = formatAltimeter(forecast)
		if (altimeter) {
			rows.push({ label: 'Altimeter', values: [altimeter] })
		}

		const windShear = formatWindShear(forecast)
		if (windShear) {
			rows.push({ label: 'Wind shear', values: [windShear] })
		}

		return rows
	})

	return (
		<section class="dark:text-white-dark flex w-full flex-col">
			<h2 class="dark:text-white-dark text-2xl">Current forecast</h2>
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
					<div class="mt-6 flex flex-col gap-6">
						<div class="overflow-x-auto pb-2">
							<Show
								when={slicesGroupedByDay().length > 0}
								fallback={
									<span class="dark:text-white-dark block py-6 text-center text-sm text-slate-500">
										No future forecast slices available.
									</span>
								}>
								<div class="flex w-full gap-6">
									<For each={slicesGroupedByDay()}>
										{group => (
											<div class="flex min-w-fit flex-col gap-2">
												<span class="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
													{formatDayLabel(group.slices[0].start)}
												</span>
												<div class="flex gap-2">
													<For each={group.slices}>
														{slice => {
															const isActive = () => slice.index === activeSliceIndex()
															const forecast = slice.forecast
															const weatherDetails = forecast
																? parseWeatherTokens(forecast.weather).map(
																		decodeWeatherToken
																	)
																: []
															const weatherPreview = weatherDetails.slice(0, 3)
															const primaryWeather = weatherDetails[0]
															const metricLines = [
																formatWindCompact(forecast),
																formatVisibility(forecast),
																formatAltimeter(forecast),
															]
																.filter(defined)
																.slice(0, 2)

															return (
																<div class="relative flex w-[6.25rem] flex-col items-center pt-4">
																	<Show when={slice.sunEvents.length > 0}>
																		<div class="absolute -top-5 flex gap-1 text-base text-amber-500 dark:text-amber-300">
																			<For each={slice.sunEvents}>
																				{event => (
																					<span
																						title={formatSunEventTooltip(
																							event
																						)}>
																						{sunEventIcon(event)}
																					</span>
																				)}
																			</For>
																		</div>
																	</Show>
																	<button
																		type="button"
																		class={`group flex h-[6.75rem] w-full flex-col justify-between rounded-2xl border px-3 py-3 text-[0.7rem] transition-colors ${
																			isActive()
																				? 'border-sky-500 bg-white text-slate-900 shadow-md dark:border-sky-400 dark:bg-sky-900/40 dark:text-white'
																				: 'border-transparent bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-700'
																		}`}
																		onMouseEnter={() =>
																			setActiveSliceIndex(slice.index)
																		}
																		onFocus={() => setActiveSliceIndex(slice.index)}
																		onClick={() =>
																			setActiveSliceIndex(slice.index)
																		}>
																		<div class="flex flex-col items-center gap-1 text-center">
																			<span class="text-[0.8rem] font-semibold text-slate-700 dark:text-white">
																				{formatHourLabel(slice.start)}
																			</span>
																			<span class="text-[0.65rem] text-slate-500 dark:text-slate-300">
																				→ {formatHourLabel(slice.end)}
																			</span>
																		</div>
																		<div class="flex flex-1 flex-col items-center justify-center gap-2">
																			<Show
																				when={weatherPreview.length > 0}
																				fallback={
																					<span class="text-[0.6rem] text-slate-500 dark:text-slate-300">
																						No wx data
																					</span>
																				}>
																				<div class="flex items-center justify-center gap-1">
																					<For each={weatherPreview}>
																						{detail => (
																							<span
																								class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200/70 text-base text-slate-700 dark:bg-slate-700/70 dark:text-slate-100"
																								title={detail.text}>
																								<Show
																									when={detail.icon}
																									fallback={
																										<span class="text-[0.6rem] font-semibold uppercase">
																											{
																												detail.token
																											}
																										</span>
																									}>
																									{detail.icon}
																								</Show>
																							</span>
																						)}
																					</For>
																				</div>
																				<Show when={primaryWeather?.text}>
																					<span class="mt-1 block text-[0.6rem] text-slate-500 dark:text-slate-300">
																						{primaryWeather!.text}
																					</span>
																				</Show>
																			</Show>
																			<Show when={metricLines.length > 0}>
																				<div class="flex flex-col items-center text-[0.6rem] leading-tight text-slate-600 dark:text-slate-300">
																					<For each={metricLines}>
																						{line => <span>{line}</span>}
																					</For>
																				</div>
																			</Show>
																		</div>
																		<div class="flex min-h-[1.6rem] w-full items-center justify-center">
																			<Show
																				when={slice.forecast?.changeIndicator}>
																				<Tag
																					class="w-full justify-center rounded-lg px-2 py-1 text-[0.55rem]"
																					tooltip={`Change indicator: ${changeIndicatorCodeToText(
																						slice.forecast!.changeIndicator!
																					)}`}>
																					<Show
																						when={
																							slice.forecast
																								?.changeIndicator ===
																							ForecastChangeIndicator.Tempo
																						}
																						fallback={
																							<HiOutlineArrowsRightLeft
																								class="my-auto"
																								size={12}
																							/>
																						}>
																						<BsClockHistory
																							class="my-auto"
																							size={12}
																						/>
																					</Show>
																					<span class="whitespace-nowrap">
																						{
																							slice.forecast
																								?.changeIndicator
																						}
																					</span>
																				</Tag>
																			</Show>
																		</div>
																	</button>
																</div>
															)
														}}
													</For>
												</div>
											</div>
										)}
									</For>
								</div>
							</Show>
						</div>
						<Show when={activeSlice()}>
							<div class="flex flex-col gap-3">
								<div class="flex flex-wrap items-baseline justify-between gap-3">
									<div>
										<p class="text-sm font-semibold text-slate-600 dark:text-slate-300">
											{formatDayLabel(activeSlice()!.start)}
										</p>
										<p class="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
											Forecast window ({isLocalTime() ? 'Airport local time' : 'My time'})
										</p>
										<p class="dark:text-white-dark text-lg font-semibold text-slate-900">
											{formatRange(activeSlice()!.start, activeSlice()!.end)}
										</p>
									</div>
									<div class="flex flex-wrap gap-2">
										<Show when={activeForecast()?.changeIndicator}>
											<Tag
												tooltip={`Change indicator: ${changeIndicatorCodeToText(
													activeForecast()!.changeIndicator!
												)}`}>
												<Show
													when={
														activeForecast()?.changeIndicator ===
														ForecastChangeIndicator.Tempo
													}
													fallback={<HiOutlineArrowsRightLeft class="my-auto" />}>
													<BsClockHistory class="my-auto" />
												</Show>
												<span>{activeForecast()?.changeIndicator}</span>
											</Tag>
										</Show>
										<Show
											when={
												activeForecast()?.changeProbability !== null &&
												activeForecast()?.changeProbability !== undefined
											}>
											<Tag tooltip="Probability">
												<span>{activeForecast()?.changeProbability}%</span>
											</Tag>
										</Show>
									</div>
								</div>
								<div class="flex min-h-[10.5rem] flex-col justify-center rounded-xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/60">
									<Show
										when={detailRows().length > 0}
										fallback={
											<p class="text-sm text-slate-500 dark:text-slate-400">
												No detailed conditions for this hour.
											</p>
										}>
										<div class="flex flex-col gap-3">
											<For each={detailRows()}>
												{row => (
													<div class="flex items-start gap-3">
														<span class="w-28 shrink-0 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
															{row.label}
														</span>
														<div class="dark:text-white-dark flex-1 text-sm text-slate-900">
															<Show
																when={
																	row.weatherDetails && row.weatherDetails.length > 0
																}
																fallback={
																	<div class="space-y-1">
																		<For each={row.values}>
																			{value => <p>{value}</p>}
																		</For>
																	</div>
																}>
																<div class="flex flex-wrap gap-2">
																	<For each={row.weatherDetails}>
																		{detail => (
																			<div class="flex items-center gap-2 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
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
													</div>
												)}
											</For>
										</div>
									</Show>
								</div>
							</div>
						</Show>
					</div>
					<p aria-label="TAF" class="dark:text-white-dark mx-auto w-full py-16 text-center font-mono text-xl">
						{props.taf!.rawText}
					</p>
				</>
			</Show>
		</section>
	)
}

export default ForecastElements
