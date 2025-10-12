import * as merc from 'mercator-projection'
import { BsArrowUp } from 'solid-icons/bs'
import { CgArrowsVAlt } from 'solid-icons/cg'
import { RiMapCompass4Line } from 'solid-icons/ri'
import { createEffect, createSignal, For, Show } from 'solid-js'
import { useUnitStore } from '../../context/UnitStore'
import { AirportSearchFragment } from '../../queries/generated/graphql'
import Tooltip from '../Tooltip'
import { VariableWind } from '../weather-elements/WindElement'

const cartesianCoordinates = (lat: number, lon: number) => {
	const x = merc.fromLatLngToPoint({ lat: lat, lng: lon }).x
	const y = merc.fromLatLngToPoint({ lat: lat, lng: lon }).y

	return { x, y }
}

const calculateMinMaxOfCoordinates = (
	runways: Runway[]
): { minX: number; minY: number; maxX: number; maxY: number } => {
	const maxX = Math.max(...runways.map(runway => Math.max(runway.direction1.x, runway.direction2.x)))
	const minX = Math.min(...runways.map(runway => Math.min(runway.direction1.x, runway.direction2.x)))

	const maxY = Math.max(...runways.map(runway => Math.max(runway.direction1.y, runway.direction2.y)))
	const minY = Math.min(...runways.map(runway => Math.min(runway.direction1.y, runway.direction2.y)))

	return { minX, minY, maxX, maxY }
}

interface Runway {
	direction1: RunwayDirection
	direction2: RunwayDirection
	length: number
	width: number
}

interface RunwayDirection {
	runway: string
	heading: number
	x: number
	y: number
	windAngle?: number
	favourableLevel: number
}

const favourableToText = (favourableLevel: number) => {
	switch (favourableLevel) {
		case 0:
			return 'not favourable'
		case 1:
			return 'favourable'
		case 2:
			return 'very favourable'
	}
}

const RunwayPopup = (props: {
	runway: Runway
	runwayDirection: RunwayDirection
	windSpeed: number
	windDirection?: number
}) => {
	const [unitStore] = useUnitStore()
	const selectedLengthUnit = () => unitStore.smallLength.units[unitStore.smallLength.selected]
	const selectedSpeedUnit = () => unitStore.speed.units[unitStore.speed.selected]

	// Calculate crosswind components
	const crosswindComponent = () =>
		props.runwayDirection.windAngle !== undefined
			? Math.sin((props.runwayDirection.windAngle * Math.PI) / 180) * props.windSpeed
			: undefined

	// Left or right crosswind by comparing wind direction and runway heading
	const crosswindDirection = () => {
		if (props.windDirection === undefined) {
			return undefined
		}

		let result = props.windDirection - props.runwayDirection.heading
		if (result < 0) result += 360
		if (result > 180) return 'left'
		else return 'right'
	}

	const headwindComponent = () =>
		props.runwayDirection.windAngle !== undefined
			? Math.cos((props.runwayDirection.windAngle * Math.PI) / 180) * props.windSpeed
			: undefined
	const tailwindComponent = () => (headwindComponent() ? -headwindComponent()! : undefined)

	return (
		<div class="flex flex-col gap-1">
			<h4 class="text-sm font-semibold">Runway {props.runwayDirection.runway}</h4>
			<div class="flex gap-1">
				<RiMapCompass4Line
					class="my-auto origin-center transform"
					style={{
						rotate: `${props.runwayDirection.heading - 45}deg`,
					}}
				/>
				<span class="text-sm">Heading: {Math.round(props.runwayDirection.heading)}°</span>
			</div>
			<div class="flex gap-1">
				<CgArrowsVAlt class="my-auto" />
				<span class="text-sm">
					Length: {Math.round(selectedLengthUnit().conversionFunction(props.runway.length))}{' '}
					{selectedLengthUnit().symbol}
				</span>
			</div>
			<div class="flex gap-1">
				<CgArrowsVAlt class="my-auto rotate-90 transform" />
				<span class="text-sm">
					Width: {Math.round(selectedLengthUnit().conversionFunction(props.runway.width))}{' '}
					{selectedLengthUnit().symbol}
				</span>
			</div>

			<Show when={props.windSpeed > 0 && props.windDirection != undefined}>
				<div class="flex gap-1">
					<div
						class="my-auto h-3 w-3 shrink-0 rounded-full border-[3px]"
						classList={{
							'bg-gray-600': props.runwayDirection.favourableLevel === 0,
							'bg-blue-600 dark:bg-blue-800': props.runwayDirection.favourableLevel === 1,
							'bg-green-600 dark:bg-green-800': props.runwayDirection.favourableLevel === 2,
							'border-gray-600': props.runwayDirection.favourableLevel === 0,
							'border-blue-400 dark:border-blue-600': props.runwayDirection.favourableLevel === 1,
							'border-green-400 dark:border-green-600': props.runwayDirection.favourableLevel === 2,
						}}
						aria-label={`Wind direction is ${favourableToText(props.runwayDirection.favourableLevel)}`}
					/>
					<Show when={props.runwayDirection.windAngle !== undefined}>
						<span class="text-sm">
							Wind angle: {favourableToText(props.runwayDirection.favourableLevel)} (
							{Math.round(props.runwayDirection.windAngle!)}°)
						</span>
					</Show>
				</div>
			</Show>

			<Show
				when={
					props.windDirection !== undefined &&
					headwindComponent() != undefined &&
					Math.round(selectedSpeedUnit().conversionFunction(headwindComponent()!)) > 0
				}>
				<div class="flex gap-1">
					<BsArrowUp
						class="my-auto origin-center transform"
						style={{
							rotate: `${180 % 360}deg`,
						}}
					/>
					<span class="text-sm">
						Headwind: {Math.round(selectedSpeedUnit().conversionFunction(headwindComponent()!))}{' '}
						{selectedSpeedUnit().symbol}
					</span>
				</div>
			</Show>
			<Show
				when={
					props.windDirection != undefined &&
					crosswindComponent() != undefined &&
					Math.round(selectedSpeedUnit().conversionFunction(crosswindComponent()!)) > 0
				}>
				<div class="flex gap-1">
					<BsArrowUp
						class="my-auto origin-center transform"
						style={{
							rotate:
								crosswindDirection() === 'right' ? `${(90 + 180) % 360}deg` : `${(270 + 180) % 360}deg`,
						}}
					/>
					<span class="text-sm">
						Crosswind: {Math.round(selectedSpeedUnit().conversionFunction(crosswindComponent()!))}{' '}
						{selectedSpeedUnit().symbol} from the {crosswindDirection()}{' '}
					</span>
				</div>
			</Show>
			<Show
				when={
					tailwindComponent() != undefined &&
					props.windDirection != undefined &&
					Math.round(selectedSpeedUnit().conversionFunction(tailwindComponent()!)) > 0
				}>
				<div class="flex gap-1">
					<BsArrowUp
						class="my-auto origin-center transform"
						style={{
							rotate: `${0}deg`,
						}}
					/>
					<span class="text-sm">
						Tailwind: {Math.round(selectedSpeedUnit().conversionFunction(tailwindComponent()!))}{' '}
						{selectedSpeedUnit().symbol}
					</span>
				</div>
			</Show>
		</div>
	)
}

const RunwayAndWindRenderer = (props: {
	airport: AirportSearchFragment
	windSpeed: number
	windDirection?: number
	variableWind: VariableWind | undefined
	isVariable: boolean
}) => {
	const [runways, setRunways] = createSignal<Runway[]>([])

	const [centerX, setCenterX] = createSignal(0)
	const [centerY, setCenterY] = createSignal(0)

	const [realDiagonal, setRealDiagonal] = createSignal(0)

	// Scaling zoom
	const scale = 0.03

	createEffect(() => {
		const preparingRunways: Runway[] = []

		props.airport.runways.forEach(runway => {
			// Check if all runways have coordinates
			if (
				!(
					runway.lowRunwayLatitude &&
					runway.lowRunwayLongitude &&
					runway.highRunwayLatitude &&
					runway.highRunwayLongitude
				)
			) {
				return
			}

			if (
				runway.lowRunwayLatitude === undefined ||
				runway.lowRunwayLongitude === undefined ||
				runway.highRunwayLatitude === undefined ||
				runway.highRunwayLongitude === undefined
			) {
				return
			}

			const direction1 = cartesianCoordinates(runway.lowRunwayLatitude, runway.lowRunwayLongitude)
			const direction2 = cartesianCoordinates(runway.highRunwayLatitude, runway.highRunwayLongitude)

			preparingRunways.push({
				direction1: {
					runway: runway.lowRunwayIdentifier,
					heading: runway.lowRunwayHeading ?? 0,
					x: direction1.x,
					y: direction1.y,
					favourableLevel: 0,
					windAngle: props.windDirection
						? 180 - Math.abs(Math.abs((runway.lowRunwayHeading ?? 0) - props.windDirection) - 180)
						: undefined,
				},
				direction2: {
					runway: runway.highRunwayIdentifier,
					heading: runway.highRunwayHeading ?? 0,
					x: direction2.x,
					y: direction2.y,
					favourableLevel: 0,
					windAngle: props.windDirection
						? 180 - Math.abs(Math.abs((runway.highRunwayHeading ?? 0) - props.windDirection) - 180)
						: undefined,
				},
				length: runway.length ?? 0,
				width: runway.width ?? 0,
			})
		})

		// Calculate the best runway heading
		if (props.windSpeed > 0 && props.windDirection && props.windDirection != 0) {
			const bestRunways = preparingRunways.filter(runway => {
				if (runway.direction1.windAngle === undefined || runway.direction2.windAngle === undefined) {
					return
				}

				return runway.direction1.windAngle < 90 || runway.direction2.windAngle < 90
			})

			bestRunways.forEach(runway => {
				// Set the favourable level to 1 if the wind angle is less than 90 and 2 if the wind angle is less than 45 degrees
				if (runway.direction1.windAngle! < 90)
					runway.direction1.favourableLevel = runway.direction1.windAngle! < 45 ? 2 : 1

				if (runway.direction2.windAngle! < 90)
					runway.direction2.favourableLevel = runway.direction2.windAngle! < 45 ? 2 : 1
			})
		}

		const { minX, minY, maxX, maxY } = calculateMinMaxOfCoordinates(preparingRunways)

		const scaling = Math.sqrt((maxX - minX) * (maxX - minX) + (maxY - minY) * (maxY - minY)) * scale

		for (const runway of preparingRunways) {
			runway.direction1.x = (runway.direction1.x - minX) / scaling
			runway.direction1.y = (runway.direction1.y - minY) / scaling
			runway.direction2.x = (runway.direction2.x - minX) / scaling
			runway.direction2.y = (runway.direction2.y - minY) / scaling
		}

		const maximums = calculateMinMaxOfCoordinates(preparingRunways)

		// Scaling size lower is bigger
		setRealDiagonal(Math.sqrt(Math.pow(maximums.maxX, 2) + Math.pow(maximums.maxY, 2)) * 0.8)

		setCenterX(realDiagonal() - maximums.maxX / 2)
		setCenterY(realDiagonal() - maximums.maxY / 2)

		setRunways(preparingRunways)
	})

	// Calculate the radius around the center of the airport, to show a wind arrow
	const radius = () => realDiagonal() * 0.95

	const realCenterX = () => -centerX() + realDiagonal()
	const realCenterY = () => -centerY() + realDiagonal()

	// Calculate the wind arrow from the wind direction and variable wind if present
	const windArrows = (): { angle: number; x: number; y: number; isVariable: boolean }[] => {
		const arrows: { angle: number; x: number; y: number; isVariable: boolean }[] = []

		if (props.windSpeed > 0 && props.windDirection && props.windDirection != 0) {
			arrows.push({
				angle: props.windDirection,
				x: realCenterX() + radius() * Math.cos(((props.windDirection - 90) * Math.PI) / 180),
				y: realCenterY() + radius() * Math.sin(((props.windDirection - 90) * Math.PI) / 180),
				isVariable: false,
			})
		}

		if (props.variableWind) {
			arrows.push({
				angle: props.variableWind.from,
				x: realCenterX() + radius() * Math.cos(((props.variableWind.from - 90) * Math.PI) / 180),
				y: realCenterY() + radius() * Math.sin(((props.variableWind.from - 90) * Math.PI) / 180),
				isVariable: true,
			})

			arrows.push({
				angle: props.variableWind.to,
				x: realCenterX() + radius() * Math.cos(((props.variableWind.to - 90) * Math.PI) / 180),
				y: realCenterY() + radius() * Math.sin(((props.variableWind.to - 90) * Math.PI) / 180),
				isVariable: true,
			})
		}

		return arrows
	}

	return (
		<Show when={runways().length > 0}>
			<div class="relative mx-auto w-full rounded-full md:mx-0">
				<svg
					class="flex h-full md:w-88"
					viewBox={`${-centerX()} ${-centerY()}  ${realDiagonal() * 2} ${realDiagonal() * 2}`}
					xmlns="http://www.w3.org/2000/svg">
					{/* Compass circle */}
					<circle
						transform-origin="center"
						class="fill-gray-100 transition-colors dark:fill-[#212637]"
						stroke-width="0.2"
						cx={realCenterX()}
						cy={realCenterY()}
						r={realDiagonal() * 0.85}
					/>

					{/* Wind arrow */}
					<Show when={props.windDirection && props.windDirection != 0}>
						<For each={windArrows()}>
							{arrow => (
								<svg
									width="8"
									height="8"
									fill="none"
									viewBox="0 0 24 24"
									transform-origin="center"
									x={arrow.x - 4}
									y={arrow.y - 4}>
									<title>{arrow.isVariable ? 'Variable wind direction' : 'Wind direction'}</title>
									<path
										transform-origin="center"
										transform={`rotate(${arrow.angle})`}
										stroke="currentColor"
										class="dark:stroke-white-dark stroke-gray-600 transition-colors"
										classList={{ 'opacity-50': arrow.isVariable }}
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-dasharray={arrow.isVariable ? '1 1.2' : ''}
										stroke-width={arrow.isVariable ? '0.75' : '1.25'}
										d="M15.25 10.75L12 14.25L8.75 10.75"
									/>
								</svg>
							)}
						</For>
					</Show>

					{/* Runways including stripes */}
					<For each={runways()}>
						{(r, i) => (
							<>
								<line
									x1={r.direction1.x}
									y1={r.direction1.y}
									x2={r.direction2.x}
									y2={r.direction2.y}
									class="stroke-gray-600"
									stroke-width="0.9"
								/>
								<line
									x1={r.direction1.x}
									y1={r.direction1.y}
									x2={r.direction2.x}
									y2={r.direction2.y}
									class="stroke-white-dark"
									stroke-width="0.1"
									stroke-dasharray="0.6,0.4"
								/>
							</>
						)}
					</For>

					{/* Runway bubbles outside when favourable */}
					<For each={runways()}>
						{(r, i) => (
							<>
								<Tooltip
									component={
										<RunwayPopup
											runway={r}
											runwayDirection={r.direction1}
											windDirection={props.windDirection}
											windSpeed={props.windSpeed}
										/>
									}>
									<circle
										class="transition-colors"
										classList={{
											'fill-red-400 dark:fill-red-600': r.direction1.favourableLevel === 0,
											'fill-blue-400 dark:fill-blue-600': r.direction1.favourableLevel === 1,
											'fill-green-400 dark:fill-green-600': r.direction1.favourableLevel === 2,
										}}
										cx={r.direction1.x}
										cy={r.direction1.y}
										r={r.direction1.favourableLevel === 0 ? 1.5 : 2}
									/>
								</Tooltip>
								<Tooltip
									component={
										<RunwayPopup
											runway={r}
											runwayDirection={r.direction2}
											windDirection={props.windDirection}
											windSpeed={props.windSpeed}
										/>
									}>
									<circle
										class="transition-colors"
										classList={{
											'fill-red-400 dark:fill-red-600': r.direction2.favourableLevel === 0,
											'fill-blue-400 dark:fill-blue-600': r.direction2.favourableLevel === 1,
											'fill-green-400 dark:fill-green-600': r.direction2.favourableLevel === 2,
										}}
										cx={r.direction2.x}
										cy={r.direction2.y}
										r={r.direction2.favourableLevel === 0 ? 1.5 : 2}
									/>
								</Tooltip>
							</>
						)}
					</For>

					{/* Runway bubbles inside */}
					<For each={runways()}>
						{(r, i) => (
							<>
								<circle
									class="pointer-events-none transition-colors"
									classList={{
										'fill-gray-600': r.direction1.favourableLevel === 0,
										'fill-blue-600 dark:fill-blue-800': r.direction1.favourableLevel === 1,
										'fill-green-600 dark:fill-green-800': r.direction1.favourableLevel === 2,
									}}
									cx={r.direction1.x}
									cy={r.direction1.y}
									r="1.5"
								/>

								<circle
									class="pointer-events-none transition-colors"
									classList={{
										'fill-gray-600': r.direction2.favourableLevel === 0,
										'fill-blue-600 dark:fill-blue-800': r.direction2.favourableLevel === 1,
										'fill-green-600 dark:fill-green-800': r.direction2.favourableLevel === 2,
									}}
									cx={r.direction2.x}
									cy={r.direction2.y}
									r="1.5"
								/>
							</>
						)}
					</For>

					{/* Runway labels */}
					<For each={runways()}>
						{(r, i) => (
							<>
								<text
									class="pointer-events-none fill-white text-[1.1px]"
									x={r.direction1.x}
									y={r.direction1.y}
									dominant-baseline="middle"
									text-rendering="optimizeLegibility"
									text-anchor="middle">
									{r.direction1.runway}
								</text>
								<text
									class="pointer-events-none fill-white text-[1.1px]"
									x={r.direction2.x}
									y={r.direction2.y}
									dominant-baseline="middle"
									text-rendering="optimizeLegibility"
									text-anchor="middle">
									{r.direction2.runway}
								</text>
							</>
						)}
					</For>
				</svg>
			</div>
		</Show>
	)
}

export default RunwayAndWindRenderer
