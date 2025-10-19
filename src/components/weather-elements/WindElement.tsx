import { BsArrowUp } from 'solid-icons/bs'
import { TbWindsock } from 'solid-icons/tb'
import { Component, createEffect, createMemo, Show } from 'solid-js'
import { Unit, useUnitStore } from '../../context/UnitStore'
import WeatherElementLayout, { ParsedWeatherElementLayoutProps } from '../../layouts/WeatherElementLayout'
import { AirportSearchFragment, MetarFragment } from '../../queries/generated/graphql'
import RunwayAndWindRenderer from '../special/RunwayAndWindRenderer'

type WindData = {
	windDirection: MetarFragment['windDirection']
	windSpeed: MetarFragment['windSpeed']
	windGust: MetarFragment['windGust']
	variableWindDirection?: string
	isVariable: boolean
}

interface WindElementProps {
	airport: AirportSearchFragment

	windData: WindData
	previousWindDate?: WindData

	size: 'large' | 'small'
}
export interface VariableWind {
	from: number
	to: number
}

function getWindText(
	selected: () => Unit,
	windDirection?: number,
	windSpeed?: number,
	windGust?: number,
	variableWindDirection?: VariableWind
): string | undefined {
	let windText = ''

	if (!windDirection && !windSpeed) {
		return undefined
	}

	if (!windSpeed || (windSpeed && windSpeed === 0)) {
		windText += 'Wind calm'
		return windText
	}

	if (windDirection) {
		windText += `${windDirection}°`
	} else {
		windText += 'Variable'
	}

	windText += ` @ ${windSpeed} ${selected().symbol}`

	if (variableWindDirection) {
		windText += ` and variable from ${variableWindDirection.from}° to ${variableWindDirection.to}°`
	}

	if (windGust) {
		windText += ` and gusting @ ${windGust} ${selected().symbol}`
	}

	return windText
}

function parseVariableWindFromMetar(metar?: string): VariableWind | undefined {
	const result = metar?.match(/\d{3}V\d{3}/g)
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

const WindElement: Component<WindElementProps> = props => {
	const [unitStore] = useUnitStore()

	const variableWind = createMemo(() => parseVariableWindFromMetar(props.windData.variableWindDirection))
	const previousVariableWind = createMemo(() =>
		parseVariableWindFromMetar(props.previousWindDate?.variableWindDirection)
	)

	const selected = () => unitStore.speed.units[unitStore.speed.selected]
	const windSpeed = () => Math.round(selected().conversionFunction(props.windData.windSpeed!))
	const windGust = () => Math.round(selected().conversionFunction(props.windData.windGust!))

	const windText = () =>
		getWindText(selected, props.windData.windDirection ?? undefined, windSpeed(), windGust(), variableWind())

	const previousWindSpeed = () =>
		props.previousWindDate?.windSpeed
			? Math.round(selected().conversionFunction(props.previousWindDate.windSpeed))
			: undefined
	const previousWindGust = () =>
		props.previousWindDate?.windGust
			? Math.round(selected().conversionFunction(props.previousWindDate.windGust))
			: undefined

	const previousWindText = () =>
		getWindText(
			selected,
			props.previousWindDate?.windDirection ?? undefined,
			previousWindSpeed(),
			previousWindGust(),
			previousVariableWind()
		)

	const unitConfigurations = () => {
		const configurations: ParsedWeatherElementLayoutProps['unitType'] = []

		if (props.windData.windSpeed || props.windData.windGust) {
			configurations.push({
				name: 'Wind speed',
				unitType: 'speed',
			})
		}

		configurations.push({
			name: 'Runway length and width',
			unitType: 'smallLength',
		})

		return configurations
	}

	return (
		<WeatherElementLayout
			name="Wind"
			class="md:flex-[1_1_320px] md:basis-[min(100%,calc(60%-1.5rem))] lg:flex-[1_1_360px]"
			icon={<TbWindsock />}
			unitType={unitConfigurations()}
			updatePing={Math.sign((previousWindSpeed() ?? 0 + (previousWindGust() ?? 0)) - (windSpeed() + windGust()))}
			updatePingOldValue={previousWindText()}
			updatePingNewValue={windText()}>
			<Show when={props.size === 'large'}>
				<RunwayAndWindRenderer
					airport={props.airport}
					windDirection={props.windData.windDirection!}
					windSpeed={props.windData.windSpeed!}
					variableWind={variableWind()}
					isVariable={props.windData.isVariable}
				/>
			</Show>
			<Show when={props.size === 'small'}>
				<Show when={props.windData.windDirection! > 0}>
					<BsArrowUp
						class="mx-auto origin-center transform"
						size={24}
						style={{
							rotate: `${(props.windData.windDirection! + 180) % 360}deg`,
						}}
					/>
				</Show>
			</Show>
			<div class="dark:text-white-dark flex flex-col text-center">
				<span class="text-lg">
					<Show when={props.windData.windSpeed && props.windData.windSpeed != 0} fallback="Wind calm">
						<Show when={props.windData.windDirection} fallback="Variable">
							{props.windData.windDirection}°
						</Show>{' '}
						at {windSpeed()} {selected().symbol}
					</Show>
				</span>
				<Show when={variableWind()}>
					<span>
						variable from {variableWind()!.from}° to {variableWind()!.to}°
					</span>
				</Show>
				<Show when={props.windData.windGust}>
					<span>
						with gusts up to {windGust()} {selected().symbol}
					</span>
				</Show>
			</div>
		</WeatherElementLayout>
	)
}

export default WindElement
