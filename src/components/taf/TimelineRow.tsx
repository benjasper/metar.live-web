import { Component, For, Show, createMemo } from 'solid-js'
import { indicatorPalette } from './indicatorPalette'
import { TimelineRowDefinition, TimelineSegment, describeIndicator, isInstantWithinForecast } from './timelineUtils'

interface TimelineRowProps {
	row: TimelineRowDefinition
	validFrom: Date
	validTo: Date
	activeTime: Date
	timezone: string
	onHoverTime?: (instant: Date) => void
	compact?: boolean
}

export const TIMELINE_LABEL_WIDTH = 110
export const TIMELINE_COLUMN_GAP = 16

const MIN_SEGMENT_WIDTH = 0.75
const LANE_PADDING_PX = 4
const LANE_GAP_PX = 4
const BASE_ROW_HEIGHT = 44

interface SegmentLaneEntry {
	segment: TimelineSegment
	lane: number
}

interface SegmentLaneLayout {
	laneCount: number
	entries: SegmentLaneEntry[]
}

const assignSegmentLanes = (segments: TimelineSegment[]): SegmentLaneLayout => {
	if (segments.length === 0) {
		return { laneCount: 1, entries: [] }
	}

	const sorted = [...segments].sort((a, b) => {
		const delta = a.from.getTime() - b.from.getTime()
		if (delta !== 0) {
			return delta
		}
		return a.to.getTime() - b.to.getTime()
	})

	const laneEndTimes: number[] = []
	const laneAssignments = new Map<string, number>()

	sorted.forEach(segment => {
		const start = segment.from.getTime()
		const end = segment.to.getTime()
		let laneIndex = laneEndTimes.findIndex(available => start >= available)
		if (laneIndex === -1) {
			laneIndex = laneEndTimes.length
			laneEndTimes.push(end)
		} else {
			laneEndTimes[laneIndex] = Math.max(laneEndTimes[laneIndex], end)
		}
		laneAssignments.set(segment.id, laneIndex)
	})

	return {
		laneCount: Math.max(1, laneEndTimes.length),
		entries: segments.map(segment => ({
			segment,
			lane: laneAssignments.get(segment.id) ?? 0,
		})),
	}
}

const getPosition = (segment: TimelineSegment, from: Date, to: Date) => {
	const total = Math.max(to.getTime() - from.getTime(), 1)
	if (segment.to.getTime() <= from.getTime() || segment.from.getTime() >= to.getTime()) {
		return { width: 0, left: 0 }
	}
	const clampedStart = Math.max(segment.from.getTime(), from.getTime())
	const clampedEnd = Math.min(segment.to.getTime(), to.getTime())
	const rawWidth = ((Math.max(clampedEnd, clampedStart + 1) - clampedStart) / total) * 100
	const width = Math.min(100, Math.max(rawWidth, MIN_SEGMENT_WIDTH))
	const left = ((clampedStart - from.getTime()) / total) * 100
	return {
		width,
		left,
	}
}

const formatRange = (segment: TimelineSegment, timezone: string) => {
	const formatter: Intl.DateTimeFormatOptions = {
		weekday: 'short',
		day: '2-digit',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit',
		timeZone: timezone,
	}
	return `${segment.from.toLocaleString([], formatter)} → ${segment.to.toLocaleString([], formatter)}`
}

const TimelineRow: Component<TimelineRowProps> = props => {
	const layout = createMemo(() => assignSegmentLanes(props.row.segments))
	const baseHeight = () => BASE_ROW_HEIGHT
	const laneHeight = () => Math.max(0, baseHeight() - LANE_PADDING_PX * 2)
	const laneOffset = (laneIndex: number) => {
		const reverseIndex = layout().laneCount - 1 - laneIndex
		return LANE_PADDING_PX + reverseIndex * (laneHeight() + LANE_GAP_PX)
	}
	const containerHeight = createMemo(() => {
		const lanes = layout().laneCount
		const gaps = Math.max(0, lanes - 1) * LANE_GAP_PX
		return LANE_PADDING_PX * 2 + laneHeight() * lanes + gaps
	})
	const styles = () => indicatorPalette[props.row.key]
	const midpoint = (segment: TimelineSegment) =>
		new Date(segment.from.getTime() + (segment.to.getTime() - segment.from.getTime()) / 2)

	const handlePointerEnter = (segment: TimelineSegment) => {
		props.onHoverTime?.(midpoint(segment))
	}

	return (
		<div
			class="relative w-full"
			classList={{
				'grid items-center': !props.compact,
			}}
			style={
				props.compact
					? undefined
					: {
							'grid-template-columns': `${TIMELINE_LABEL_WIDTH}px 1fr`,
							'column-gap': `${TIMELINE_COLUMN_GAP}px`,
						}
			}>
			<Show when={!props.compact}>
				<div
					class="flex items-center justify-end pr-2 text-right text-[0.62rem] font-semibold tracking-[0.25em] text-slate-700 uppercase dark:text-slate-400"
					style={{ height: `${containerHeight()}px` }}>
					{props.row.title}
				</div>
			</Show>
			<div
				class="relative rounded-xl border border-dashed border-slate-300/70 bg-transparent shadow-none dark:border-slate-700/70 dark:bg-slate-950/40 dark:shadow-inner"
				style={{ height: `${containerHeight()}px` }}>
				<For each={layout().entries}>
					{entry => {
						const segment = entry.segment
						const { width, left } = getPosition(segment, props.validFrom, props.validTo)
						const isActive = () =>
							width > 0 ? isInstantWithinForecast(props.activeTime, segment, props.validTo) : false
						const indicator = describeIndicator(segment.forecast)
						return (
							<Show when={width > 0}>
								<div
									class={`absolute flex items-center overflow-hidden rounded-lg border px-2 text-[0.7rem] font-semibold ${
										styles().background
									} ${styles().border} ${styles().text}`}
									classList={{
										'ring-2 ring-offset-2 ring-slate-900/35 ring-offset-slate-100 dark:ring-white/40 dark:ring-offset-slate-900':
											isActive(),
									}}
									style={{
										left: `${left}%`,
										width: `${Math.max(width, 0.5)}%`,
										top: `${laneOffset(entry.lane)}px`,
										height: `${laneHeight()}px`,
										'z-index': `${entry.lane + 1}`,
									}}
									title={`${indicator} · ${formatRange(segment, props.timezone)}`}
									onPointerEnter={() => handlePointerEnter(segment)}>
									<span class="truncate">{indicator}</span>
								</div>
							</Show>
						)
					}}
				</For>
			</div>
		</div>
	)
}

export default TimelineRow
