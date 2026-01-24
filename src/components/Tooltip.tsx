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

	const showTooltip = () => {
		if (props.delay) {
			timeout = setTimeout(() => {
				setShow(true)
				timeout = undefined
			}, props.delay)
		} else {
			setShow(true)
		}
	}

	const onHover = () => {
		if (timeout) {
			clearTimeout(timeout)
		}
		showTooltip()
	}

	const onLeave = () => {
		setShow(false)
		if (timeout) {
			clearTimeout(timeout)
			timeout = undefined
		}
	}

	createEffect(() => {
		const child = childRef() as HTMLElement | undefined
		if (!child) return

		child.addEventListener('mouseenter', onHover)
		child.addEventListener('mouseleave', onLeave)
		child.addEventListener('focus', onHover)
		child.addEventListener('blur', onLeave)

		onCleanup(() => {
			child.removeEventListener('mouseenter', onHover)
			child.removeEventListener('mouseleave', onLeave)
			child.removeEventListener('focus', onHover)
			child.removeEventListener('blur', onLeave)
		})
	})

	onCleanup(() => {
		if (timeout) {
			clearTimeout(timeout)
			timeout = undefined
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
						class="pointer-events-none z-[60] max-w-xs rounded-lg border border-slate-300/60 bg-slate-50/90 px-3 py-1.5 text-xs font-medium text-slate-800 shadow-none backdrop-blur-md dark:border-white/10 dark:bg-slate-900/75 dark:text-white/85 dark:shadow-lg dark:backdrop-blur-md">
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
