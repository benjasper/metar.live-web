import { Component } from 'solid-js'
import { MetarFlightCategory } from '../queries/generated/graphql'

interface FlightCategorySymbolProps {
	flightCategory: MetarFlightCategory
	class?: string
	size?: 'small' | 'medium' | 'large'
}

const FlightCategorySymbol: Component<FlightCategorySymbolProps> = props => {
	const sizesOutside = {
		small: 'h-3 w-3',
		medium: 'h-4 w-4',
		large: 'h-5 w-5',
	}

	const sizesInside = {
		small: 'h-1 w-1',
		medium: 'h-1.5 w-1.5',
		large: 'h-2 w-2',
	}

	return (
		<div
			class={`relative mx-auto shrink-0 rounded-full ${props.class} ${sizesOutside[props.size ?? 'medium']}`}
			classList={{
				'bg-green-400 dark:bg-green-600': props.flightCategory === MetarFlightCategory.Vfr,
				'bg-blue-400 dark:bg-blue-600': props.flightCategory === MetarFlightCategory.Mvfr,
				'bg-red-400 dark:bg-red-600': props.flightCategory === MetarFlightCategory.Ifr,
				'bg-purple-400 dark:bg-purple-600': props.flightCategory === MetarFlightCategory.Lifr,
			}}>
			<div
				class={`absolute top-1/2 left-1/2 shrink-0 -translate-x-1/2 -translate-y-1/2 transform rounded-full ${
					sizesInside[props.size ?? 'medium']
				}`}
				classList={{
					'bg-green-600 dark:bg-green-800': props.flightCategory === MetarFlightCategory.Vfr,
					'bg-blue-600 dark:bg-blue-800': props.flightCategory === MetarFlightCategory.Mvfr,
					'bg-red-600 dark:bg-red-800': props.flightCategory === MetarFlightCategory.Ifr,
					'bg-purple-600 dark:bg-purple-800': props.flightCategory === MetarFlightCategory.Lifr,
				}}
			/>
		</div>
	)
}

export default FlightCategorySymbol
