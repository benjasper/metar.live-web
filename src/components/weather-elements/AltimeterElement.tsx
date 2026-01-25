import { TbOutlineGauge } from 'solid-icons/tb'
import { Component } from 'solid-js'
import { useUnitStore } from '../../context/UnitStore'
import WeatherElementLayout, { UpdatePing } from '../../layouts/WeatherElementLayout'
import { PressureUnit } from '../../models/units'

interface AltimeterElementProps {
	altimeter: number
	previousAltimeter?: number
}

const AltimeterElement: Component<AltimeterElementProps> = props => {
	const [unitStore] = useUnitStore()

	const selected = () => unitStore.pressure.units[unitStore.pressure.selected]

	const value = (altimeter: number) => {
		const result =
			selected().symbol === PressureUnit.InchesOfMercury
				? (Math.round((selected().conversionFunction(altimeter) + Number.EPSILON) * 100) / 100).toFixed(2)
				: Math.round(selected().conversionFunction(altimeter))

		return `${result} ${selected().symbol}`
	}

	return (
		<WeatherElementLayout
			name="Altimeter"
			icon={<TbOutlineGauge />}
			unitType={[{ unitType: 'pressure' }]}
			updatePing={UpdatePing.Neutral}
			updatePingOldValue={
				props.previousAltimeter === null || props.previousAltimeter === undefined
					? undefined
					: value(props.previousAltimeter)
			}
			updatePingNewValue={value(props.altimeter)}>
			<p class="text-center text-xl dark:text-white/90">{value(props.altimeter)}</p>
		</WeatherElementLayout>
	)
}

export default AltimeterElement
