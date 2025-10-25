import { ParentComponent } from 'solid-js'

type ButtonProps = {
	onClick?: () => void
	type?: 'button' | 'submit' | 'reset'
	class?: string
}

const Button: ParentComponent<ButtonProps> = props => {
	return (
		<button
			type={props.type ?? 'button'}
			class={`group my-auto inline-flex cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white/85 px-4 py-2 text-sm font-medium text-slate-500 shadow-sm transition-colors duration-200 hover:border-gray-300 hover:text-slate-800 focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-hidden dark:border-white/15 dark:bg-slate-900/70 dark:text-white/70 dark:hover:border-white/25 dark:hover:text-white ${props.class ?? ''}`}
			onClick={() => props.onClick && props.onClick()}>
			{props.children}
		</button>
	)
}

export default Button
