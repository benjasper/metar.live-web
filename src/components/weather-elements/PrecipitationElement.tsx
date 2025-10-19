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
import { TbGrain } from 'solid-icons/tb'
import { Component, For, Match, Show, Switch } from 'solid-js'
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

const PrecipitationConditionElement: Component<{ condition: string }> = props => {
	const intensityOrProximity = (): IntensityOrProximity | undefined =>
		Object.values(IntensityOrProximity).find(key => props.condition.startsWith(key))

	const descriptor = (): Descriptor | undefined =>
		Object.values(Descriptor).find(key => props.condition.includes(key))

	const precipitationType = (): PrecipitationType | undefined =>
		Object.values(PrecipitationType).find(key => props.condition.includes(key))

	const obscuration = (): Obscuration | undefined =>
		Object.values(Obscuration).find(key => props.condition.includes(key))

	const other = (): Other | undefined => Object.values(Other).find(key => props.condition.includes(key))

	const hasKnownMapping = () =>
		intensityOrProximity() ||
		descriptor() ||
		precipitationType() ||
		obscuration() ||
		other() ||
		props.condition === ''

	return (
		<div class="flex flex-row justify-center gap-1 text-xl">
			<Show
				when={hasKnownMapping()}
				fallback={
					<span class="dark:text-white-dark text-base font-medium text-slate-600">{props.condition}</span>
				}>
				<div class="dark:text-white-dark my-auto text-gray-600">
					<Switch>
						<Match when={precipitationType() === PrecipitationType.Drizzle}>
							<RiWeatherDrizzleLine />
						</Match>
						<Match
							when={
								descriptor() === Descriptor.Showers || precipitationType() === PrecipitationType.Rain
							}>
							<RiWeatherShowersLine />
						</Match>
						<Match when={descriptor() === Descriptor.Thunderstorm}>
							<RiWeatherThunderstormsLine />
						</Match>
						<Match when={precipitationType() === PrecipitationType.Snow}>
							<RiWeatherSnowyLine />
						</Match>
						<Match
							when={
								precipitationType() === PrecipitationType.Hail ||
								precipitationType() === PrecipitationType.SmallHail
							}>
							<RiWeatherHailLine />
						</Match>
						<Match when={obscuration() === Obscuration.Fog}>
							<RiWeatherFoggyLine />
						</Match>
						<Match when={obscuration() === Obscuration.Mist}>
							<RiWeatherMistLine />
						</Match>
						<Match when={obscuration() === Obscuration.Haze}>
							<RiWeatherHazeLine />
						</Match>
						<Match
							when={
								other() === Other.Duststorm ||
								other() === Other.Sandstorm ||
								other() === Other.Squalls ||
								other() === Other.SandOrDustWhirls ||
								other() === Other.DustWhirls
							}>
							<RiWeatherWindyLine />
						</Match>
						<Match when={other() === Other.Tornado || other() === Other.FunnelCloud}>
							<RiWeatherTornadoLine />
						</Match>
					</Switch>
				</div>

				{/* Intensity or Proximity */}
				<Show when={intensityOrProximity()}>
					<span>
						<Switch fallback="">
							<Match when={intensityOrProximity() === IntensityOrProximity.Light}>Light</Match>
							<Match when={intensityOrProximity() === IntensityOrProximity.Heavy}>Heavy</Match>
							<Match when={intensityOrProximity() === IntensityOrProximity.Nearby}>Nearby</Match>
							<Match when={intensityOrProximity() === IntensityOrProximity.Recent}>Recent</Match>
						</Switch>
					</span>
				</Show>

				{/* Descriptor */}
				<Show when={descriptor()}>
					<span>
						<Switch fallback="">
							<Match when={descriptor() === Descriptor.Shallow}>Shallow</Match>
							<Match when={descriptor() === Descriptor.Partial}>Partial</Match>
							<Match when={descriptor() === Descriptor.Patches}>Patches</Match>
							<Match when={descriptor() === Descriptor.Blowing}>Blowing</Match>
							<Match when={descriptor() === Descriptor.LowDrifting}>Low drifting</Match>
							<Match when={descriptor() === Descriptor.Showers}>Showers</Match>
							<Match when={descriptor() === Descriptor.Thunderstorm}>Thunderstorm</Match>
							<Match when={descriptor() === Descriptor.Freezing}>Freezing</Match>
						</Switch>
					</span>
				</Show>

				{/* Precipitation Type */}
				<Show when={precipitationType()}>
					<span>
						<Switch fallback="">
							<Match when={precipitationType() === PrecipitationType.Drizzle}>Drizzle</Match>
							<Match when={precipitationType() === PrecipitationType.Rain}>Rain</Match>
							<Match when={precipitationType() === PrecipitationType.Snow}>Snow</Match>
							<Match when={precipitationType() === PrecipitationType.Hail}>Hail</Match>
							<Match when={precipitationType() === PrecipitationType.SmallHail}>Small hail</Match>
							<Match when={precipitationType() === PrecipitationType.IcePellets}>Ice pellets</Match>
							<Match when={precipitationType() === PrecipitationType.IceCrystals}>Ice crystals</Match>
							<Match when={precipitationType() === PrecipitationType.UnknownPrecipitation}>
								Unknown Precipitation
							</Match>
						</Switch>
					</span>
				</Show>

				{/* Obscuration */}
				<Show when={obscuration()}>
					<span>
						<Switch fallback="">
							<Match when={obscuration() === Obscuration.Mist}>Mist</Match>
							<Match when={obscuration() === Obscuration.Fog}>Fog</Match>
							<Match when={obscuration() === Obscuration.Smoke}>Smoke</Match>
							<Match when={obscuration() === Obscuration.VolcanicAsh}>Volcanic ash</Match>
							<Match when={obscuration() === Obscuration.Dust}>Dust</Match>
							<Match when={obscuration() === Obscuration.Sand}>Sand</Match>
							<Match when={obscuration() === Obscuration.Haze}>Haze</Match>
						</Switch>
					</span>
				</Show>

				{/* Other */}
				<Show when={other()}>
					<span>
						<Switch fallback="">
							<Match when={other() === Other.DustWhirls}>Dust Whirls</Match>
							<Match when={other() === Other.Duststorm}>Duststorm</Match>
							<Match when={other() === Other.Sandstorm}>Sandstorm</Match>
							<Match when={other() === Other.Squalls}>Squalls</Match>
							<Match when={other() === Other.SandOrDustWhirls}>Sand or dust whirls</Match>
							<Match when={other() === Other.Tornado}>Tornado</Match>
							<Match when={other() === Other.FunnelCloud}>Funnel cloud</Match>
							<Match when={other() === Other.NoSignificantWeather}>No significant weather</Match>
						</Switch>
					</span>
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
	const conditions = (weather: string) => {
		if (!weather) {
			return []
		}

		const tokens = weather.match(/(?:\+|-)?(?:VC|RE)?(?:NSW|[A-Z]{2,})/g)

		if (tokens && tokens.length > 0) {
			return tokens
		}

		return [weather.trim()]
	}

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
			icon={<TbGrain />}
			updatePing={updatePingType()}
			updatePingOldValue={props.previousWeather ? conditions(props.previousWeather).join(', ') : undefined}
			updatePingNewValue={conditions(props.weather).join(', ')}>
			<div class="dark:text-white-dark flex flex-col items-center gap-1 text-center">
				<For each={conditions(props.weather)}>
					{condition => <PrecipitationConditionElement condition={condition} />}
				</For>
			</div>
		</WeatherElementLayout>
	)
}

export { PrecipitationElement }
