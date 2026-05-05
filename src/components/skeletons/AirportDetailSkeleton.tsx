import { Component } from 'solid-js'

const placeholder = 'animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-700/70'
const placeholderSoft = 'animate-pulse rounded-full bg-slate-100/80 dark:bg-slate-800/80'
const tileWrapper =
	'group dark:text-white-light relative flex h-auto min-h-[10.5rem] w-full flex-1 basis-full flex-col justify-center gap-3 rounded-3xl border border-slate-300/60 bg-slate-50/85 px-6 py-5 text-slate-900 transition-colors duration-200 md:mx-0 md:min-w-[220px] md:flex-[1_1_220px] md:basis-[calc(50%-1.5rem)] lg:basis-[calc(33%-1.5rem)] dark:border-white/10 dark:bg-slate-900/70'

const SkeletonTile: Component<{ extraClass?: string }> = props => (
	<div class={`${tileWrapper} ${props.extraClass ?? ''}`}>
		<div class={`mx-auto h-3 w-20 ${placeholderSoft}`} />
		<div class={`mx-auto h-7 w-24 ${placeholder}`} />
		<div class={`mx-auto h-4 w-16 ${placeholderSoft}`} />
	</div>
)

export const AirportHeaderSkeleton: Component = () => (
	<div class="mx-auto flex flex-col items-center py-16 text-center">
		<div class={`h-10 w-64 ${placeholder}`} />
		<div class={`mt-3 h-6 w-80 max-w-[80vw] ${placeholderSoft}`} />
		<div class="flex max-w-lg flex-wrap justify-center gap-2 pt-4">
			<div class={`h-8 w-40 ${placeholderSoft}`} />
			<div class={`h-8 w-32 ${placeholderSoft}`} />
			<div class={`h-8 w-28 ${placeholderSoft}`} />
			<div class={`h-8 w-36 ${placeholderSoft}`} />
			<div class={`h-8 w-32 ${placeholderSoft}`} />
		</div>
	</div>
)

export const WeatherElementsSkeleton: Component = () => (
	<>
		<div class="flex flex-col justify-between md:flex-row">
			<div class="flex flex-col">
				<div class={`h-8 w-48 ${placeholder}`} />
				<div class="flex flex-row flex-wrap justify-start gap-2 pt-2">
					<div class={`h-7 w-36 ${placeholderSoft}`} />
					<div class={`h-7 w-32 ${placeholderSoft}`} />
					<div class={`h-7 w-44 ${placeholderSoft}`} />
				</div>
			</div>
			<div class={`mt-4 h-6 w-56 md:mt-auto ${placeholderSoft}`} />
		</div>
		<div class="mt-4 flex flex-col justify-center gap-6 md:flex-row md:flex-wrap md:items-stretch">
			<div class="flex shrink-0 flex-col">
				<div
					class={`${tileWrapper} md:flex-[1_1_520px] md:basis-[calc(100%-1.5rem)] lg:flex-[1_1_560px] lg:basis-[calc(66%-1.5rem)]`}>
					<div class={`mx-auto h-3 w-16 ${placeholderSoft}`} />
					<div class="relative mx-auto flex aspect-square w-full items-center justify-center rounded-[2.5rem] bg-slate-100/30 md:mx-0 dark:bg-transparent">
						<div class={`h-[274px] w-[274px] rounded-full ${placeholderSoft}`} />
					</div>
					<div class={`mx-auto h-6 w-40 ${placeholder}`} />
					<div class={`mx-auto h-4 w-56 ${placeholderSoft}`} />
				</div>
			</div>
			<div class="flex flex-row flex-wrap justify-center gap-6 md:flex-1 md:items-stretch md:justify-start">
				<SkeletonTile />
				<SkeletonTile />
				<SkeletonTile />
				<SkeletonTile />
				<SkeletonTile />
				<SkeletonTile />
			</div>
		</div>
		<div class="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs">
			<div class={`h-4 w-32 ${placeholderSoft}`} />
			<div class={`h-4 w-32 ${placeholderSoft}`} />
			<div class={`h-4 w-20 ${placeholderSoft}`} />
			<div class={`h-4 w-24 ${placeholderSoft}`} />
		</div>
		<div class="flex flex-col gap-4 py-16">
			<div class={`mx-auto h-7 w-3/4 max-w-2xl ${placeholderSoft}`} />
		</div>
	</>
)

export const ForecastElementsSkeleton: Component = () => (
	<section class="flex w-full flex-col">
		<div class={`h-8 w-52 ${placeholder}`} />
		<div class="flex w-full flex-row flex-wrap justify-between gap-2 pt-2">
			<div class="flex flex-wrap gap-2">
				<div class={`h-7 w-36 ${placeholderSoft}`} />
				<div class={`h-7 w-40 ${placeholderSoft}`} />
			</div>
		</div>
		<div class="mt-6 flex w-full flex-col gap-3">
			<div class="flex w-full flex-col gap-2 rounded-xl border border-dashed border-slate-300/70 p-3 dark:border-slate-700/70">
				<div class={`h-9 w-full rounded-md ${placeholderSoft}`} />
				<div class={`h-9 w-[88%] rounded-md ${placeholderSoft}`} />
				<div class={`h-9 w-[72%] rounded-md ${placeholderSoft}`} />
				<div class={`h-9 w-[60%] rounded-md ${placeholderSoft}`} />
			</div>
			<div class="flex w-full justify-between px-1">
				<div class={`h-3 w-10 ${placeholderSoft}`} />
				<div class={`h-3 w-10 ${placeholderSoft}`} />
				<div class={`h-3 w-10 ${placeholderSoft}`} />
				<div class={`h-3 w-10 ${placeholderSoft}`} />
				<div class={`h-3 w-10 ${placeholderSoft}`} />
			</div>
		</div>
		<div class={`mx-auto my-16 h-7 w-3/4 max-w-2xl ${placeholderSoft}`} />
	</section>
)

const VicinityCardSkeleton: Component = () => (
	<div class="flex h-full w-60 shrink-0 animate-pulse flex-col gap-3 rounded-3xl border border-slate-300/60 bg-slate-50/85 px-5 py-5 text-left transition-colors duration-200 md:mx-0 dark:border-white/10 dark:bg-slate-900/70">
		<div class="flex flex-col gap-2">
			<div class="h-6 w-32 rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
			<div class="h-4 w-44 rounded-full bg-slate-100/80 dark:bg-slate-800/80" />
			<div class="mt-3 flex flex-row gap-2">
				<div class="h-7 w-20 rounded-full bg-slate-100/80 dark:bg-slate-800/80" />
				<div class="h-7 w-16 rounded-full bg-slate-100/80 dark:bg-slate-800/80" />
			</div>
		</div>
		<div class="mx-auto my-2 h-10 w-10 rounded-full bg-slate-100/80 dark:bg-slate-800/80" />
		<div class="mx-auto h-4 w-28 rounded-full bg-slate-100/80 dark:bg-slate-800/80" />
	</div>
)

export const AirportsInVicinitySkeleton: Component = () => (
	<section class="flex flex-col">
		<div class={`h-8 w-44 ${placeholder}`} />
		<div class="flex gap-2 pt-2">
			<div class={`h-7 w-52 ${placeholderSoft}`} />
		</div>
		<div class="mt-4 flex gap-4 overflow-hidden">
			<VicinityCardSkeleton />
			<VicinityCardSkeleton />
			<VicinityCardSkeleton />
			<VicinityCardSkeleton />
		</div>
	</section>
)

const AirportDetailSkeleton: Component = () => (
	<>
		<AirportHeaderSkeleton />
		<WeatherElementsSkeleton />
		<ForecastElementsSkeleton />
		<AirportsInVicinitySkeleton />
	</>
)

export default AirportDetailSkeleton
