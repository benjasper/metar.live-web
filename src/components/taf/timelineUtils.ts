import { ForecastChangeIndicator, ForecastFragment } from '../../queries/generated/graphql'

export type TimelineLayerKey = 'BASE' | ForecastChangeIndicator

export interface TimelineSegment {
	id: string
	from: Date
	to: Date
	indicator: ForecastChangeIndicator | null
	forecast: ForecastFragment
}

export interface TimelineRowDefinition {
	key: TimelineLayerKey
	title: string
	segments: TimelineSegment[]
}

export type SnapshotFieldKey = 'wind' | 'visibility' | 'weather' | 'clouds' | 'altimeter'

export type SnapshotFieldSources = Partial<Record<SnapshotFieldKey, ForecastFragment>>

export interface ForecastSnapshot {
	fromTime: Date
	toTime: Date
	changeIndicator?: ForecastChangeIndicator | null
	changeProbability?: number | null
	windDirection?: number | null
	windShearDirection?: number | null
	weather?: string | null
	altimeter?: number | null
	windSpeed?: number | null
	windGust?: number | null
	visibilityHorizontal?: number | null
	visibilityHorizontalIsMoreThan: boolean
	visibilityVertical?: number | null
	windShearHeight?: number | null
	windShearSpeed?: number | null
	windDirectionVariable: boolean
	skyConditions?: ForecastFragment['skyConditions']
}

export interface EffectiveConditions {
	snapshot: ForecastSnapshot
	contributors: ForecastFragment[]
	sources: SnapshotFieldSources
}

const toDate = (value: ForecastFragment['fromTime']) => new Date(value)

const indicatorWeight = (forecast: ForecastFragment): number => {
	if (!forecast.changeIndicator || forecast.changeIndicator === ForecastChangeIndicator.Fm) {
		return 0
	}

	switch (forecast.changeIndicator) {
		case ForecastChangeIndicator.Becmg:
			return 1
		case ForecastChangeIndicator.Tempo:
			return 2
		case ForecastChangeIndicator.Prob:
			return 3
		default:
			return 4
	}
}

export const sortForecasts = (forecasts: ForecastFragment[] = []): ForecastFragment[] =>
	[...forecasts].sort((a, b) => {
		const delta = toDate(a.fromTime).getTime() - toDate(b.fromTime).getTime()
		if (delta !== 0) {
			return delta
		}
		return indicatorWeight(a) - indicatorWeight(b)
	})

export const buildTimelineRows = (
	forecasts: ForecastFragment[] = [],
	validFrom?: Date,
	validTo?: Date
): TimelineRowDefinition[] => {
	const rows: Record<TimelineLayerKey, TimelineRowDefinition> = {
		BASE: { key: 'BASE', title: 'Base TAF', segments: [] },
		[ForecastChangeIndicator.Becmg]: {
			key: ForecastChangeIndicator.Becmg,
			title: 'Becoming',
			segments: [],
		},
		[ForecastChangeIndicator.Tempo]: {
			key: ForecastChangeIndicator.Tempo,
			title: 'Temporary',
			segments: [],
		},
		[ForecastChangeIndicator.Prob]: {
			key: ForecastChangeIndicator.Prob,
			title: 'Probability',
			segments: [],
		},
		[ForecastChangeIndicator.Fm]: {
			key: ForecastChangeIndicator.Fm,
			title: 'From',
			segments: [],
		},
	}

	forecasts.forEach((forecast, index) => {
		const segment: TimelineSegment = {
			id: `${forecast.fromTime}-${forecast.toTime}-${index}`,
			from: toDate(forecast.fromTime),
			to: toDate(forecast.toTime),
			indicator: forecast.changeIndicator ?? null,
			forecast,
		}

		if (!forecast.changeIndicator || forecast.changeIndicator === ForecastChangeIndicator.Fm) {
			rows.BASE.segments.push(segment)
			return
		}

		rows[forecast.changeIndicator].segments.push(segment)
	})

	const becmgSegments = rows[ForecastChangeIndicator.Becmg].segments
	if (rows.BASE.segments.length > 0 && becmgSegments.length > 0) {
		const becmgStarts = becmgSegments.map(segment => segment.from.getTime()).sort((a, b) => a - b)
		const trimmedBaseSegments: TimelineSegment[] = []
		rows.BASE.segments.forEach(segment => {
			const segmentStart = segment.from.getTime()
			const segmentEnd = segment.to.getTime()
			const cutoff = becmgStarts.find(start => start >= segmentStart && start < segmentEnd)
			if (cutoff === undefined) {
				trimmedBaseSegments.push(segment)
				return
			}
			if (cutoff <= segmentStart) {
				return
			}
			const trimmed: TimelineSegment = {
				...segment,
				to: new Date(cutoff),
			}
			if (trimmed.to.getTime() > trimmed.from.getTime()) {
				trimmedBaseSegments.push(trimmed)
			}
		})
		rows.BASE.segments = trimmedBaseSegments
	}

	const orderedRows = [
		rows[ForecastChangeIndicator.Prob],
		rows[ForecastChangeIndicator.Tempo],
		rows[ForecastChangeIndicator.Becmg],
		rows.BASE,
	]

	if (rows.BASE.segments.length > 0) {
		rows.BASE.segments.sort((a, b) => a.from.getTime() - b.from.getTime())
	}

	if (validFrom && rows.BASE.segments.length > 0) {
		const first = rows.BASE.segments[0]
		if (first.from.getTime() > validFrom.getTime()) {
			rows.BASE.segments[0] = {
				...first,
				from: new Date(validFrom),
			}
		}
	}

	if (validTo && rows.BASE.segments.length > 0) {
		const earliestBecmgStart =
			becmgSegments.length > 0 ? Math.min(...becmgSegments.map(segment => segment.from.getTime())) : undefined
		const hasBaseAfterBecmg =
			earliestBecmgStart === undefined
				? true
				: rows.BASE.segments.some(segment => segment.from.getTime() >= earliestBecmgStart)
		if (earliestBecmgStart === undefined || hasBaseAfterBecmg) {
			const lastIndex = rows.BASE.segments.length - 1
			const last = rows.BASE.segments[lastIndex]
			if (last.to.getTime() < validTo.getTime()) {
				rows.BASE.segments[lastIndex] = {
					...last,
					to: new Date(validTo),
				}
			}
		}
	}

	return orderedRows.filter(row => row.segments.length > 0)
}

const cloneForecast = (forecast: ForecastFragment): ForecastSnapshot => ({
	fromTime: toDate(forecast.fromTime),
	toTime: toDate(forecast.toTime),
	changeIndicator: forecast.changeIndicator,
	changeProbability: forecast.changeProbability,
	windDirection: forecast.windDirection ?? undefined,
	windShearDirection: forecast.windShearDirection ?? undefined,
	weather: forecast.weather ?? undefined,
	altimeter: forecast.altimeter ?? undefined,
	windSpeed: forecast.windSpeed ?? undefined,
	windGust: forecast.windGust ?? undefined,
	visibilityHorizontal: forecast.visibilityHorizontal ?? undefined,
	visibilityHorizontalIsMoreThan: forecast.visibilityHorizontalIsMoreThan,
	visibilityVertical: forecast.visibilityVertical ?? undefined,
	windShearHeight: forecast.windShearHeight ?? undefined,
	windShearSpeed: forecast.windShearSpeed ?? undefined,
	windDirectionVariable: forecast.windDirectionVariable,
	skyConditions: forecast.skyConditions?.map(condition => ({ ...condition })),
})

const seedSourcesFromForecast = (forecast: ForecastFragment, sources: SnapshotFieldSources) => {
	const hasWind =
		forecast.windDirection !== null ||
		forecast.windSpeed !== null ||
		forecast.windGust !== null ||
		forecast.windDirectionVariable !== undefined
	if (hasWind) {
		sources.wind = forecast
	}

	const hasVisibility =
		forecast.visibilityHorizontal !== null ||
		forecast.visibilityVertical !== null ||
		forecast.visibilityHorizontalIsMoreThan
	if (hasVisibility) {
		sources.visibility = forecast
	}

	if (forecast.weather && forecast.weather.length > 0) {
		sources.weather = forecast
	}

	if (forecast.skyConditions && forecast.skyConditions.length > 0) {
		sources.clouds = forecast
	}

	if (forecast.altimeter !== null && forecast.altimeter !== undefined) {
		sources.altimeter = forecast
	}
}

const mergeSnapshot = (target: ForecastSnapshot, source: ForecastFragment, sources: SnapshotFieldSources) => {
	const numericKeys: Array<
		keyof Pick<
			ForecastSnapshot,
			| 'windDirection'
			| 'windShearDirection'
			| 'altimeter'
			| 'windSpeed'
			| 'windGust'
			| 'visibilityHorizontal'
			| 'visibilityVertical'
			| 'windShearHeight'
			| 'windShearSpeed'
		>
	> = [
		'windDirection',
		'windShearDirection',
		'altimeter',
		'windSpeed',
		'windGust',
		'visibilityHorizontal',
		'visibilityVertical',
		'windShearHeight',
		'windShearSpeed',
	]

	numericKeys.forEach(key => {
		const value = source[key as keyof ForecastFragment] as ForecastSnapshot[typeof key]
		if (value !== null && value !== undefined) {
			target[key] = value
			if (key === 'visibilityHorizontal') {
				target.visibilityHorizontalIsMoreThan = source.visibilityHorizontalIsMoreThan
			}
			if (key === 'altimeter') {
				sources.altimeter = source
			}
			if (key === 'visibilityHorizontal' || key === 'visibilityVertical') {
				sources.visibility = source
			}
			if (
				key === 'windDirection' ||
				key === 'windSpeed' ||
				key === 'windGust' ||
				key === 'windShearDirection' ||
				key === 'windShearSpeed' ||
				key === 'windShearHeight'
			) {
				sources.wind = source
			}
		}
	})

	if (source.windDirectionVariable !== undefined) {
		target.windDirectionVariable = source.windDirectionVariable
		sources.wind = source
	}

	if (source.skyConditions && source.skyConditions.length > 0) {
		target.skyConditions = source.skyConditions.map(condition => ({ ...condition }))
		sources.clouds = source
	}

	if (source.weather && source.weather.length > 0) {
		target.weather = source.weather
		sources.weather = source
	}
}

const isWithin = (instant: Date, forecast: ForecastFragment) => {
	const start = toDate(forecast.fromTime).getTime()
	const end = toDate(forecast.toTime).getTime()
	const time = instant.getTime()
	return time >= start && time <= end
}

export const resolveEffectiveForecast = (
	forecasts: ForecastFragment[] = [],
	instant: Date
): EffectiveConditions | null => {
	if (!forecasts.length) {
		return null
	}

	const active = forecasts.filter(forecast => isWithin(instant, forecast))
	if (active.length === 0) {
		return null
	}

	active.sort((a, b) => indicatorWeight(a) - indicatorWeight(b))

	const baseIndex = active.findIndex(
		forecast => !forecast.changeIndicator || forecast.changeIndicator === ForecastChangeIndicator.Fm
	)
	const baseForecast = baseIndex >= 0 ? active[baseIndex] : active[0]
	const snapshot = cloneForecast(baseForecast)
	const sources: SnapshotFieldSources = {}
	seedSourcesFromForecast(baseForecast, sources)
	const contributors: ForecastFragment[] = [baseForecast]

	active.forEach(forecast => {
		if (forecast === baseForecast) {
			return
		}
		contributors.push(forecast)
		mergeSnapshot(snapshot, forecast, sources)
	})

	return {
		snapshot,
		contributors,
		sources,
	}
}

export const describeIndicator = (forecast: ForecastFragment): string => {
	if (!forecast.changeIndicator || forecast.changeIndicator === ForecastChangeIndicator.Fm) {
		return forecast.changeIndicator === ForecastChangeIndicator.Fm ? 'FM' : 'BASE'
	}

	const probability = forecast.changeProbability
	const formattedProbability = probability !== null && probability !== undefined ? `${probability}%` : undefined

	if (forecast.changeIndicator === ForecastChangeIndicator.Prob) {
		return formattedProbability ? `PROB ${formattedProbability}` : 'PROB'
	}

	if (formattedProbability) {
		return `${forecast.changeIndicator} (${formattedProbability})`
	}

	return forecast.changeIndicator
}

export const clampDate = (value: Date, min: Date, max: Date): Date =>
	new Date(Math.min(Math.max(value.getTime(), min.getTime()), max.getTime()))

export const isInstantWithinForecast = (instant: Date, segment: TimelineSegment) => {
	const target = instant.getTime()
	return target >= segment.from.getTime() && target <= segment.to.getTime()
}
