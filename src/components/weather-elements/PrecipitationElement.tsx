import {
	RiWeatherDrizzleLine,
	RiWeatherFoggyLine,
	RiWeatherHailLine,
	RiWeatherHazeLine,
	RiWeatherMistLine,
	RiWeatherShowersLine,
	RiWeatherSnowyLine,
	RiWeatherSunFill,
	RiWeatherThunderstormsLine,
	RiWeatherTornadoLine,
	RiWeatherWindyLine,
} from 'solid-icons/ri'
import { WiDust, WiSandstorm, WiSleet, WiSmoke, WiSnowflakeCold, WiVolcano } from 'solid-icons/wi'
import { TbOutlineCloudQuestion, TbOutlineGrain } from 'solid-icons/tb'
import { Component, For, JSXElement, Show, createMemo } from 'solid-js'
import WeatherElementLayout, { UpdatePing } from '../../layouts/WeatherElementLayout'

enum IntensityOrProximity {
	Light = '-',
	Heavy = '+',
	Nearby = 'VC',
	Recent = 'RE',
}

enum Descriptor {
	Shallow = 'MI',
	Partial = 'PR',
	Patches = 'BC',
	Blowing = 'BL',
	LowDrifting = 'DR',
	Showers = 'SH',
	Thunderstorm = 'TS',
	Freezing = 'FZ',
}

enum PrecipitationType {
	Drizzle = 'DZ',
	Rain = 'RA',
	Snow = 'SN',
	SnowGrains = 'SG',
	Hail = 'GR',
	SmallHail = 'GS',
	IcePellets = 'PL',
	IceCrystals = 'IC',
	UnknownPrecipitation = 'UP',
}

enum Obscuration {
	Mist = 'BR',
	Fog = 'FG',
	Smoke = 'FU',
	VolcanicAsh = 'VA',
	Dust = 'DU',
	Sand = 'SA',
	Haze = 'HZ',
}

enum Other {
	DustWhirls = 'PO',
	Duststorm = 'DS',
	Sandstorm = 'SS',
	Squalls = 'SQ',
	SandOrDustWhirls = 'FC',
	Tornado = '+FC',
	FunnelCloud = 'FC',
	NoSignificantWeather = 'NSW',
}

type ParsedCondition = {
	intensity?: IntensityOrProximity
	descriptor?: Descriptor
	precipitation?: PrecipitationType
	obscuration?: Obscuration
	other?: Other
}

const detectIntensityOrProximity = (condition: string): IntensityOrProximity | undefined =>
	Object.values(IntensityOrProximity).find(key => condition.startsWith(key))

const detectDescriptor = (condition: string): Descriptor | undefined =>
	Object.values(Descriptor).find(key => condition.includes(key))

const detectPrecipitationType = (condition: string): PrecipitationType | undefined =>
	Object.values(PrecipitationType).find(key => condition.includes(key))

const detectObscuration = (condition: string): Obscuration | undefined =>
	Object.values(Obscuration).find(key => condition.includes(key))

const detectOther = (condition: string): Other | undefined => Object.values(Other).find(key => condition.includes(key))

const parseCondition = (condition: string): ParsedCondition => ({
	intensity: detectIntensityOrProximity(condition),
	descriptor: detectDescriptor(condition),
	precipitation: detectPrecipitationType(condition),
	obscuration: detectObscuration(condition),
	other: detectOther(condition),
})

const hasStructuredData = (parsed: ParsedCondition, condition: string) =>
	parsed.intensity ||
	parsed.descriptor ||
	parsed.precipitation ||
	parsed.obscuration ||
	parsed.other ||
	condition === ''

const intensityLabels: Record<IntensityOrProximity, string> = {
	[IntensityOrProximity.Light]: 'Light',
	[IntensityOrProximity.Heavy]: 'Heavy',
	[IntensityOrProximity.Nearby]: 'Nearby',
	[IntensityOrProximity.Recent]: 'Recent',
}

const descriptorLabels: Record<Descriptor, string> = {
	[Descriptor.Shallow]: 'Shallow',
	[Descriptor.Partial]: 'Partial',
	[Descriptor.Patches]: 'Patches',
	[Descriptor.Blowing]: 'Blowing',
	[Descriptor.LowDrifting]: 'Low drifting',
	[Descriptor.Showers]: 'Showers',
	[Descriptor.Thunderstorm]: 'Thunderstorm',
	[Descriptor.Freezing]: 'Freezing',
}

const precipitationLabels: Record<PrecipitationType, string> = {
	[PrecipitationType.Drizzle]: 'Drizzle',
	[PrecipitationType.Rain]: 'Rain',
	[PrecipitationType.Snow]: 'Snow',
	[PrecipitationType.SnowGrains]: 'Snow grains',
	[PrecipitationType.Hail]: 'Hail',
	[PrecipitationType.SmallHail]: 'Small hail',
	[PrecipitationType.IcePellets]: 'Ice pellets',
	[PrecipitationType.IceCrystals]: 'Ice crystals',
	[PrecipitationType.UnknownPrecipitation]: 'Unknown precipitation',
}

const obscurationLabels: Record<Obscuration, string> = {
	[Obscuration.Mist]: 'Mist',
	[Obscuration.Fog]: 'Fog',
	[Obscuration.Smoke]: 'Smoke',
	[Obscuration.VolcanicAsh]: 'Volcanic ash',
	[Obscuration.Dust]: 'Dust',
	[Obscuration.Sand]: 'Sand',
	[Obscuration.Haze]: 'Haze',
}

const otherLabels: Record<Other, string> = {
	[Other.DustWhirls]: 'Dust whirls',
	[Other.Duststorm]: 'Duststorm',
	[Other.Sandstorm]: 'Sandstorm',
	[Other.Squalls]: 'Squalls',
	[Other.SandOrDustWhirls]: 'Sand or dust whirls',
	[Other.Tornado]: 'Tornado',
	[Other.FunnelCloud]: 'Funnel cloud',
	[Other.NoSignificantWeather]: 'No significant weather',
}

const labelForIntensity = (value?: IntensityOrProximity) => (value ? intensityLabels[value] : undefined)
const labelForDescriptor = (value?: Descriptor) => (value ? descriptorLabels[value] : undefined)
const labelForPrecipitation = (value?: PrecipitationType) => (value ? precipitationLabels[value] : undefined)
const labelForObscuration = (value?: Obscuration) => (value ? obscurationLabels[value] : undefined)
const labelForOther = (value?: Other) => (value ? otherLabels[value] : undefined)

export const getWeatherIconForCondition = (condition: string): JSXElement | null => {
	const parsed = parseCondition(condition)

	if (parsed.precipitation === PrecipitationType.Drizzle) {
		return <RiWeatherDrizzleLine />
	}

	if (parsed.descriptor === Descriptor.Showers || parsed.precipitation === PrecipitationType.Rain) {
		return <RiWeatherShowersLine />
	}

	if (parsed.descriptor === Descriptor.Thunderstorm) {
		return <RiWeatherThunderstormsLine />
	}

	if (parsed.precipitation === PrecipitationType.Snow || parsed.precipitation === PrecipitationType.SnowGrains) {
		return <RiWeatherSnowyLine />
	}

	if (parsed.precipitation === PrecipitationType.IcePellets) {
		return <WiSleet />
	}

	if (parsed.precipitation === PrecipitationType.IceCrystals) {
		return <WiSnowflakeCold />
	}

	if (parsed.precipitation === PrecipitationType.Hail || parsed.precipitation === PrecipitationType.SmallHail) {
		return <RiWeatherHailLine />
	}

	if (parsed.obscuration === Obscuration.Fog) {
		return <RiWeatherFoggyLine />
	}

	if (parsed.obscuration === Obscuration.Mist) {
		return <RiWeatherMistLine />
	}

	if (parsed.obscuration === Obscuration.Smoke) {
		return <WiSmoke />
	}

	if (parsed.obscuration === Obscuration.VolcanicAsh) {
		return <WiVolcano />
	}

	if (parsed.obscuration === Obscuration.Dust) {
		return <WiDust />
	}

	if (parsed.obscuration === Obscuration.Sand) {
		return <WiSandstorm />
	}

	if (parsed.obscuration === Obscuration.Haze) {
		return <RiWeatherHazeLine />
	}

	if (
		parsed.other === Other.Duststorm ||
		parsed.other === Other.Sandstorm ||
		parsed.other === Other.Squalls ||
		parsed.other === Other.SandOrDustWhirls ||
		parsed.other === Other.DustWhirls
	) {
		return <RiWeatherWindyLine />
	}

	if (parsed.other === Other.Tornado || parsed.other === Other.FunnelCloud) {
		return <RiWeatherTornadoLine />
	}

	if (parsed.other === Other.NoSignificantWeather) {
		return <RiWeatherSunFill />
	}

	return <TbOutlineCloudQuestion />
}

export const summarizeWeatherCondition = (condition: string): string => {
	const parsed = parseCondition(condition)

	if (parsed.other === Other.NoSignificantWeather) {
		return otherLabels[Other.NoSignificantWeather]
	}

	const tokens: string[] = []
	const intensity = labelForIntensity(parsed.intensity)
	const descriptor = labelForDescriptor(parsed.descriptor)
	const precipitation = labelForPrecipitation(parsed.precipitation)
	const obscuration = labelForObscuration(parsed.obscuration)
	const other = labelForOther(parsed.other)

	if (intensity) {
		tokens.push(intensity)
	}

	if (descriptor) {
		tokens.push(descriptor)
	}

	if (precipitation) {
		tokens.push(precipitation)
	} else if (obscuration) {
		tokens.push(obscuration)
	}

	if (other && parsed.other !== Other.NoSignificantWeather) {
		tokens.push(other)
	}

	const summary = tokens.join(' ')
	return summary || condition.trim() || '—'
}

const WEATHER_TOKEN_REGEX = /(?:\+|-)?(?:VC|RE)?(?:NSW|[A-Z]{2,})/g

export const extractWeatherTokens = (weather: string): string[] => {
	if (!weather) {
		return []
	}

	const tokens = weather.match(WEATHER_TOKEN_REGEX)
	if (tokens && tokens.length > 0) {
		return tokens
	}

	return weather.trim() ? [weather.trim()] : []
}

const PrecipitationConditionElement: Component<{ condition: string }> = props => {
	const parsed = createMemo(() => parseCondition(props.condition))
	const icon = createMemo(() => getWeatherIconForCondition(props.condition))
	const hasMapping = () => hasStructuredData(parsed(), props.condition)

	const intensity = () => labelForIntensity(parsed().intensity)
	const descriptor = () => labelForDescriptor(parsed().descriptor)
	const precipitation = () => labelForPrecipitation(parsed().precipitation)
	const obscuration = () => labelForObscuration(parsed().obscuration)
	const other = () => labelForOther(parsed().other)

	return (
		<div class="flex flex-row justify-center gap-1 text-xl">
			<Show
				when={hasMapping()}
				fallback={
					<span class="dark:text-white-dark text-base font-medium text-slate-600">{props.condition}</span>
				}>
				<Show when={icon()}>
					<div class="dark:text-white-dark my-auto text-gray-600">{icon()}</div>
				</Show>

				<Show when={intensity()}>
					<span>{intensity()}</span>
				</Show>

				<Show when={descriptor()}>
					<span>{descriptor()}</span>
				</Show>

				<Show when={precipitation()}>
					<span>{precipitation()}</span>
				</Show>

				<Show when={!precipitation() && obscuration()}>
					<span>{obscuration()}</span>
				</Show>

				<Show when={other()}>
					<span>{other()}</span>
				</Show>
			</Show>
		</div>
	)
}

interface PrecipitationElementProps {
	weather: string
	previousWeather?: string
}

const PrecipitationElement: Component<PrecipitationElementProps> = props => {
	const updatePingType = () => {
		if (props.previousWeather === '' && props.weather !== '') {
			return UpdatePing.Worse
		}

		if (props.previousWeather !== '' && props.weather === '') {
			return UpdatePing.Better
		}

		return UpdatePing.Neutral
	}

	return (
		<WeatherElementLayout
			name="Precipitation"
			icon={<TbOutlineGrain />}
			updatePing={updatePingType()}
			updatePingOldValue={
				props.previousWeather ? extractWeatherTokens(props.previousWeather).join(', ') : undefined
			}
			updatePingNewValue={extractWeatherTokens(props.weather).join(', ')}>
			<div class="dark:text-white-dark flex flex-col items-center gap-1 text-center">
				<For each={extractWeatherTokens(props.weather)}>
					{condition => <PrecipitationConditionElement condition={condition} />}
				</For>
			</div>
		</WeatherElementLayout>
	)
}

export { PrecipitationElement }
