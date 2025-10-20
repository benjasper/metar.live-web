import { ForecastFragment } from '../../queries/generated/graphql'
import { PressureUnit, Unit } from '../../models/units'

export interface ForecastUnitSelection {
	speed: Unit
	length: Unit
	height: Unit
	pressure: Unit
}

export const formatWind = (forecast: ForecastFragment | undefined, units: ForecastUnitSelection): string | undefined => {
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

	const speed = Math.round(units.speed.conversionFunction(forecast.windSpeed))
	parts.push(`at ${speed} ${units.speed.symbol}`)

	if (forecast.windGust) {
		const gust = Math.round(units.speed.conversionFunction(forecast.windGust))
		parts.push(`gusting ${gust} ${units.speed.symbol}`)
	}

	return parts.join(' ')
}

export const formatWindCompact = (
	forecast: ForecastFragment | undefined,
	units: ForecastUnitSelection
): string | undefined => {
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

	const speed = Math.round(units.speed.conversionFunction(forecast.windSpeed))
	const gust = forecast.windGust ? Math.round(units.speed.conversionFunction(forecast.windGust)) : undefined

	return `${direction} ${speed}${units.speed.symbol}${gust ? ` G${gust}` : ''}`
}

export const formatVisibility = (
	forecast: ForecastFragment | undefined,
	units: ForecastUnitSelection
): string | undefined => {
	if (!forecast || !forecast.visibilityHorizontal) {
		return undefined
	}

	const converted = units.length.conversionFunction(forecast.visibilityHorizontal)
	const formatted =
		converted >= 10 ? Math.round(converted).toString() : (Math.round(converted * 10) / 10).toFixed(1)

	if (forecast.visibilityHorizontalIsMoreThan) {
		return `≥ ${formatted} ${units.length.symbol}`
	}

	return `${formatted} ${units.length.symbol}`
}

export const formatAltimeter = (
	forecast: ForecastFragment | undefined,
	units: ForecastUnitSelection
): string | undefined => {
	if (!forecast || !forecast.altimeter) {
		return undefined
	}

	const unit = units.pressure
	const converted = unit.conversionFunction(forecast.altimeter)

	const formatted =
		unit.symbol === PressureUnit.InchesOfMercury
			? (Math.round((converted + Number.EPSILON) * 100) / 100).toFixed(2)
			: Math.round(converted).toString()

	return `${formatted} ${unit.symbol}`
}

export const formatSkyConditions = (
	forecast: ForecastFragment | undefined,
	units: ForecastUnitSelection
): string[] => {
	if (!forecast || !forecast.skyConditions || forecast.skyConditions.length === 0) {
		return []
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

	return forecast.skyConditions.map(condition => {
		const cover = skyCoverText[condition.skyCover] ?? condition.skyCover
		const base =
			condition.cloudBase !== null && condition.cloudBase !== undefined
				? Math.round(units.height.conversionFunction(condition.cloudBase))
				: undefined
		const baseText = base !== undefined ? `${base.toLocaleString()} ${units.height.symbol}` : undefined
		const typeText = condition.cloudType ? ` (${condition.cloudType})` : ''

		return baseText ? `${cover} @ ${baseText}${typeText}` : `${cover}${typeText}`
	})
}

export const formatWindShear = (
	forecast: ForecastFragment | undefined,
	units: ForecastUnitSelection
): string | undefined => {
	if (!forecast || !forecast.windShearSpeed) {
		return undefined
	}

	const direction = forecast.windShearDirection ? `${forecast.windShearDirection}°` : 'Variable'
	const speed = Math.round(units.speed.conversionFunction(forecast.windShearSpeed))
	const height =
		forecast.windShearHeight !== null && forecast.windShearHeight !== undefined
			? Math.round(units.height.conversionFunction(forecast.windShearHeight))
			: undefined
	const heightText = height !== undefined ? ` near ${height} ${units.height.symbol}` : ''

	return `${direction} at ${speed} ${units.speed.symbol}${heightText}`
}
