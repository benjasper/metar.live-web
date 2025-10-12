import { Component, mergeProps, Show } from 'solid-js'

import { A } from '@solidjs/router'
import LogoSvg from '/src/icons/metargg-logo.svg?component-solid'

interface LogoProps {
	class?: string
	showText?: boolean
}

const Logo: Component<LogoProps> = originalProps => {
	const props = mergeProps<[LogoProps, LogoProps]>({ showText: true }, originalProps)

	return (
		<A
			href="/"
			class={`flex flex-row gap-4 ${props.class ?? ''}`}
			aria-label="metar.live logo, links back to the home page">
			<LogoSvg class="text-primary dark:text-white-light w-12 shrink-0 rounded-full bg-white transition-colors dark:bg-transparent" />
			<Show when={props.showText}>
				<span class="font-display text-primary dark:text-white-light my-auto text-2xl transition-colors">
					metar.live
				</span>
			</Show>
		</A>
	)
}

export default Logo
