import { Component, For, Show, createMemo } from 'solid-js'
import type { JSX } from 'solid-js'
import { useUnitStore } from '../../context/UnitStore'
import { ForecastChangeIndicator, ForecastFragment, SkyConditionSkyCover } from '../../queries/generated/graphql'
import { indicatorClassesForForecast } from './indicatorPalette'
import { EffectiveConditions, ForecastSnapshot, describeIndicator } from './timelineUtils'
import {
	extractWeatherTokens,
	getWeatherIconForCondition,
	summarizeWeatherCondition,
} from '../weather-elements/PrecipitationElement'
import { SkyConditionIcon } from '../weather-elements/SkyConditionsElement'
import { TbOutlineCloud, TbOutlineCloudRain, TbOutlineEye, TbOutlineWind } from 'solid-icons/tb'
import { formatWindDirection } from '../../models/weather'

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
	icon: JSX.Element
	content: JSX.Element
	isEmpty?: boolean
}

interface MetricChip {
	id: string
	label: string
	className: string
	content: JSX.Element
	title: string
}

interface MetricChipContent {
	content: JSX.Element
	title: string
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

	const chipBadge = (forecast: ForecastFragment): MetricSourceBadge => {
		const palette = indicatorClassesForForecast(forecast)
		const probability =
			forecast.changeProbability !== null && forecast.changeProbability !== undefined
				? `${forecast.changeProbability}%`
				: ''
		return {
			label: probability,
			className: `${palette.background} ${palette.text} ${palette.border}`,
		}
	}

	const speedUnit = () => unitStore.speed.units[unitStore.speed.selected]
	const lengthUnit = () => unitStore.length.units[unitStore.length.selected]
	const heightUnit = () => unitStore.height.units[unitStore.height.selected]

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

	const activeSnapshots = () => props.effective?.activeSnapshots ?? []

	const formatWind = (valueSnapshot?: ForecastSnapshot) => {
		const windSpeed = valueSnapshot?.windSpeed
		if (windSpeed === undefined || windSpeed === null) {
			return undefined
		}
		const convertedSpeed = Math.round(speedUnit().conversionFunction(windSpeed))
		const direction = valueSnapshot?.windDirection
		const gust = valueSnapshot?.windGust
		const gustText = gust ? ` G${Math.round(speedUnit().conversionFunction(gust))}` : ''
		const formattedDirection = formatWindDirection(direction)
		const baseDirection = formattedDirection ? `${formattedDirection}°` : 'VRB'
		return `${baseDirection} @ ${convertedSpeed} ${speedUnit().symbol}${gustText}`
	}

	const formatVisibility = (valueSnapshot?: ForecastSnapshot) => {
		const visibility = valueSnapshot?.visibilityHorizontal
		if (visibility === undefined || visibility === null) {
			return undefined
		}
		const converted = lengthUnit().conversionFunction(visibility)
		const isMoreThan = valueSnapshot?.visibilityHorizontalIsMoreThan ?? false
		if (isMoreThan) {
			const rounded = Math.round(converted)
			return `≥ ${rounded} ${lengthUnit().symbol}`
		}
		const formatted = converted >= 10 ? Math.round(converted) : converted.toFixed(1)
		return `${formatted} ${lengthUnit().symbol}`
	}

	const buildSkyLayerDetails = (valueSnapshot?: ForecastSnapshot) => {
		const layers = valueSnapshot?.skyConditions
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
	}

	const buildPrecipitationDetails = (valueSnapshot?: ForecastSnapshot) => {
		const tokens = extractWeatherTokens(valueSnapshot?.weather ?? '')
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
	}

	const buildTextChipContent = (value: string): MetricChipContent => ({
		title: value,
		content: <span class="min-w-0 truncate font-medium normal-case">{value}</span>,
	})

	const buildCloudChipContents = (valueSnapshot?: ForecastSnapshot): MetricChipContent[] => {
		const layers = buildSkyLayerDetails(valueSnapshot)
		return layers.map(layer => ({
			title: layer.label,
			content: (
				<span class="flex min-w-0 items-center gap-1">
					<SkyConditionIcon
						skyCover={layer.layer.skyCover}
						isDayTime={props.isDaytime}
						class="w-4"
						containerClass="text-current"
					/>
					<span class="min-w-0 truncate font-medium normal-case">{layer.label}</span>
				</span>
			),
		}))
	}

	const buildPrecipitationChipContents = (valueSnapshot?: ForecastSnapshot): MetricChipContent[] => {
		const details = buildPrecipitationDetails(valueSnapshot)
		return details.map(detail => {
			const icon = getWeatherIconForCondition(detail.token)
			return {
				title: detail.label,
				content: (
					<span class="flex min-w-0 items-center gap-1">
						{icon ? <span class="text-base leading-none text-current">{icon}</span> : null}
						<span class="min-w-0 truncate font-medium normal-case">{detail.label}</span>
					</span>
				),
			}
		})
	}

	const buildMetricChips = (
		formatter: (valueSnapshot?: ForecastSnapshot) => MetricChipContent | MetricChipContent[] | undefined
	) => {
		const chips: MetricChip[] = []
		activeSnapshots().forEach((entry, index) => {
			const metric = formatter(entry.snapshot)
			if (!metric) {
				return
			}
			const metrics = Array.isArray(metric) ? metric : [metric]
			if (metrics.length === 0) {
				return
			}
			const badge = chipBadge(entry.forecast)
			const indicatorLabel = describeIndicator(entry.forecast)
			metrics.forEach((item, itemIndex) => {
				chips.push({
					id: `${entry.forecast.fromTime}-${entry.forecast.toTime}-${index}-${itemIndex}`,
					label: badge.label,
					className: badge.className,
					content: item.content,
					title: indicatorLabel ? `${indicatorLabel} · ${item.title}` : item.title,
				})
			})
		})
		return chips
	}

	const renderMetricChips = (chips: MetricChip[]) => {
		const placeholderText = props.effective ? '—' : 'No data'
		return (
			<div class="flex min-h-6 flex-wrap items-center gap-2 sm:flex-nowrap sm:overflow-x-auto sm:whitespace-nowrap">
				<Show
					when={chips.length > 0}
					fallback={
						<span class="text-[0.7rem] text-slate-500/70 dark:text-slate-400">{placeholderText}</span>
					}>
					<For each={chips}>
						{chip => (
							<span
								class={`inline-flex h-7 max-w-88 min-w-0 items-center overflow-hidden rounded-full border text-[0.75rem] font-semibold ${chip.className}`}
								title={chip.title}>
								<Show when={chip.label}>
									<span class="flex h-full shrink-0 items-center">
										<span class="flex h-full items-center border-r border-current/30 bg-current/5 px-2.5 text-current dark:border-current/40 dark:bg-current/10">
											<span class="text-[0.6rem] leading-none font-semibold text-current">
												{chip.label}
											</span>
										</span>
									</span>
								</Show>
								<span class="flex h-full min-w-0 items-center gap-1 px-2.5">{chip.content}</span>
							</span>
						)}
					</For>
				</Show>
			</div>
		)
	}

	const metrics = createMemo<SummaryMetric[]>(() => {
		const entries: SummaryMetric[] = []
		const windChips = buildMetricChips(valueSnapshot => {
			const value = formatWind(valueSnapshot)
			return value ? buildTextChipContent(value) : undefined
		})
		entries.push({
			key: 'wind',
			label: 'Wind',
			icon: <TbOutlineWind class="text-base" />,
			content: renderMetricChips(windChips),
			isEmpty: windChips.length === 0,
		})
		const visibilityChips = buildMetricChips(valueSnapshot => {
			const value = formatVisibility(valueSnapshot)
			return value ? buildTextChipContent(value) : undefined
		})
		entries.push({
			key: 'visibility',
			label: 'Visibility',
			icon: <TbOutlineEye class="text-base" />,
			content: renderMetricChips(visibilityChips),
			isEmpty: visibilityChips.length === 0,
		})
		const cloudsChips = buildMetricChips(buildCloudChipContents)
		entries.push({
			key: 'clouds',
			label: 'Clouds',
			icon: <TbOutlineCloud class="text-base" />,
			content: renderMetricChips(cloudsChips),
			isEmpty: cloudsChips.length === 0,
		})
		const precipitationChips = buildMetricChips(buildPrecipitationChipContents)
		entries.push({
			key: 'precipitation',
			label: 'Precipitation',
			icon: <TbOutlineCloudRain class="text-base" />,
			content: renderMetricChips(precipitationChips),
			isEmpty: precipitationChips.length === 0,
		})
		return props.effective ? entries.filter(entry => !entry.isEmpty) : entries
	})

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
						class="cursor-pointer rounded-full border border-transparent bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900"
						classList={{
							'pointer-events-none opacity-0': !canShowFollowLive(),
						}}>
						Follow live
					</button>
				</div>
			</div>
			<div class="grid gap-2 sm:grid-cols-2 2xl:auto-cols-fr 2xl:grid-flow-col 2xl:grid-cols-none">
				<For each={metrics()}>
					{metric => (
						<div
							class="flex items-start gap-3 rounded-xl border border-slate-300/60 bg-slate-50/80 px-3 py-2 dark:border-slate-700/60 dark:bg-slate-900/50"
							classList={{ 'opacity-60': metric.isEmpty }}>
							<div class="my-auto rounded-md bg-slate-900/5 p-1.5 text-slate-800 dark:bg-white/10 dark:text-slate-200">
								{metric.icon}
							</div>
							<div class="min-w-0 flex-1 space-y-1">
								<div class="flex items-center justify-between gap-2">
									<span class="text-xs font-semibold tracking-[0.2em] text-slate-700 uppercase dark:text-slate-400">
										{metric.label}
									</span>
								</div>
								{metric.content}
							</div>
						</div>
					)}
				</For>
			</div>
		</div>
	)
}

export default TimelineHoverSummary
