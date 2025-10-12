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
				class="relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full transition-all"
				classList={{
					'bg-primary dark:bg-primary-light': props.checked,
					'bg-gray-200 dark:bg-black-100': !props.checked,
				}}>
				<span class="sr-only">{props.label}</span>
				<span
					aria-hidden="true"
					class={`${
						props.checked ? 'translate-x-[1.6rem]' : 'translate-x-[0.1rem]'
					} dark:bg-white-dark pointer-events-none my-auto inline-block h-[1.3rem] w-[1.3rem] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
				/>
			</HeadlessToggle>
			<label class="my-auto font-normal normal-case">{props.onLabel}</label>
		</div>
	)
}

export default Toggle
