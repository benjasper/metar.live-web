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
import { JSXElement } from 'solid-js'

export interface WeatherDescription {
	token: string
	text: string
	icon?: JSXElement
}

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

export const parseWeatherTokens = (weather?: string | null): string[] => {
	if (!weather) {
		return []
	}

	const tokens = weather.match(/(?:\+|-)?(?:VC|RE)?[A-Z]{2,3}|NSW/g)

	if (tokens && tokens.length > 0) {
		return tokens
	}

	return [weather.trim()].filter(Boolean)
}

export const decodeWeatherToken = (token: string): WeatherDescription => {
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

		// Avoid infinite loops if a token cannot be parsed
		if (working) {
			other.push(working)
			working = ''
		}
	}

	const proximityWords = proximities.map(code => proximityText[code] ?? code)
	const intensityWord = intensity ? intensityText[intensity] ?? intensity : undefined
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
