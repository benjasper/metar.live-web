import { Component, Match, Show, Switch, createMemo, createSignal } from 'solid-js'
import * as SunCalc from 'suncalc'
import { useTimeStore } from '../context/TimeStore'
import Duration from '../models/duration'
import { AirportSearchFragment, TafFragment } from '../queries/generated/graphql'
import { Tag } from './Tag'
import Toggle from './Toggle'
import ForecastTimeline from './taf/ForecastTimeline'

export interface ForecastElementsProps {
	taf?: TafFragment
	airport: AirportSearchFragment
	isNight: boolean
}

const ForecastElements: Component<ForecastElementsProps> = props => {
	const now = useTimeStore()

	const issueTime = () => new Date(props.taf?.issueTime ?? 0)
	const issueTimeDuration = (): Duration => Duration.fromDates(issueTime(), now())

	const validFrom = createMemo(() => new Date(props.taf?.validFromTime ?? 0))
	const validTo = createMemo(() => new Date(props.taf?.validToTime ?? 0))

	const isValid = () =>
		props.taf && validFrom().getTime() <= now().getTime() && validTo().getTime() >= now().getTime()

	const validSince = createMemo(() => Duration.fromDates(validFrom(), now()))
	const validUntil = createMemo(() => Duration.fromDates(validTo(), now()))

	const [isLocalTime, setIsLocalTime] = createSignal(false)
	const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
	const timeZoneIsSameAsAirport = createMemo(() => {
		if (!props.taf || !props.airport.timezone) {
			return true
		}

		const issued = new Date(props.taf.issueTime)
		const airportZone = props.airport.timezone ?? browserTimezone

		return (
			issued.toLocaleString('en-US', { timeZone: browserTimezone }) ===
			issued.toLocaleString('en-US', { timeZone: airportZone })
		)
	})

	const activeTimelineTimezone = createMemo(() =>
		isLocalTime() ? (props.airport.timezone ?? browserTimezone) : browserTimezone
	)
	const timezoneLabel = createMemo(() => (isLocalTime() ? 'Airport local' : 'My time'))

	const solarEvents = createMemo(() => {
		if (!props.taf || !props.airport.latitude || !props.airport.longitude) {
			return []
		}
		const start = new Date(props.taf.validFromTime)
		const end = new Date(props.taf.validToTime)
		const events: { time: Date; type: 'sunrise' | 'sunset' }[] = []
		const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()))
		while (cursor.getTime() <= end.getTime() + 24 * 3600 * 1000) {
			const times = SunCalc.getTimes(cursor, props.airport.latitude, props.airport.longitude)
			const sunrise = times.sunrise
			const sunset = times.sunset
			if (sunrise && sunrise.getTime() >= start.getTime() && sunrise.getTime() <= end.getTime()) {
				events.push({ time: sunrise, type: 'sunrise' })
			}
			if (sunset && sunset.getTime() >= start.getTime() && sunset.getTime() <= end.getTime()) {
				events.push({ time: sunset, type: 'sunset' })
			}
			cursor.setUTCDate(cursor.getUTCDate() + 1)
		}
		return events.sort((a, b) => a.time.getTime() - b.time.getTime())
	})

	return (
		<section class="dark:text-white-dark flex w-full flex-col">
			<h3 class="font-semibold text-slate-900 dark:text-white">Current forecast</h3>
			<Show when={props.taf} fallback={<span class="mx-auto py-16 text-xl">No forecast available.</span>}>
				<>
					<div class="flex w-full flex-row flex-wrap justify-between gap-2 pt-2">
						<div class="flex flex-wrap gap-2">
							<Tag
								tooltip={issueTime().toLocaleTimeString([], {
									hour: 'numeric',
									minute: '2-digit',
									day: 'numeric',
									month: 'long',
									year: 'numeric',
									timeZone: activeTimelineTimezone(),
								})}>
								Issued {issueTimeDuration().humanImprecise()}
							</Tag>
							<Tag
								intent={isValid() ? 'successful' : 'warning'}
								tooltip={`Valid from ${validFrom().toLocaleDateString([], {
									hour: 'numeric',
									minute: '2-digit',
									timeZone: activeTimelineTimezone(),
								})} to ${validTo().toLocaleDateString([], {
									hour: 'numeric',
									minute: '2-digit',
									timeZone: activeTimelineTimezone(),
								})}`}>
								<Switch>
									<Match when={validSince().isFuture()}>
										Valid in {validSince().humanImprecise(false)}
									</Match>
									<Match when={validUntil().isFuture()}>
										Valid for {validUntil().humanPrecise(true, false)}
									</Match>
									<Match when={validUntil().isPast()}>
										Expired {validUntil().humanPrecise(true)}
									</Match>
								</Switch>
							</Tag>
						</div>
						<Show when={!timeZoneIsSameAsAirport()}>
							<Toggle
								checked={isLocalTime()}
								onChange={value => setIsLocalTime(value)}
								label="Timezone setting"
								offLabel="My time"
								onLabel="Local time"
							/>
						</Show>
					</div>
					<ForecastTimeline
						taf={props.taf!}
						timezone={activeTimelineTimezone()}
						timezoneLabel={timezoneLabel()}
						now={now}
						solarEvents={solarEvents()}
					/>
					<p aria-label="TAF" class="dark:text-white-dark mx-auto w-full py-16 text-center font-mono text-xl">
						{props.taf!.rawText}
					</p>
				</>
			</Show>
		</section>
	)
}

export default ForecastElements
