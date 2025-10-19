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
			class={`group relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 px-5 py-2.5 text-sm font-semibold tracking-wide text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-sky-200 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-hidden dark:focus-visible:ring-sky-500/60 ${props.class ?? ''}`}
			onClick={() => props.onClick && props.onClick()}>
			<span class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),transparent_55%)] opacity-60 transition-opacity duration-500 group-hover:opacity-80" />
			<span class="relative z-10">{props.children}</span>
		</button>
	)
}

export default Button
