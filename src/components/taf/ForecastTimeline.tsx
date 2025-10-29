import {
	Component,
	For,
	Show,
	createEffect,
	createMemo,
	createSignal,
	onCleanup,
	onMount,
	untrack,
	type JSX,
} from 'solid-js'
import { TbSunrise, TbSunset } from 'solid-icons/tb'
import { TafFragment } from '../../queries/generated/graphql'
import TimelineHoverSummary from './TimelineHoverSummary'
import TimelineRow, { TIMELINE_COLUMN_GAP, TIMELINE_LABEL_WIDTH } from './TimelineRow'
import {
	EffectiveConditions,
	TimelineRowDefinition,
	buildTimelineRows,
	clampDate,
	resolveEffectiveForecast,
	sortForecasts,
} from './timelineUtils'

interface ForecastTimelineProps {
	taf: TafFragment
	timezone: string
	timezoneLabel: string
	now: () => Date
	solarEvents: SolarEvent[]
}

interface TimelineTick {
	position: number
	label: string
	secondary?: string
}

interface SolarEvent {
	time: Date
	type: 'sunrise' | 'sunset'
}

const generateTicks = (from: Date, to: Date, timezone: string): TimelineTick[] => {
	const total = Math.max(to.getTime() - from.getTime(), 1)
	const totalHours = total / 3_600_000
	const segments = Math.min(6, Math.max(3, Math.round(totalHours / 4)))
	const ticks: TimelineTick[] = []
	let previousDayKey: string | undefined
	for (let i = 0; i <= segments; i++) {
		const ratio = i / segments
		const instant = new Date(from.getTime() + total * ratio)
		const label = instant.toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
			timeZone: timezone,
		})
		const dayKey = instant.toLocaleDateString('en-CA', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			timeZone: timezone,
		})
		const needsDay = previousDayKey === undefined || dayKey !== previousDayKey
		const secondary = needsDay
			? instant.toLocaleDateString([], {
					month: 'short',
					day: '2-digit',
				})
			: undefined
		previousDayKey = dayKey
		ticks.push({ position: ratio, label, secondary })
	}
	return ticks
}

const TRACK_OFFSET_PX = TIMELINE_LABEL_WIDTH + TIMELINE_COLUMN_GAP
const MOBILE_PIXELS_PER_HOUR = 56

const ForecastTimeline: Component<ForecastTimelineProps> = props => {
	let trackRef: HTMLDivElement | undefined
	let scrollContainerRef: HTMLDivElement | undefined
	let isProgrammaticScroll = false
	let programmaticScrollReset: number | undefined
	let scrollIdleTimeout: number | undefined
	const validFrom = createMemo(() => new Date(props.taf.validFromTime))
	const validTo = createMemo(() => new Date(props.taf.validToTime))
	const sortedForecasts = createMemo(() => sortForecasts(props.taf.forecast ?? []))
	const rows = createMemo<TimelineRowDefinition[]>(() => buildTimelineRows(sortedForecasts(), validFrom(), validTo()))
	const ticks = createMemo(() => generateTicks(validFrom(), validTo(), props.timezone))
	const duration = () => Math.max(validTo().getTime() - validFrom().getTime(), 1)
	const [isUserInteracting, setIsUserInteracting] = createSignal(false)
	const [pointerTime, setPointerTime] = createSignal<Date>(
		untrack(() => clampDate(props.now(), validFrom(), validTo()))
	)
	const [shouldFollowLive, setShouldFollowLive] = createSignal(true)
	const [isCompact, setIsCompact] = createSignal(false)
	const [trackRectWidth, setTrackRectWidth] = createSignal(0)
	const [viewportWidth, setViewportWidth] = createSignal(0)
	const trackOffset = () => (isCompact() ? 0 : TRACK_OFFSET_PX)
	const trackWidth = () => Math.max(trackRectWidth() - trackOffset(), 1)
	const mobileTrackWidth = () => {
		const hours = duration() / 3_600_000
		const effectiveViewport = viewportWidth() || 360
		return Math.max(hours * MOBILE_PIXELS_PER_HOUR, effectiveViewport)
	}
	const mobileSidePadding = () => (isCompact() ? Math.max(viewportWidth() / 2, 0) : 0)

	const scrollTimelineToRatio = (ratio: number, behavior: ScrollBehavior = 'auto') => {
		if (!isCompact() || !scrollContainerRef || !trackRef) {
			return
		}
		const totalWidth = trackRef.getBoundingClientRect().width
		if (totalWidth <= 0) {
			return
		}
		const viewport = scrollContainerRef.clientWidth
		const padding = mobileSidePadding()
		const targetCenter = padding + totalWidth * Math.min(Math.max(ratio, 0), 1)
		const scrollable = Math.max(totalWidth + padding * 2 - viewport, 0)
		const targetLeft = Math.min(Math.max(targetCenter - viewport / 2, 0), scrollable)
		isProgrammaticScroll = true
		scrollContainerRef.scrollTo({ left: targetLeft, behavior })
		if (typeof window !== 'undefined') {
			if (programmaticScrollReset) {
				window.clearTimeout(programmaticScrollReset)
			}
			const timeout = behavior === 'smooth' ? 400 : 0
			programmaticScrollReset = window.setTimeout(() => {
				isProgrammaticScroll = false
				programmaticScrollReset = undefined
			}, timeout)
		}
	}

	const applyTime = (time: Date) => {
		const clamped = clampDate(time, validFrom(), validTo())
		setPointerTime(clamped)
	}

	const focusTime = createMemo(() => pointerTime())
	const isPinned = false

	const focusRatio = createMemo(() => {
		const ratio = (focusTime().getTime() - validFrom().getTime()) / duration()
		return Math.min(Math.max(ratio, 0), 1)
	})
	const indicatorStyle = createMemo<JSX.CSSProperties>(() => {
		if (isCompact()) {
			return {
				left: '50%',
				transform: 'translateX(-50%)',
			}
		}
		return {
			left: `${trackOffset() + trackWidth() * focusRatio()}px`,
		}
	})

	const axisStyle = createMemo<JSX.CSSProperties>(() => {
		const width = trackWidth()
		return {
			'margin-left': `${trackOffset()}px`,
			width: width > 0 ? `${width}px` : undefined,
		}
	})
	const timelineContainerStyle = createMemo<JSX.CSSProperties>(() => (isCompact() ? {} : { width: '100%' }))
	const timelineFullBleedStyle = createMemo<JSX.CSSProperties>(() => {
		if (!isCompact()) {
			return {}
		}
		return {
			width: '100vw',
			'margin-left': 'calc(50% - 50vw)',
			'margin-right': 'calc(50% - 50vw)',
		}
	})

	const currentTime = createMemo(() => props.now())
	const isCurrentWithinTimeline = createMemo(() => {
		const now = currentTime().getTime()
		return now >= validFrom().getTime() && now <= validTo().getTime()
	})
	const currentRatio = createMemo(() => {
		if (!isCurrentWithinTimeline()) {
			return 0
		}
		const ratio = (currentTime().getTime() - validFrom().getTime()) / duration()
		return Math.min(Math.max(ratio, 0), 1)
	})
	const currentIndicatorStyle = createMemo<JSX.CSSProperties>(() => {
		if (!isCurrentWithinTimeline()) {
			return {}
		}
		return {
			left: `${currentRatio() * 100}%`,
			transform: 'translateX(-50%)',
			top: '-1.8rem',
		}
	})

	const effectiveConditions = createMemo<EffectiveConditions | null>(() =>
		resolveEffectiveForecast(sortedForecasts(), focusTime())
	)

	let initialScrollSynced = false

	createEffect(() => {
		if (shouldFollowLive()) {
			applyTime(props.now())
		}
	})

	createEffect(() => {
		if (!isCompact()) {
			return
		}
		if (!shouldFollowLive()) {
			return
		}
		scrollTimelineToRatio(focusRatio(), 'smooth')
	})

	createEffect(() => {
		validFrom()
		validTo()
		initialScrollSynced = false
	})

	createEffect(() => {
		if (!isCompact() || initialScrollSynced) {
			return
		}
		if (!scrollContainerRef || !trackRef) {
			return
		}
		scrollTimelineToRatio(focusRatio(), 'auto')
		initialScrollSynced = true
	})

	createEffect(() => {
		if (!isCompact()) {
			initialScrollSynced = false
		}
	})

	const solarMarkers = createMemo(() =>
		props.solarEvents
			.map(event => {
				const ratio = (event.time.getTime() - validFrom().getTime()) / duration()
				return {
					...event,
					ratio: Math.min(Math.max(ratio, 0), 1),
				}
			})
			.filter(marker => marker.ratio >= 0 && marker.ratio <= 1)
			.sort((a, b) => a.time.getTime() - b.time.getTime())
	)

	onMount(() => {
		const updateTrackWidth = () => {
			if (!trackRef) {
				return
			}
			setTrackRectWidth(trackRef.getBoundingClientRect().width)
		}
		const updateViewportWidth = () => {
			if (!scrollContainerRef) {
				return
			}
			setViewportWidth(scrollContainerRef.getBoundingClientRect().width)
		}
		const trackObserver = new ResizeObserver(updateTrackWidth)
		const viewportObserver = new ResizeObserver(updateViewportWidth)
		if (trackRef) {
			updateTrackWidth()
			trackObserver.observe(trackRef)
		}
		if (scrollContainerRef) {
			updateViewportWidth()
			viewportObserver.observe(scrollContainerRef)
		}
		let media: MediaQueryList | undefined
		const handleMediaChange = (event?: MediaQueryListEvent) => {
			if (event) {
				setIsCompact(event.matches)
			} else if (media) {
				setIsCompact(media.matches)
			}
		}
		if (typeof window !== 'undefined' && window.matchMedia) {
			media = window.matchMedia('(max-width: 768px)')
			handleMediaChange()
			media.addEventListener('change', handleMediaChange)
		}
		onCleanup(() => {
			trackObserver.disconnect()
			viewportObserver.disconnect()
			media?.removeEventListener('change', handleMediaChange)
		})
	})

	const updateFromPointer = (event: PointerEvent) => {
		if (!trackRef || isCompact()) {
			return
		}
		const rect = trackRef.getBoundingClientRect()
		const pointerX = event.clientX - rect.left - trackOffset()
		const ratio = pointerX / trackWidth()
		if (Number.isNaN(ratio)) {
			return
		}
		const clampedRatio = Math.min(Math.max(ratio, 0), 1)
		const nextTime = new Date(validFrom().getTime() + duration() * clampedRatio)
		applyTime(nextTime)
	}

	const onPointerEnter = (event: PointerEvent) => {
		if (isCompact()) {
			return
		}
		setIsUserInteracting(true)
		setShouldFollowLive(false)
		updateFromPointer(event)
	}

	const onPointerMove = (event: PointerEvent) => {
		if (isCompact()) {
			return
		}
		if (!isUserInteracting()) {
			setIsUserInteracting(true)
		}
		setShouldFollowLive(false)
		updateFromPointer(event)
	}

	const onPointerLeave = () => {
		setIsUserInteracting(false)
	}

	const handleTimelineScroll = () => {
		if (!isCompact() || !scrollContainerRef || !trackRef || isProgrammaticScroll) {
			return
		}
		setShouldFollowLive(false)
		const totalWidth = trackRef.getBoundingClientRect().width
		if (totalWidth <= 0) {
			return
		}
		setIsUserInteracting(true)
		const viewport = scrollContainerRef.clientWidth
		const padding = mobileSidePadding()
		const center = scrollContainerRef.scrollLeft + viewport / 2
		const normalized = Math.min(Math.max(center - padding, 0), totalWidth)
		const ratio = totalWidth > 0 ? normalized / totalWidth : 0
		const nextTime = new Date(validFrom().getTime() + duration() * ratio)
		applyTime(nextTime)
		if (typeof window !== 'undefined') {
			if (scrollIdleTimeout) {
				window.clearTimeout(scrollIdleTimeout)
			}
			scrollIdleTimeout = window.setTimeout(() => {
				setIsUserInteracting(false)
				scrollIdleTimeout = undefined
			}, 250)
		}
	}

	const handleSegmentHover = (instant: Date) => {
		setIsUserInteracting(true)
		setShouldFollowLive(false)
		applyTime(instant)
	}

	const handleFollowLive = () => {
		setShouldFollowLive(true)
		applyTime(props.now())
	}

	onCleanup(() => {
		if (typeof window !== 'undefined') {
			if (programmaticScrollReset) {
				window.clearTimeout(programmaticScrollReset)
			}
			if (scrollIdleTimeout) {
				window.clearTimeout(scrollIdleTimeout)
			}
		}
	})

	const solarIcon = (type: SolarEvent['type']) => (type === 'sunrise' ? <TbSunrise /> : <TbSunset />)

	const formatSolarTime = (time: Date) =>
		time.toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
			timeZone: props.timezone,
		})

	return (
		<div
			class="mt-6 flex w-full flex-col gap-4"
			classList={{ 'flex-col-reverse': isCompact() }}
			style={timelineContainerStyle()}>
			<TimelineHoverSummary
				focusTime={focusTime()}
				timezone={props.timezone}
				timezoneLabel={props.timezoneLabel}
				effective={effectiveConditions()}
				isPinned={isPinned}
				canFollowLive={!shouldFollowLive() || isPinned}
				onFollowLive={handleFollowLive}
			/>
			<Show
				when={rows().length > 0}
				fallback={
					<div class="rounded-xl border border-dashed border-slate-300/70 bg-white/70 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700/70 dark:bg-slate-900/40 dark:text-slate-400">
						No structured forecast segments were returned with this TAF.
					</div>
				}>
				<div class="relative" style={timelineFullBleedStyle()}>
					<div
						class="pointer-events-none absolute inset-y-0 z-20 w-px rounded-full"
						classList={{
							'bg-slate-400/80 dark:bg-slate-200/60': !isPinned,
							'bg-slate-900 dark:bg-white': isPinned,
						}}
						style={indicatorStyle()}
					/>
					<div
						ref={el => (scrollContainerRef = el)}
						class="relative"
						classList={{
							'overflow-x-auto touch-pan-x': isCompact(),
						}}
						onScroll={handleTimelineScroll}>
						<div
							class="flex"
							style={{
								width: isCompact() ? `${mobileTrackWidth() + mobileSidePadding() * 2}px` : '100%',
							}}>
							<Show when={isCompact()}>
								<div
									class="flex-none"
									style={{
										width: `${mobileSidePadding()}px`,
									}}
								/>
							</Show>
							<div
								ref={el => (trackRef = el)}
								class="relative flex flex-col gap-4"
								classList={{
									'cursor-crosshair': !isCompact(),
									'flex-none': isCompact(),
								}}
								style={{
									width: isCompact() ? `${mobileTrackWidth()}px` : '100%',
								}}
								onPointerMove={onPointerMove}
								onPointerEnter={onPointerEnter}
								onPointerLeave={onPointerLeave}
								role="presentation">
								<Show when={solarMarkers().length > 0}>
									<div class="pointer-events-none absolute inset-x-0 bottom-12 z-10 h-6">
										<For each={solarMarkers()}>
											{marker => (
												<div
													class="absolute flex -translate-x-1/2 flex-col items-center text-[0.55rem] font-semibold text-amber-600 dark:text-amber-300"
													style={{ left: `${trackOffset() + trackWidth() * marker.ratio}px` }}
													title={`${
														marker.type === 'sunrise' ? 'Sunrise' : 'Sunset'
													} · ${formatSolarTime(marker.time)}`}>
													<span class="text-base leading-none">{solarIcon(marker.type)}</span>
												</div>
											)}
										</For>
									</div>
								</Show>
								<For each={rows()}>
									{row => (
										<TimelineRow
											row={row}
											validFrom={validFrom()}
											validTo={validTo()}
											activeTime={focusTime()}
											timezone={props.timezone}
											onHoverTime={handleSegmentHover}
											compact={isCompact()}
										/>
									)}
								</For>
								<div class="relative mt-5 border-t border-slate-500 pt-4 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
									<div class="relative h-8" style={axisStyle()}>
										<Show when={isCurrentWithinTimeline()}>
											<div
												class="pointer-events-none absolute top-0 z-20 h-0 w-0 border-x-4 border-t-6 border-x-transparent border-t-black dark:border-t-white"
												style={currentIndicatorStyle()}
											/>
										</Show>
										<For each={ticks()}>
											{tick => {
												const alignment =
													tick.position === 0
														? 'start'
														: tick.position === 1
															? 'end'
															: 'middle'
												return (
													<div
														class="absolute flex flex-col text-[0.7rem] font-medium"
														style={{
															left:
																alignment === 'end'
																	? undefined
																	: `${tick.position * 100}%`,
															right: alignment === 'end' ? '0' : undefined,
															transform:
																alignment === 'middle'
																	? 'translateX(-50%)'
																	: alignment === 'end'
																		? 'translateX(0)'
																		: 'translateX(0)',
														}}>
														<span>{tick.label}</span>
														<Show when={tick.secondary}>
															<span class="text-[0.6rem] font-normal text-slate-400 dark:text-slate-500">
																{tick.secondary}
															</span>
														</Show>
													</div>
												)
											}}
										</For>
									</div>
								</div>
							</div>
							<Show when={isCompact()}>
								<div
									class="flex-none"
									style={{
										width: `${mobileSidePadding()}px`,
									}}
								/>
							</Show>
						</div>
					</div>
				</div>
			</Show>
		</div>
	)
}

export default ForecastTimeline
