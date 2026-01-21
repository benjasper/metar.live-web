import { BsArrowUp } from 'solid-icons/bs'
import { TbOutlineWindmill } from 'solid-icons/tb'
import { Component } from 'solid-js'
import WeatherElementLayout from '../../layouts/WeatherElementLayout'

interface WindShearElementProps {
	direction: number
	speed: number
	height: number
}

const WindShearElement: Component<WindShearElementProps> = props => {
	return (
		<WeatherElementLayout name="Wind shear" icon={<TbOutlineWindmill />}>
			<BsArrowUp
				class="mx-auto origin-center transform"
				size={24}
				style={{
					rotate: `${(props.direction + 180) % 360}deg`,
				}}
			/>
			<div class="flex flex-col text-center">
				<span>
					{props.direction}° at {props.speed} kt
				</span>
				<span>at {props.height} ft</span>
			</div>
		</WeatherElementLayout>
	)
}

export default WindShearElement
