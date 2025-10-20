import { Component, Show, createMemo, createSignal } from 'solid-js'
import { useTimeStore } from '../context/TimeStore'
import { useUnitStore } from '../context/UnitStore'
import Duration from '../models/duration'
import { AirportSearchFragment, TafFragment } from '../queries/generated/graphql'
import { Tag } from './Tag'
import Toggle from './Toggle'
import ForecastTimeline from './forecast/ForecastTimeline'
import { ForecastUnitSelection } from './forecast/formatters'

export interface ForecastElementsProps {
	taf?: TafFragment
	airport: AirportSearchFragment
	isNight: boolean
}

const isValidDate = (date: Date) => !Number.isNaN(date.getTime())

const ForecastElements: Component<ForecastElementsProps> = props => {
	const now = useTimeStore()
	const [unitStore] = useUnitStore()
	const [isLocalTime, setIsLocalTime] = createSignal(false)
	const issueTime = () => new Date(props.taf?.issueTime ?? NaN)
	const issueTimeDuration = (): Duration => Duration.fromDates(issueTime(), now())

	const validFrom = createMemo(() => new Date(props.taf?.validFromTime ?? NaN))
	const validTo = createMemo(() => new Date(props.taf?.validToTime ?? NaN))

	const isValid = () => isValidDate(validFrom()) && isValidDate(validTo()) && validFrom().getTime() <= now().getTime() && validTo().getTime() >= now().getTime()

	const validSince = createMemo(() => Duration.fromDates(validFrom(), now()))
	const validUntil = createMemo(() => Duration.fromDates(validTo(), now()))

	const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
	const selectedTimeZone = createMemo(() => (isLocalTime() ? props.airport.timezone ?? '' : browserTimezone))

	const timeZoneIsSameAsAirport = createMemo(
		() =>
			new Date(props.taf?.issueTime ?? NaN).toLocaleString('en-US', { timeZone: browserTimezone }) ===
			new Date(props.taf?.issueTime ?? NaN).toLocaleString('en-US', { timeZone: props.airport.timezone ?? '' })
	)

	const units = createMemo<ForecastUnitSelection>(() => ({
		speed: unitStore.speed.units[unitStore.speed.selected],
		length: unitStore.length.units[unitStore.length.selected],
		height: unitStore.height.units[unitStore.height.selected],
		pressure: unitStore.pressure.units[unitStore.pressure.selected],
	}))

	const formatHourLabel = (date: Date) =>
		date.toLocaleTimeString([], {
			hour: 'numeric',
			minute: '2-digit',
			timeZone: selectedTimeZone(),
		})

	const formatDayLabel = (date: Date) =>
		date.toLocaleDateString([], {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			timeZone: selectedTimeZone(),
		})

	const formatRange = (start: Date, end: Date) => {
		const sameDay = start.toDateString() === end.toDateString()

		const startOptions: Intl.DateTimeFormatOptions = sameDay
			? { hour: 'numeric', minute: '2-digit', timeZone: selectedTimeZone() }
			: {
					weekday: 'short',
					month: 'short',
					day: 'numeric',
					hour: 'numeric',
					minute: '2-digit',
					timeZone: selectedTimeZone(),
				}

		const endOptions: Intl.DateTimeFormatOptions = sameDay
			? { hour: 'numeric', minute: '2-digit', timeZone: selectedTimeZone() }
			: { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: selectedTimeZone() }

		return `${start.toLocaleString([], startOptions)} – ${end.toLocaleString([], endOptions)}`
	}

	const hasTimelineData = createMemo(() => (props.taf?.forecast?.length ?? 0) > 0)

	const timeDisplayLabel = () => (isLocalTime() ? 'Airport local time' : 'My time')

	const validityMessage = createMemo(() => {
		if (!isValidDate(validFrom()) || !isValidDate(validTo())) {
			return 'Validity unknown'
		}

		if (validSince().isFuture()) {
			return `Valid in ${validSince().humanImprecise(false)}`
		}

		if (validUntil().isFuture()) {
			return `Valid for ${validUntil().humanPrecise(true, false)}`
		}

		if (validUntil().isPast()) {
			return `Expired ${validUntil().humanPrecise(true)}`
		}

		return 'Validity unknown'
	})

	return (
		<section class="dark:text-white-dark flex w-full flex-col">
			<h2 class="dark:text-white-dark text-2xl">Current forecast</h2>
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
									timeZone: selectedTimeZone(),
								})}>
								Issued {issueTimeDuration().humanImprecise()}
							</Tag>
							<Tag
								intent={isValid() ? 'successful' : 'warning'}
								tooltip={`Valid from ${validFrom().toLocaleDateString([], {
									hour: 'numeric',
									minute: '2-digit',
									timeZone: selectedTimeZone(),
								})} to ${validTo().toLocaleDateString([], {
									hour: 'numeric',
									minute: '2-digit',
									timeZone: selectedTimeZone(),
								})}`}>
								{validityMessage()}
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
					<div class="mt-6 flex flex-col gap-6">
						<div class="pb-2">
							<Show
								when={hasTimelineData()}
								fallback={
									<span class="dark:text-white-dark block py-6 text-center text-sm text-slate-500">
										No forecast timeline available.
									</span>
								}>
								<ForecastTimeline
									taf={props.taf}
									airport={props.airport}
									units={units()}
									now={now}
									formatHourLabel={formatHourLabel}
									formatDayLabel={formatDayLabel}
									formatRange={formatRange}
									timeDisplayLabel={timeDisplayLabel()}
								/>
							</Show>
						</div>
					</div>
					<p
						aria-label="TAF"
						class="dark:text-white-dark mx-auto mt-16 w-full py-16 text-center font-mono text-xl">
						{props.taf!.rawText}
					</p>
				</>
			</Show>
		</section>
	)
}

export default ForecastElements
