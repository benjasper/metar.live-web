import { cva, VariantProps } from 'class-variance-authority'
import { Match, ParentComponent, Switch } from 'solid-js'
import Tooltip from './Tooltip'

const tag = cva(
	'flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium transition-all duration-200',
	{
		variants: {
			cursor: {
				help: 'cursor-help',
			},
			intent: {
				standard:
					'border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-white-dark',
				successful:
					'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-200',
				warning:
					'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/20 dark:text-amber-200',
				danger: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/25 dark:text-rose-200',
				info: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-400/30 dark:bg-sky-500/20 dark:text-sky-200',
				neutral:
					'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-500/40 dark:bg-slate-600/30 dark:text-white-dark',
			},
		},
		defaultVariants: {
			intent: 'standard',
		},
	}
)

interface TagProps extends VariantProps<typeof tag> {
	tooltip?: string
	class?: string
}

interface LinkTagProps extends TagProps {
	href: string
}

const Tag: ParentComponent<TagProps> = props => {
	const cursor = () => (props.tooltip ? 'help' : undefined)

	return (
		<Switch>
			<Match when={props.tooltip}>
				<Tooltip text={props.tooltip} delay={1000}>
					<span class={`${tag({ intent: props.intent, cursor: cursor() })} ${props.class ?? ''}`}>
						{props.children}
					</span>
				</Tooltip>
			</Match>
			<Match when={true}>
				<span class={`${tag({ intent: props.intent, cursor: cursor() })} ${props.class ?? ''}`}>
					{props.children}
				</span>
			</Match>
		</Switch>
	)
}

const LinkTag: ParentComponent<LinkTagProps> = props => {
	return (
		<a
			href={props.href}
			class={`cursor-pointer ${tag({
				intent: props.intent,
			})} ${props.class ?? ''} hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-hidden dark:focus-visible:ring-sky-500/60 dark:focus-visible:ring-offset-transparent`}
			title={props.tooltip}
			target="_blank">
			{props.children}
		</a>
	)
}

export { Tag, LinkTag }
