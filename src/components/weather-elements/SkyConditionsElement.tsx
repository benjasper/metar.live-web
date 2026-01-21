import {
	RiWeatherCloudyFill,
	RiWeatherCloudyLine,
	RiWeatherFoggyFill,
	RiWeatherMoonClearFill,
	RiWeatherMoonCloudyFill,
	RiWeatherMoonCloudyLine,
	RiWeatherSunCloudyFill,
	RiWeatherSunCloudyLine,
	RiWeatherSunFill,
} from 'solid-icons/ri'
import { TbOutlineCloud } from 'solid-icons/tb'
import { Accessor, Component, For, Match, Show, Switch, createMemo } from 'solid-js'
import { Unit, useUnitStore } from '../../context/UnitStore'
import WeatherElementLayout, { ParsedWeatherElementLayoutProps, UpdatePing } from '../../layouts/WeatherElementLayout'
import { AirportSearchFragment, SkyConditionFragment, SkyConditionSkyCover } from '../../queries/generated/graphql'

export const SkyConditionIcon = (props: { skyCover: SkyConditionSkyCover; class: string; isDayTime: boolean }) => {
	const classes = () => `h-auto ${props.class ?? ''}`

	return (
		<div class="dark:text-white-light text-gray-600">
			<Switch>
				<Match when={props.skyCover === SkyConditionSkyCover.Few}>
					<Show when={props.isDayTime} fallback={<RiWeatherMoonCloudyLine class={classes()} />}>
						<RiWeatherSunCloudyLine class={classes()} />
					</Show>
				</Match>
				<Match when={props.skyCover === SkyConditionSkyCover.Sct}>
					<Show when={props.isDayTime} fallback={<RiWeatherMoonCloudyFill class={classes()} />}>
						<RiWeatherSunCloudyFill class={classes()} />
					</Show>
				</Match>
				<Match when={props.skyCover === SkyConditionSkyCover.Bkn}>
					<RiWeatherCloudyLine class={classes()} />
				</Match>
				<Match when={props.skyCover === SkyConditionSkyCover.Ovc}>
					<RiWeatherCloudyFill class={classes()} />
				</Match>
				<Match
					when={props.skyCover === SkyConditionSkyCover.Ovx || props.skyCover === SkyConditionSkyCover.Ovcx}>
					<RiWeatherFoggyFill class={classes()} />
				</Match>
				<Match when={props.skyCover === SkyConditionSkyCover.Clr}>
					<Show when={props.isDayTime} fallback={<RiWeatherMoonClearFill class={classes()} />}>
						<RiWeatherSunFill class={classes()} />
					</Show>
				</Match>
				<Match when={props.skyCover === SkyConditionSkyCover.Skc}>
					<Show when={props.isDayTime} fallback={<RiWeatherMoonClearFill class={classes()} />}>
						<RiWeatherSunFill class={classes()} />
					</Show>
				</Match>
				<Match when={props.skyCover === SkyConditionSkyCover.Cavok}>
					<Show when={props.isDayTime} fallback={<RiWeatherMoonClearFill class={classes()} />}>
						<RiWeatherSunFill class={classes()} />
					</Show>
				</Match>
				<Match when={props.skyCover === SkyConditionSkyCover.Nsc}>
					<Show when={props.isDayTime} fallback={<RiWeatherMoonClearFill class={classes()} />}>
						<RiWeatherSunFill class={classes()} />
					</Show>
				</Match>
				<Match when={true}>
					<span>{props.skyCover}</span>
				</Match>
			</Switch>
		</div>
	)
}

const SkyConditionText = (props: { skyCover: SkyConditionSkyCover }) => {
	return (
		<Switch>
			<Match when={props.skyCover === SkyConditionSkyCover.Few}>Few</Match>
			<Match when={props.skyCover === SkyConditionSkyCover.Sct}>Scattered</Match>
			<Match when={props.skyCover === SkyConditionSkyCover.Bkn}>Broken</Match>
			<Match when={props.skyCover === SkyConditionSkyCover.Ovc}>Overcast</Match>
			<Match when={props.skyCover === SkyConditionSkyCover.Clr}>Clear</Match>
			<Match when={props.skyCover === SkyConditionSkyCover.Skc}>Sky Clear</Match>
			<Match when={props.skyCover === SkyConditionSkyCover.Cavok}>Ceiling and Visibility OK</Match>
			<Match when={props.skyCover === SkyConditionSkyCover.Ovx}>Sky Obscured</Match>
			<Match when={props.skyCover === SkyConditionSkyCover.Nsc}>No Significant Clouds</Match>
			<Match when={true}>
				<span>{props.skyCover}</span>
			</Match>
		</Switch>
	)
}

function skyConditionsToText(
	selected: Accessor<Unit>,
	convert: (value: number) => number,
	conditions?: SkyConditionFragment[]
) {
	return conditions
		?.map(
			condition =>
				`${condition.skyCover} ` +
				(condition.cloudBase === null || condition.cloudBase === undefined
					? ''
					: Math.round(convert(condition.cloudBase)) + `${selected().symbol}`)
		)
		.join(', ')
}

interface SkyConditionsElementProps {
	skyConditions: SkyConditionFragment[]
	previousSkyConditions?: SkyConditionFragment[]
	airport: AirportSearchFragment
	isNight: boolean
}

const SkyConditionsElement: Component<SkyConditionsElementProps> = props => {
	const [unitStore] = useUnitStore()

	const selected = createMemo(() => unitStore.height.units[unitStore.height.selected])
	const convert = (value: number) => selected().conversionFunction(value)

	const hasCloudBase = () =>
		props.skyConditions.some(x => x.cloudBase !== null && x.cloudBase !== undefined)

	const sortedSkyConditions = createMemo(() =>
		props.skyConditions.map(x => x).sort((a, b) => (b.cloudBase ?? 0) - (a.cloudBase ?? 0))
	)

	const previousSortedSkyConditions = createMemo(() =>
		props.previousSkyConditions?.map(x => x).sort((a, b) => (b.cloudBase ?? 0) - (a.cloudBase ?? 0))
	)

	const isDayTime = () => !props.isNight

	const unitConfiguration = (): ParsedWeatherElementLayoutProps['unitType'] => {
		const configs: ParsedWeatherElementLayoutProps['unitType'] = []

		if (hasCloudBase()) {
			configs.push({
				name: 'Height',
				unitType: 'height',
			})
		}

		return configs
	}

	return (
		<WeatherElementLayout
			name="Sky conditions"
			icon={<TbOutlineCloud />}
			unitType={unitConfiguration()}
			updatePing={UpdatePing.Neutral}
			updatePingOldValue={skyConditionsToText(selected, convert, previousSortedSkyConditions())}
			updatePingNewValue={skyConditionsToText(selected, convert, sortedSkyConditions())}>
			<div class="dark:text-white-dark flex flex-col gap-2 text-center text-xl">
				<Show when={props.skyConditions.length > 1}>
					<For each={sortedSkyConditions()}>
						{(condition, i) => (
							<div class="mx-auto flex flex-row gap-1 text-center whitespace-nowrap">
								<SkyConditionIcon
									skyCover={condition.skyCover}
									class="my-auto w-5"
									isDayTime={isDayTime()}
								/>
								<span class="my-auto text-base">
									<SkyConditionText skyCover={condition.skyCover} />
								</span>
								<Show when={condition.cloudBase !== null && condition.cloudBase !== undefined}>
									<span class="my-auto text-base">
										at{' '}
										{Math.round(convert(condition.cloudBase!)) > 1
											? Math.round(convert(condition.cloudBase!))
											: convert(condition.cloudBase!).toFixed(1)}{' '}
										{selected().symbol}
									</span>
								</Show>
							</div>
						)}
					</For>
				</Show>
				<Show when={props.skyConditions.length === 1}>
					<div class="mx-auto">
						<SkyConditionIcon
							skyCover={props.skyConditions[0].skyCover}
							isDayTime={isDayTime()}
							class="w-10"
						/>
					</div>
					<span class="text-base">
						<SkyConditionText skyCover={props.skyConditions[0].skyCover} />
						<Show
							when={
								props.skyConditions[0].cloudBase !== null &&
								props.skyConditions[0].cloudBase !== undefined
							}>
							&nbsp;at{' '}
							{Math.round(convert(props.skyConditions[0].cloudBase!)) > 1
								? Math.round(convert(props.skyConditions[0].cloudBase!))
								: convert(props.skyConditions[0].cloudBase!).toFixed(1)}{' '}
							{selected().symbol}
						</Show>
					</span>
				</Show>
			</div>
		</WeatherElementLayout>
	)
}

export default SkyConditionsElement
