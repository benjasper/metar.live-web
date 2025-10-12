import { BiRegularCategoryAlt } from 'solid-icons/bi'
import { Component } from 'solid-js'
import WeatherElementLayout from '../../layouts/WeatherElementLayout'
import { MetarFlightCategory, MetarFragment } from '../../queries/generated/graphql'
import FlightCategorySymbol from '../FlightCategorySymbol'

interface FlightCategoryElementProps {
	latestMetar: MetarFragment
	previousMetar?: MetarFragment
}

const FlightCategoryElement: Component<FlightCategoryElementProps> = props => {
	const assignIndexToCategory = (value?: MetarFragment['flightCategory']) => {
		switch (value) {
			case MetarFlightCategory.Vfr:
				return 0
			case MetarFlightCategory.Mvfr:
				return 1
			case MetarFlightCategory.Ifr:
				return 2
			case MetarFlightCategory.Lifr:
				return 3
			default:
				return undefined
		}
	}

	const previousMetarIndex = () => assignIndexToCategory(props.previousMetar?.flightCategory)
	const latestMetarIndex = () => assignIndexToCategory(props.latestMetar.flightCategory)!

	return (
		<WeatherElementLayout
			name="Flight category"
			icon={<BiRegularCategoryAlt />}
			updatePing={Math.sign((previousMetarIndex() ?? 0) - latestMetarIndex())}
			updatePingOldValue={props.previousMetar?.flightCategory?.toString()}
			updatePingNewValue={props.latestMetar.flightCategory?.toString()}>
			<div class="flex flex-col text-center">
				<FlightCategorySymbol size="large" class="mb-2" flightCategory={props.latestMetar.flightCategory!} />
				<p class="dark:text-white-dark mx-auto text-center text-base">{props.latestMetar.flightCategory}</p>
			</div>
		</WeatherElementLayout>
	)
}

export default FlightCategoryElement
