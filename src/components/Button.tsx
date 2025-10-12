import { ParentComponent } from 'solid-js'

type ButtonProps = {
	onClick?: () => void
}

const Button: ParentComponent<ButtonProps> = props => {
	return (
		<button
			class="bg-primary dark:bg-primary-light rounded-md px-4 py-2 text-base font-semibold text-white transition-all hover:opacity-75"
			onClick={() => props.onClick && props.onClick()}>
			{props.children}
		</button>
	)
}

export default Button
