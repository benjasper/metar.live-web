import { autoPlacement, autoUpdate, offset } from '@floating-ui/dom'
import { useFloating } from 'solid-floating-ui'
import { children, createEffect, createSignal, JSX, onCleanup, ParentComponent, Show } from 'solid-js'
import { Portal } from 'solid-js/web'

interface TooltipProps {
	text?: string
	component?: JSX.Element
	/**
	 * Delay in milliseconds before the tooltip is shown
	 */
	delay?: number
}

const Tooltip: ParentComponent<TooltipProps> = props => {
	const childRef = children(() => props.children)

	const [show, setShow] = createSignal(false)
	const [tooltip, setTooltip] = createSignal<HTMLElement>()
	let timeout: NodeJS.Timeout | undefined

	let position = useFloating(() => childRef() as HTMLElement, tooltip, {
		whileElementsMounted: autoUpdate,
		middleware: [offset(5), autoPlacement()],
	})

	const onHover = () => {
		if (props.delay) {
			timeout = setTimeout(() => {
				setShow(true)
			}, props.delay)
		} else {
			setShow(true)
		}
	}

	const onLeave = () => {
		setShow(false)
		if (timeout) {
			clearTimeout(timeout)
		}
	}

	createEffect(() => {
		const child = childRef() as HTMLElement

		child.addEventListener('mouseover', onHover)
		child.addEventListener('mouseleave', onLeave)
	})

	onCleanup(() => {
		removeEventListener('mouseover', onHover)
		removeEventListener('mouseleave', onLeave)

		if (timeout) {
			clearTimeout(timeout)
		}
	})

	return (
		<>
			<Show when={show()}>
				<Portal>
					<div
						role="tooltip"
						style={{
							position: position?.strategy ?? 'absolute',
							top: `${position?.y ?? 0}px`,
							left: `${position?.x ?? 0}px`,
						}}
						ref={setTooltip}
						class="dark:bg-black-150 dark:text-white-darker max-w-xs rounded-xl bg-white px-3 py-2 text-xs text-black shadow-xl">
						{props.text}
						{props.component}
					</div>
				</Portal>
			</Show>
			{childRef()}
		</>
	)
}

export default Tooltip
