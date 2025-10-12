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
			<LogoSvg class="w-12 flex-shrink-0 rounded-full bg-white text-primary transition-colors dark:bg-transparent dark:text-white-light" />
			<Show when={props.showText}>
				<span class="my-auto font-display text-2xl text-primary transition-colors dark:text-white-light">
					metar.live
				</span>
			</Show>
		</A>
	)
}

export default Logo
