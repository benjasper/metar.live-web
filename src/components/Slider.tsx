import { TbChevronLeft } from 'solid-icons/tb'
import { Component, createEffect, For, ParentComponent, Show, useContext } from 'solid-js'
import { Slider as SolidSlider, SliderContext, SliderProvider } from 'solid-slider'

interface DotsProps {
	items: any[]
}

const SliderNavigation: Component<DotsProps> = props => {
	const [helpers] = useContext(SliderContext)

	return (
		<Show when={props.items.length > 1}>
			<Show when={helpers().current() > 0}>
				<button
					aria-label="Previous forecast page"
					onClick={() => helpers().prev()}
					role="button"
					class="dark:bg-black-100 dark:text-white-dark absolute -bottom-6 left-0 hidden h-8 w-8 -translate-y-1/2 transform cursor-pointer rounded-full bg-white text-black shadow-xs md:flex">
					<TbChevronLeft class="m-auto" size={24} />
				</button>
			</Show>

			<div class="relative mx-auto mt-8 flex justify-center gap-3">
				<For each={props.items}>
					{(_, index) => (
						<button
							role="button"
							class="h-2.5 w-2.5 cursor-pointer rounded-full bg-gray-300 transition-all dark:bg-gray-700"
							aria-label={`Select forecast ${index() + 1}`}
							classList={{
								'bg-gray-500! !dark:bg-gray-400': helpers().current() === index(),
								'hover:bg-gray-400 dark:hover:bg-gray-500': helpers().current() !== index(),
							}}
							disabled={helpers().current() === index()}
							onClick={() => helpers().moveTo(index())}
						/>
					)}
				</For>
			</div>

			<Show when={helpers().current() < props.items.length - 2}>
				<button
					aria-label="Next forecast page"
					onClick={() => helpers().next()}
					role="button"
					class="dark:bg-black-100 dark:text-white-dark absolute right-0 -bottom-6 hidden h-8 w-8 -translate-y-1/2 transform cursor-pointer rounded-full bg-white text-black shadow-xs md:flex">
					<TbChevronLeft class="m-auto rotate-180" size={24} />
				</button>
			</Show>
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
		<div class={`relative ${props.class ?? ''} flex max-w-full flex-col`}>
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
