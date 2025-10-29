import { A } from '@solidjs/router'
import { FiAlertTriangle } from 'solid-icons/fi'
import { Component, Show, createMemo } from 'solid-js'
import { useTimeStore } from '../context/TimeStore'
import Duration from '../models/duration'
import { useStatusStore } from '../context/StatusStore'

const TEN_MINUTES_IN_MS = 10 * 60 * 1000

const StatusBanner: Component = () => {
	const [lastWeatherSync] = useStatusStore()
	const now = useTimeStore()

	const lastSync = createMemo(() => {
		const syncValue = lastWeatherSync()
		if (!syncValue) {
			return null
		}

		const parsedDate = new Date(syncValue)
		return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
	})

	const isStale = createMemo(() => {
		const last = lastSync()
		if (!last) {
			return false
		}

		return now().getTime() - last.getTime() >= TEN_MINUTES_IN_MS
	})

	const lastSyncDuration = createMemo(() => {
		if (!isStale() || !lastSync()) {
			return null
		}

		return Duration.fromDates(lastSync()!, now())
	})

	return (
		<Show when={isStale()}>
			<div
				role="alert"
				class="mb-6 rounded-xl border border-amber-300/60 bg-linear-to-r from-amber-100/80 to-orange-100/80 text-amber-950 shadow-lg shadow-amber-200/50 transition-all dark:border-amber-400/40 dark:from-amber-500/15 dark:via-amber-600/10 dark:to-amber-500/15 dark:text-amber-100 dark:shadow-amber-900/20">
				<div class="flex flex-col gap-3 rounded-xl border border-transparent px-5 py-4 md:flex-row md:items-center md:gap-4">
					<div class="self-start rounded-full bg-amber-200/60 p-2 text-amber-700 transition-colors md:self-center dark:bg-amber-500/25 dark:text-amber-200">
						<FiAlertTriangle size={22} />
					</div>
					<div class="flex flex-col gap-1">
						<p class="text-sm font-semibold tracking-[0.08em] text-amber-800 uppercase dark:text-amber-200">
							Service disruption
						</p>
						<p class="text-base font-medium text-amber-900 dark:text-amber-100">
							It looks like our weather provider is having trouble right now. The data you're seeing may
							be out of date
							<Show when={lastSyncDuration()}>
								{duration => <> (last update {duration().humanImprecise()})</>}
							</Show>
							.
						</p>
						<p class="text-sm text-amber-800 underline-offset-4 transition-colors hover:underline dark:text-amber-200">
							<A
								href="https://status.metar.live"
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center gap-1 font-medium">
								Check provider status
							</A>
						</p>
					</div>
				</div>
			</div>
		</Show>
	)
}

export default StatusBanner
