import { BiSolidPlaneTakeOff } from 'solid-icons/bi'
import { IoWaterOutline } from 'solid-icons/io'
import { TbOutlineHelicopterLanding } from 'solid-icons/tb'
import { Component, Match, Switch } from 'solid-js'
import { AirportType } from '../queries/generated/graphql'

const AirportClassification: Component<{ type: AirportType }> = props => {
	return (
		<Switch>
			<Match when={props.type === AirportType.LargeAirport}>
				<BiSolidPlaneTakeOff class="my-auto" />
				Large airport
			</Match>
			<Match when={props.type === AirportType.MediumAirport}>
				<BiSolidPlaneTakeOff class="my-auto" />
				Medium airport
			</Match>
			<Match when={props.type === AirportType.SmallAirport}>
				<BiSolidPlaneTakeOff class="my-auto" />
				Small airport
			</Match>
			<Match when={props.type === AirportType.SeaplaneBase}>
				<IoWaterOutline class="my-auto" />
				Seaplane base
			</Match>
			<Match when={props.type === AirportType.Heliport}>
				<TbOutlineHelicopterLanding class="my-auto" />
				Heliport
			</Match>
			<Match when={props.type === AirportType.ClosedAirport}>Closed</Match>
		</Switch>
	)
}

export default AirportClassification
