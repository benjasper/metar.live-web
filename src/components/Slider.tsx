import { TbChevronLeft } from 'solid-icons/tb'
import { Component, createEffect, createSignal, For, onMount, ParentComponent, Show, useContext } from 'solid-js'
import { Slider as SolidSlider, SliderContext, SliderProvider } from 'solid-slider'

interface DotsProps {
	items: any[]
}

const SliderNavigation: Component<DotsProps> = props => {
	const [helpers] = useContext(SliderContext)

	const [slider, setSlider] = createSignal(helpers().slider())
	onMount(() => {
		setSlider(helpers().slider())
	})

	const maxItems = () => slider()?.track.details.maxIdx ?? 0

	const sliderLength = () => {
		return slider()?.track.details.length ?? 0
	}

	return (
		<Show when={props.items.length > 1 && sliderLength() > 0}>
			<div class="relative mx-auto mt-8 flex items-center justify-center gap-3 md:gap-4">
				<button
					aria-label="Previous forecast page"
					onClick={() => helpers().prev()}
					classList={{
						'opacity-0 pointer-events-none': helpers().current() <= 0,
					}}
					role="button"
					class="hidden h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white text-slate-800 transition-all focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-hidden md:flex dark:border-white/25 dark:bg-slate-800 dark:text-white/80">
					<TbChevronLeft class="m-auto" size={20} />
				</button>

				<div class="flex items-center gap-2.5">
					<For each={Array(maxItems() + 1)}>
						{(_, index) => {
							const isActive = () => helpers().current() === index()

							return (
								<button
									role="button"
									class="h-2.5 w-2.5 rounded-full bg-slate-400 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-hidden dark:bg-white/25 dark:focus-visible:ring-sky-500/60 dark:focus-visible:ring-offset-transparent"
									aria-label={`Select forecast ${index() + 1}`}
									classList={{
										'pointer-events-none w-6 bg-slate-700 dark:bg-white/70': isActive(),
										'hover:bg-slate-400 dark:hover:bg-white/35 cursor-pointer': !isActive(),
									}}
									aria-current={isActive() ? 'true' : undefined}
									disabled={isActive()}
									onClick={() => helpers().moveTo(index())}
								/>
							)
						}}
					</For>
				</div>

				<button
					aria-label="Next page"
					onClick={() => helpers().next()}
					role="button"
					classList={{
						'opacity-0 pointer-events-none': helpers().current() >= maxItems(),
					}}
					class="hidden h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white text-slate-800 transition-all focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-hidden md:flex dark:border-white/25 dark:bg-slate-800 dark:text-white/80">
					<TbChevronLeft class="m-auto rotate-180" size={20} />
				</button>
			</div>
		</Show>
	)
}

const ReloadSliderOnChange: Component<{ value: any }> = props => {
	const [helpers] = useContext(SliderContext)

	createEffect(() => {
		if (props.value && helpers().slider()) {
			helpers().slider().update()
		}
	})

	return undefined
}

const adaptiveHeight = (slider: any) => {
	function updateHeight() {
		// Only on mobile
		if (window.innerWidth >= 768) {
			slider.container.style.height = 'auto'
			return
		}

		setTimeout(() => {
			slider.container.style.height = slider.slides[slider.track.details.rel].offsetHeight + 'px'
		}, 0)
	}
	slider.on('created', updateHeight)
	slider.on('slideChanged', updateHeight)
	slider.on('updated', updateHeight)
}

const wheelControls = (slider: any) => {
	let touchTimeout: NodeJS.Timeout
	let position = { x: 0, y: 0 }
	let wheelActive = false

	function dispatch(e: any, name: string) {
		position.x -= e.deltaX
		position.y -= e.deltaY
		slider.container.dispatchEvent(
			new CustomEvent(name, {
				detail: {
					x: position.x,
					y: position.y,
				},
			})
		)
	}

	function wheelStart(e: any) {
		position = {
			x: e.pageX,
			y: e.pageY,
		}
		dispatch(e, 'ksDragStart')
	}

	function wheel(e: any) {
		dispatch(e, 'ksDrag')
	}

	function wheelEnd(e: any) {
		dispatch(e, 'ksDragEnd')
	}

	function eventWheel(e: WheelEvent) {
		if (e.deltaX !== 0) e.preventDefault()

		if (!wheelActive) {
			wheelStart(e)
			wheelActive = true
		}
		wheel(e)
		clearTimeout(touchTimeout)
		touchTimeout = setTimeout(() => {
			wheelActive = false
			wheelEnd(e)
		}, 50)
	}

	slider.on('created', () => {
		slider.container.addEventListener('wheel', eventWheel, {
			passive: false,
		})
	})
}

interface SliderProps {
	items: any[]
	class?: string
	mobileCentered?: boolean
	adaptiveHeight?: boolean
	updateOnChange?: any
	noItemsMessage?: string
}

const Slider: ParentComponent<SliderProps> = props => {
	const plugins = [wheelControls]

	// Ignore this line, because the slider is not reactive and will not update the plugins
	// eslint-disable-next-line solid/reactivity
	if (props.adaptiveHeight) {
		plugins.push(adaptiveHeight)
	}

	return (
		<div class={`relative ${props.class ?? ''} flex w-full max-w-full flex-col`}>
			<Show
				when={props.items.length > 0}
				fallback={
					<Show when={props.noItemsMessage}>
						<span class="dark:text-white-dark mx-auto py-16 text-xl text-black">
							{props.noItemsMessage}
						</span>
					</Show>
				}>
				<SliderProvider>
					<Show when={props.updateOnChange}>
						<ReloadSliderOnChange value={props.updateOnChange} />
					</Show>
					<SolidSlider
						options={{
							slides: {
								perView: props.mobileCentered ? 'auto' : 1,
								spacing: 32,
								origin: props.mobileCentered ? 'center' : 'auto',
							},
							breakpoints: {
								'(min-width: 500px)': {
									slides: { perView: 'auto', spacing: 32 },
								},
							},
							mode: 'snap',
						}}
						plugins={plugins}>
						{props.children}
					</SolidSlider>
					<SliderNavigation items={props.items} />
				</SliderProvider>
			</Show>
		</div>
	)
}

export default Slider
