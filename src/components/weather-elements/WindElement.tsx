import { BsArrowUp } from 'solid-icons/bs'
import { TbOutlineWind } from 'solid-icons/tb'
import { Component, createEffect, createMemo, Show } from 'solid-js'
import { Unit, useUnitStore } from '../../context/UnitStore'
import WeatherElementLayout, { ParsedWeatherElementLayoutProps } from '../../layouts/WeatherElementLayout'
import { parseVariableWindFromMetar, VariableWind } from '../../models/weather'
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

const formatDirection = (value?: number | null): string | undefined => {
	if (value === undefined || value === null) {
		return undefined
	}
	const normalized = ((value % 360) + 360) % 360
	return normalized === 0 ? '000' : normalized.toString().padStart(3, '0')
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

	const directionText = formatDirection(windDirection)
	if (directionText) {
		windText += `${directionText}°`
	} else {
		windText += 'Variable'
	}

	windText += ` @ ${windSpeed} ${selected().symbol}`

	if (variableWindDirection) {
		const from = formatDirection(variableWindDirection.from) ?? variableWindDirection.from.toString()
		const to = formatDirection(variableWindDirection.to) ?? variableWindDirection.to.toString()
		windText += ` and variable from ${from}° to ${to}°`
	}

	if (windGust) {
		windText += ` and gusting @ ${windGust} ${selected().symbol}`
	}

	return windText
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
			class="md:flex-[1_1_520px] md:basis-[calc(100%-1.5rem)] lg:flex-[1_1_560px] lg:basis-[calc(66%-1.5rem)]"
			icon={<TbOutlineWind />}
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
						<Show
							when={props.windData.windDirection !== null && props.windData.windDirection !== undefined}
							fallback="Variable">
							{(() => {
								const formatted = formatDirection(props.windData.windDirection)
								return `${formatted ?? '---'}°`
							})()}
						</Show>{' '}
						at {windSpeed()} {selected().symbol}
					</Show>
				</span>
				<Show when={variableWind()}>
					<span>
						{(() => {
							const from = formatDirection(variableWind()!.from)
							const to = formatDirection(variableWind()!.to)
							return `variable from ${from ?? '---'}° to ${to ?? '---'}°`
						})()}
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
