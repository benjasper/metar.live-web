import { TbOutlineTemperature } from 'solid-icons/tb'
import { Component } from 'solid-js'
import { useUnitStore } from '../../context/UnitStore'
import WeatherElementLayout, { UpdatePing } from '../../layouts/WeatherElementLayout'

interface TemperatureElementProps {
	name: string
	temperature: number
	previousTemperature?: number
}

const TemperatureElement: Component<TemperatureElementProps> = props => {
	const [unitStore] = useUnitStore()

	const selected = () => unitStore.temperature.units[unitStore.temperature.selected]
	const value = (temperature: number) => {
		const result = Math.round(selected().conversionFunction(temperature))
		return `${result} ${selected().symbol}`
	}

	return (
		<WeatherElementLayout
			name={props.name}
			icon={<TbOutlineTemperature />}
			unitType={[{ unitType: 'temperature' }]}
			updatePing={UpdatePing.Neutral}
			updatePingOldValue={
				props.previousTemperature === null || props.previousTemperature === undefined
					? undefined
					: value(props.previousTemperature)
			}
			updatePingNewValue={value(props.temperature)}>
			<p class="dark:text-white-dark text-center text-xl">{value(props.temperature)}</p>
		</WeatherElementLayout>
	)
}

export default TemperatureElement
