import { Toggle as HeadlessToggle } from 'solid-headless'
import { Component } from 'solid-js'

interface ToggleProps {
	checked: boolean
	onChange: (checked: boolean) => void
	label: string
	offLabel: string
	onLabel: string
}

const Toggle: Component<ToggleProps> = props => {
	return (
		<div class="flex gap-2">
			<label class="my-auto font-normal normal-case">{props.offLabel}</label>
			<HeadlessToggle
				pressed={props.checked}
				// eslint-disable-next-line solid/reactivity
				onChange={checked => props.onChange(checked)}
				class="relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border transition-all duration-200 ease-out"
				classList={{
					'border-indigo-300 bg-indigo-500 shadow-sm dark:border-indigo-400/40 dark:bg-indigo-500/60':
						props.checked,
					'border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-black-100/60': !props.checked,
				}}>
				<span class="sr-only">{props.label}</span>
				<span
					aria-hidden="true"
					class={`${
						props.checked ? 'translate-x-[1.6rem]' : 'translate-x-[0.1rem]'
					} pointer-events-none my-auto inline-block h-[1.3rem] w-[1.3rem] transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out dark:bg-white-dark`}
				/>
			</HeadlessToggle>
			<label class="my-auto font-normal normal-case">{props.onLabel}</label>
		</div>
	)
}

export default Toggle
