import { A } from '@solidjs/router'
import { TbOutlineArrowUpCircle } from 'solid-icons/tb'
import { Component, For, Match, Show, Switch } from 'solid-js'
import { useUnitStore } from '../context/UnitStore'
import { StationsVicinityFragment } from '../queries/generated/graphql'
import Slider from './Slider'
import AirportClassification from './AirportClassification'
import FlightCategorySymbol from './FlightCategorySymbol'
import { Tag } from './Tag'

interface AirportsInVicinityProps {
	airportCoordinates: {
		latitude: number
		longitude: number
	}
	stations: StationsVicinityFragment['stationsVicinity']
}

const degreeToDirection = (degree: number): string => {
	const directions = [
		'North',
		'North-East',
		'East',
		'South-East',
		'South',
		'South-West',
		'West',
		'North-West',
		'North',
	]
	if (degree < 0) {
		degree = 360 - Math.abs(degree)
	}

	const index = Math.round((degree % 360) / 45)
	return directions[index]
}

interface Coordinates {
	latitude: number
	longitude: number
}

function getInitialBearing(point1: Coordinates, point2: Coordinates): number {
	const lat1 = (point1.latitude * Math.PI) / 180
	const lon1 = (point1.longitude * Math.PI) / 180
	const lat2 = (point2.latitude * Math.PI) / 180
	const lon2 = (point2.longitude * Math.PI) / 180

	const Δlon = lon2 - lon1

	const θ = Math.atan2(
		Math.sin(Δlon) * Math.cos(lat2),
		Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(Δlon)
	)

	return (θ * 180) / Math.PI
}

const AirportsInVicinity: Component<AirportsInVicinityProps> = props => {
	const [unitStore] = useUnitStore()

	const selectedLengthUnit = () => unitStore.length.units[unitStore.length.selected]

	// Calculate bearing from airport to airport in vicinity
	const bearing = (airport: StationsVicinityFragment['stationsVicinity'][number]) => {
		const pos1: Coordinates = {
			latitude: airport.station.airport!.latitude,
			longitude: airport.station.airport!.longitude,
		}

		const pos2: Coordinates = {
			latitude: props.airportCoordinates.latitude,
			longitude: props.airportCoordinates.longitude,
		}

		return getInitialBearing(pos2, pos1)
	}

	return (
		<section class="flex flex-col">
			<Show when={props.stations.length > 0}>
				<h3 class="font-semibold text-slate-900 dark:text-white">Nearby airports</h3>
				<div class="flex gap-2 pt-2">
					<Tag>
						{props.stations.length >= 10 ? 'At least 10' : props.stations.length}{' '}
						{props.stations.length === 1 ? 'airport' : 'airports'} in the vicinity
					</Tag>
				</div>
				<Slider class="mt-4" items={props.stations} mobileCentered={true}>
					<For each={props.stations}>
						{airport => (
							<A
								href={`/airport/${airport.station.airport?.identifier}`}
								class="group relative flex h-full flex-col gap-3 rounded-3xl border border-slate-300/60 bg-slate-50/85 px-5 py-5 text-left text-slate-900 transition-colors duration-200 hover:border-slate-300/60 hover:bg-slate-50/95 md:mx-0 dark:border-white/10 dark:bg-slate-900/70 dark:text-white dark:hover:border-white/20 dark:hover:bg-slate-900/80">
								<div class="flex flex-col whitespace-nowrap">
									<h3 class="text-lg font-semibold text-slate-900 dark:text-white">
										<Switch>
											<Match
												when={
													airport.station.airport?.icaoCode &&
													airport.station.airport?.iataCode
												}>
												{airport.station.airport?.icaoCode} /{' '}
												{airport.station.airport?.iataCode}
											</Match>
											<Match when={airport.station.airport?.icaoCode}>
												{airport.station.airport?.icaoCode}
											</Match>
											<Match when={airport.station.airport?.gpsCode}>
												{airport.station.airport?.gpsCode}
											</Match>
											<Match when={true}>{airport.station.airport?.identifier}</Match>
										</Switch>
									</h3>
									<span class="text-sm">{airport.station.airport?.name}</span>
									<div class="mt-3 flex flex-row gap-2 md:flex-nowrap">
										<Tag intent="neutral">
											<AirportClassification type={airport.station.airport!.type} />
										</Tag>
										<Show
											when={
												airport.station.metars.edges.length > 0 &&
												airport.station.metars.edges[0].node.flightCategory
											}>
											<Tag intent="neutral" class="w-fit">
												<FlightCategorySymbol
													size="small"
													class="my-auto"
													flightCategory={
														airport.station.metars.edges[0].node.flightCategory!
													}
												/>
												{airport.station.metars.edges[0].node.flightCategory}
											</Tag>
										</Show>
									</div>
								</div>
								<TbOutlineArrowUpCircle
									class="dark:text-white-dark mx-auto my-2 origin-center transform text-slate-700 transition-colors duration-300"
									size={40}
									style={{
										rotate: `${bearing(airport)}deg`,
									}}
								/>
								<span class="mx-auto text-sm font-medium whitespace-nowrap text-slate-800 dark:text-white/80">
									{Math.round(selectedLengthUnit().conversionFunction(airport.distance))}{' '}
									{selectedLengthUnit().symbol} ({degreeToDirection(bearing(airport))})
								</span>
							</A>
						)}
					</For>
				</Slider>
			</Show>
		</section>
	)
}

export default AirportsInVicinity
