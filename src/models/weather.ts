interface VariableWind {
	from: number
	to: number
}

const VARIABLE_WIND_REGEX = /\d{3}V\d{3}/

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

export { parseVariableWindFromMetar }
export type { VariableWind }
