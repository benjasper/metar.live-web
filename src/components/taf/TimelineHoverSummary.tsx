import { Component, For, Match, Show, Switch, createMemo } from 'solid-js'
import type { JSX } from 'solid-js'
import { useUnitStore } from '../../context/UnitStore'
import { SkyConditionSkyCover } from '../../queries/generated/graphql'
import { indicatorClassesForForecast } from './indicatorPalette'
import { EffectiveConditions, ForecastSnapshot, SnapshotFieldKey, describeIndicator } from './timelineUtils'
import {
	extractWeatherTokens,
	getWeatherIconForCondition,
	summarizeWeatherCondition,
} from '../weather-elements/PrecipitationElement'
import { SkyConditionIcon } from '../weather-elements/SkyConditionsElement'
import { TbCloud, TbCloudRain, TbEye, TbGauge, TbWind } from 'solid-icons/tb'

interface TimelineHoverSummaryProps {
	focusTime: Date
	timezone: string
	timezoneLabel: string
	effective: EffectiveConditions | null
	isPinned: boolean
	isDaytime: boolean
	canFollowLive: boolean
	onFollowLive: () => void
}

interface MetricSourceBadge {
	label: string
	className: string
}

interface SummaryMetric {
	key: string
	label: string
	badge?: MetricSourceBadge
	icon: JSX.Element
	content: JSX.Element
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

	const sourceBadge = (key: SnapshotFieldKey): MetricSourceBadge | undefined => {
		const source = props.effective?.sources[key]
		if (!source) {
			return undefined
		}
		const palette = indicatorClassesForForecast(source)
		return {
			label: describeIndicator(source),
			className: `${palette.background} ${palette.text} ${palette.border}`,
		}
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

	const skyLayerDetails = createMemo(() => {
		const layers = snapshot()?.skyConditions
		if (!layers || layers.length === 0) {
			return []
		}

		const convert = heightUnit().conversionFunction
		const unitSymbol = ` ${heightUnit().symbol}`

		return [...layers]
			.sort((a, b) => {
				const baseA = a.cloudBase ?? Infinity
				const baseB = b.cloudBase ?? Infinity
				return baseA - baseB
			})
			.map(layer => ({
				layer,
				label: formatSkyLayer(layer, convert, unitSymbol),
			}))
	})

	const precipitationDetails = createMemo(() => {
		const tokens = weatherTokens()
		const seen = new Set<string>()
		const details: Array<{ token: string; label: string }> = []

		for (const token of tokens) {
			const summary = summarizeWeatherCondition(token).trim()
			if (!summary) {
				continue
			}

			const key = summary.toLowerCase()
			if (seen.has(key)) {
				continue
			}

			seen.add(key)
			details.push({ token, label: summary })
		}

		return details
	})

	const renderMetricText = (value: string) => (
		<span class="text-sm font-semibold text-slate-900 dark:text-white">{value}</span>
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
				badge: sourceBadge('wind'),
				icon: <TbWind class="text-base" />,
				content: renderMetricText(windValue),
			})
		}
		const visibilityValue = formatVisibility()
		if (visibilityValue) {
			entries.push({
				key: 'visibility',
				label: 'Visibility',
				badge: sourceBadge('visibility'),
				icon: <TbEye class="text-base" />,
				content: renderMetricText(visibilityValue),
			})
		}
		const clouds = skyLayerDetails()
		if (clouds.length > 0) {
			entries.push({
				key: 'clouds',
				label: 'Clouds',
				badge: sourceBadge('clouds'),
				icon: <TbCloud class="text-base" />,
				content: (
					<div class="flex flex-wrap gap-x-3 gap-y-1 text-sm font-semibold text-slate-900 dark:text-white">
						<For each={clouds}>
							{detail => (
								<span class="flex items-center gap-1">
									<SkyConditionIcon
										skyCover={detail.layer.skyCover}
										isDayTime={props.isDaytime}
										class="w-4"
									/>
									<span class="leading-tight whitespace-nowrap">{detail.label}</span>
								</span>
							)}
						</For>
					</div>
				),
			})
		}
		const altimeterValue = formatAltimeter()
		if (altimeterValue) {
			entries.push({
				key: 'altimeter',
				label: 'Altimeter',
				badge: sourceBadge('altimeter'),
				icon: <TbGauge class="text-base" />,
				content: renderMetricText(altimeterValue),
			})
		}
		const precipitation = precipitationDetails()
		if (precipitation.length > 0) {
			entries.push({
				key: 'precipitation',
				label: 'Precipitation',
				badge: sourceBadge('weather'),
				icon: <TbCloudRain class="text-base" />,
				content: (
					<div class="flex flex-wrap gap-x-3 gap-y-1 text-sm font-semibold text-slate-900 dark:text-white">
						<For each={precipitation}>
							{detail => {
								const icon = getWeatherIconForCondition(detail.token)
								return (
									<span class="flex items-center gap-1">
										<Show when={icon}>
											<span class="text-base leading-none text-slate-600 dark:text-slate-200">
												{icon}
											</span>
										</Show>
										<span class="leading-tight whitespace-nowrap">{detail.label}</span>
									</span>
								)
							}}
						</For>
					</div>
				),
			})
		}
		return entries
	})

	const showEmptyState = () => !props.effective || metrics().length === 0
	const canShowFollowLive = () => props.isPinned || props.canFollowLive

	const handleFollowLiveClick = () => {
		if (!canShowFollowLive()) {
			return
		}
		props.onFollowLive()
	}

	return (
		<div class="flex flex-col gap-4 text-sm">
			<div class="flex flex-wrap items-baseline justify-between gap-3">
				<p class="text-xl font-semibold text-slate-900 dark:text-white">{timeLabel()}</p>
				<div class="flex flex-wrap items-center gap-2">
					<button
						type="button"
						tabIndex={canShowFollowLive() ? 0 : -1}
						aria-hidden={!canShowFollowLive() ? 'true' : undefined}
						disabled={!canShowFollowLive()}
						onClick={handleFollowLiveClick}
						class="cursor-pointer rounded-full border border-transparent bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-700 dark:bg-white dark:text-slate-900"
						classList={{
							'pointer-events-none opacity-0': !canShowFollowLive(),
						}}>
						Follow live
					</button>
				</div>
			</div>
			<Switch>
				<Match when={!showEmptyState()}>
					<div class="grid gap-2 sm:grid-cols-2 xl:auto-cols-fr xl:grid-cols-none xl:grid-flow-col">
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
											<Show when={metric.badge} keyed>
												{badge => (
													<span
														class={`rounded-full border px-2 py-0.5 text-[0.5rem] font-semibold tracking-wider uppercase shadow-sm ${badge.className}`}>
														{badge.label}
													</span>
												)}
											</Show>
										</div>
										{metric.content}
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
