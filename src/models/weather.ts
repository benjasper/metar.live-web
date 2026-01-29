interface VariableWind {
	from: number
	to: number
}

const VARIABLE_WIND_REGEX = /\d{3}V\d{3}/

const formatWindDirection = (value?: number | null): string | undefined => {
	if (value === undefined || value === null) {
		return undefined
	}
	const normalized = ((value % 360) + 360) % 360
	return normalized === 0 ? '000' : normalized.toString().padStart(3, '0')
}

const parseVariableWindFromMetar = (metar?: string): VariableWind | undefined => {
	const result = metar?.match(VARIABLE_WIND_REGEX)
	const vWindString = result ? result[0] : undefined

	if (vWindString === undefined) {
		return undefined
	}

	const fromTo = vWindString.split('V').map(v => parseInt(v))

	return {
		from: fromTo[0],
		to: fromTo[1],
	}
}

export { formatWindDirection, parseVariableWindFromMetar }
export type { VariableWind }
