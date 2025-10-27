import { TbEye } from 'solid-icons/tb'
import { Component } from 'solid-js'
import { useUnitStore } from '../../context/UnitStore'
import WeatherElementLayout from '../../layouts/WeatherElementLayout'
import { MetarFragment } from '../../queries/generated/graphql'

interface VisibilityElementProps {
	visibility: MetarFragment['visibility']
	visibilityMoreThan: boolean
	previousVisibility?: MetarFragment['visibility']
	previousVisibilityMoreThan?: boolean
}

const VisibilityElement: Component<VisibilityElementProps> = props => {
	const [unitStore] = useUnitStore()

	const selected = () => unitStore.length.units[unitStore.length.selected]

	const value = (visibility: MetarFragment['visibility'], visibilityMoreThan: boolean) => {
		const realVisibility = selected().conversionFunction(visibility!)
		if (!realVisibility) {
			return undefined
		}

		if (visibilityMoreThan) {
			return `≥ ${Math.round(realVisibility!)} ${selected().symbol}`
		}

		return `${realVisibility!.toFixed(1)} ${selected().symbol}`
	}

	return (
		<WeatherElementLayout
			name="Visibility"
			icon={<TbEye />}
			unitType={[{ unitType: 'length' }]}
			updatePing={Math.sign((props.visibility ?? 0) - (props.previousVisibility ?? 0))}
			updatePingOldValue={value(props.previousVisibility, props.previousVisibilityMoreThan ?? false)?.toString()}
			updatePingNewValue={`${value(props.visibility, props.visibilityMoreThan)}`}>
			<p class="dark:text-white-dark text-center text-xl">{value(props.visibility, props.visibilityMoreThan)}</p>
		</WeatherElementLayout>
	)
}

export default VisibilityElement
