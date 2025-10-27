import { Component, For, Match, Show, Switch, createMemo } from 'solid-js'
import type { JSX } from 'solid-js'
import { useUnitStore } from '../../context/UnitStore'
import { ForecastChangeIndicator, SkyConditionSkyCover } from '../../queries/generated/graphql'
import { EffectiveConditions, ForecastSnapshot, SnapshotFieldKey, describeIndicator } from './timelineUtils'
import {
	extractWeatherTokens,
	getWeatherIconForCondition,
	summarizeWeatherCondition,
} from '../weather-elements/PrecipitationElement'
import { TbCloud, TbCloudRain, TbEye, TbGauge, TbWind } from 'solid-icons/tb'

interface TimelineHoverSummaryProps {
	focusTime: Date
	timezone: string
	timezoneLabel: string
	effective: EffectiveConditions | null
	isPinned: boolean
	canFollowLive: boolean
	onFollowLive: () => void
}

interface SummaryMetric {
	key: string
	label: string
	value?: string
	badge?: string
	icon: JSX.Element
	chips?: Array<{ label: string; icon: JSX.Element | null }>
}

const getSkyCoverLabel = (cover: SkyConditionSkyCover) => {
	const map: Record<SkyConditionSkyCover, string> = {
		BKN: 'Broken',
		CAVOK: 'CAVOK',
		CLR: 'Clear',
		FEW: 'Few',
		NSC: 'No significant clouds',
		OVC: 'Overcast',
		OVCX: 'Obscured',
		OVX: 'Obscured',
		SCT: 'Scattered',
		SKC: 'Sky clear',
	}
	return map[cover] ?? cover
}

const formatSkyLayer = (
	layer: NonNullable<ForecastSnapshot['skyConditions']>[number],
	convert: (value: number) => number,
	unitSymbol: string
) => {
	const base = layer.cloudBase ? `${Math.round(convert(layer.cloudBase))}${unitSymbol}` : ''
	return [getSkyCoverLabel(layer.skyCover), base].filter(Boolean).join(' ')
}

const TimelineHoverSummary: Component<TimelineHoverSummaryProps> = props => {
	const [unitStore] = useUnitStore()

	const sourceBadge = (key: SnapshotFieldKey) => {
		const source = props.effective?.sources[key]
		if (!source) {
			return undefined
		}
		return describeIndicator(source)
	}

	const speedUnit = () => unitStore.speed.units[unitStore.speed.selected]
	const lengthUnit = () => unitStore.length.units[unitStore.length.selected]
	const heightUnit = () => unitStore.height.units[unitStore.height.selected]
	const pressureUnit = () => unitStore.pressure.units[unitStore.pressure.selected]

	const timeLabel = createMemo(() =>
		props.focusTime.toLocaleString([], {
			weekday: 'short',
			day: '2-digit',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit',
			timeZone: props.timezone,
		})
	)

	const activeGroups = createMemo(() => {
		if (!props.effective) {
			return []
		}
		const seen = new Set<string>()
		return props.effective.contributors
			.map(contributor => {
				if (!contributor.changeIndicator || contributor.changeIndicator === ForecastChangeIndicator.Fm) {
					return contributor.changeIndicator === ForecastChangeIndicator.Fm ? 'FM' : 'BASE'
				}
				return describeIndicator(contributor)
			})
			.filter(label => {
				if (seen.has(label)) {
					return false
				}
				seen.add(label)
				return true
			})
	})

	const snapshot = () => props.effective?.snapshot

	const formatWind = () => {
		const windSpeed = snapshot()?.windSpeed
		if (windSpeed === undefined || windSpeed === null) {
			return undefined
		}
		const convertedSpeed = Math.round(speedUnit().conversionFunction(windSpeed))
		const direction = snapshot()?.windDirection
		const gust = snapshot()?.windGust
		const gustText = gust ? ` G${Math.round(speedUnit().conversionFunction(gust))}` : ''
		const baseDirection = direction ? `${direction.toString().padStart(3, '0')}°` : 'VRB'
		return `${baseDirection} @ ${convertedSpeed} ${speedUnit().symbol}${gustText}`
	}

	const formatVisibility = () => {
		const visibility = snapshot()?.visibilityHorizontal
		if (visibility === undefined || visibility === null) {
			return undefined
		}
		const converted = lengthUnit().conversionFunction(visibility)
		const isMoreThan = snapshot()?.visibilityHorizontalIsMoreThan ?? false
		if (isMoreThan) {
			const rounded = Math.round(converted)
			return `≥ ${rounded} ${lengthUnit().symbol}`
		}
		const formatted = converted >= 10 ? Math.round(converted) : converted.toFixed(1)
		return `${formatted} ${lengthUnit().symbol}`
	}

	const formatSky = () => {
		const layers = snapshot()?.skyConditions
		if (!layers || layers.length === 0) {
			return undefined
		}
		return layers
			.map(layer => formatSkyLayer(layer, heightUnit().conversionFunction, ` ${heightUnit().symbol}`))
			.join(', ')
	}

	const formatAltimeter = () => {
		const altimeter = snapshot()?.altimeter
		if (altimeter === undefined || altimeter === null) {
			return undefined
		}
		const converted = pressureUnit().conversionFunction(altimeter)
		const precision = pressureUnit().symbol === 'inHg' ? 2 : 0
		return `${converted.toFixed(precision)} ${pressureUnit().symbol}`
	}

	const weatherTokens = createMemo(() => extractWeatherTokens(snapshot()?.weather ?? ''))

	const precipitationChips = createMemo(() =>
		weatherTokens().map(token => ({
			label: summarizeWeatherCondition(token),
			icon: getWeatherIconForCondition(token),
		}))
	)

	const metrics = createMemo<SummaryMetric[]>(() => {
		if (!props.effective) {
			return []
		}
		const entries: SummaryMetric[] = []
		const windValue = formatWind()
		if (windValue) {
			entries.push({
				key: 'wind',
				label: 'Wind',
				value: windValue,
				badge: sourceBadge('wind'),
				icon: <TbWind class="text-base" />,
			})
		}
		const visibilityValue = formatVisibility()
		if (visibilityValue) {
			entries.push({
				key: 'visibility',
				label: 'Visibility',
				value: visibilityValue,
				badge: sourceBadge('visibility'),
				icon: <TbEye class="text-base" />,
			})
		}
		const skyValue = formatSky()
		if (skyValue) {
			entries.push({
				key: 'clouds',
				label: 'Clouds',
				value: skyValue,
				badge: sourceBadge('clouds'),
				icon: <TbCloud class="text-base" />,
			})
		}
		const altimeterValue = formatAltimeter()
		if (altimeterValue) {
			entries.push({
				key: 'altimeter',
				label: 'Altimeter',
				value: altimeterValue,
				badge: sourceBadge('altimeter'),
				icon: <TbGauge class="text-base" />,
			})
		}
		const chips = precipitationChips()
		if (chips.length > 0) {
			entries.push({
				key: 'precipitation',
				label: 'Precipitation',
				badge: sourceBadge('weather'),
				icon: <TbCloudRain class="text-base" />,
				chips,
			})
		}
		return entries
	})

	const showEmptyState = () => !props.effective || metrics().length === 0

	return (
		<div class="flex flex-col gap-4 text-sm">
			<div class="flex flex-wrap items-baseline justify-between gap-3">
				<p class="text-xl font-semibold text-slate-900 dark:text-white">{timeLabel()}</p>
				<Show when={activeGroups().length > 0 || props.isPinned || props.canFollowLive}>
					<div class="flex flex-wrap items-center gap-2">
						<For each={activeGroups()}>
							{label => (
								<span class="rounded-full border border-slate-200/70 bg-white/70 px-2 py-0.5 text-xs font-semibold text-slate-600 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/50 dark:text-slate-200">
									{label}
								</span>
							)}
						</For>
						<Show when={props.isPinned || props.canFollowLive}>
							<button
								type="button"
								onClick={() => props.onFollowLive()}
								class="cursor-pointer rounded-full border border-transparent bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-700 dark:bg-white dark:text-slate-900">
								Follow live
							</button>
						</Show>
					</div>
				</Show>
			</div>
			<Switch>
				<Match when={!showEmptyState()}>
					<div class="grid gap-2 sm:grid-cols-2">
						<For each={metrics()}>
							{metric => (
								<div class="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 dark:border-slate-700/60 dark:bg-slate-900/50">
									<div class="my-auto rounded-md bg-slate-900/5 p-1.5 text-slate-600 dark:bg-white/10 dark:text-slate-200">
										{metric.icon}
									</div>
									<div class="min-w-0 flex-1 space-y-1">
										<div class="flex items-center justify-between gap-2">
											<span class="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase dark:text-slate-400">
												{metric.label}
											</span>
											<Show when={metric.badge}>
												<span class="rounded-full bg-slate-900/5 px-2 py-0.5 text-[0.5rem] font-semibold tracking-wider text-slate-700 uppercase dark:bg-white/10 dark:text-white">
													{metric.badge}
												</span>
											</Show>
										</div>
										<Show
											when={metric.chips && metric.chips.length > 0}
											fallback={
												<span class="text-sm font-semibold text-slate-900 dark:text-white">
													{metric.value ?? '—'}
												</span>
											}>
											<div class="flex flex-wrap gap-1 text-[0.65rem] font-semibold text-slate-700 dark:text-white">
												<For each={metric.chips!}>
													{chip => (
														<span class="flex items-center gap-1 rounded-full bg-slate-900/5 px-1.5 py-0.5 dark:bg-white/10">
															<Show when={chip.icon}>
																<span class="text-sm leading-none">{chip.icon}</span>
															</Show>
															<span class="whitespace-nowrap">{chip.label}</span>
														</span>
													)}
												</For>
											</div>
										</Show>
									</div>
								</div>
							)}
						</For>
					</div>
				</Match>
				<Match when={showEmptyState()}>
					<div class="rounded-xl border border-dashed border-slate-300/80 bg-white/70 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700/70 dark:bg-slate-900/40 dark:text-slate-400">
						No forecast data is published for this instant. Hover or drag across the timeline to inspect
						another time.
					</div>
				</Match>
			</Switch>
		</div>
	)
}

export default TimelineHoverSummary
