import { A } from '@solidjs/router'
import { Component, Show, createEffect } from 'solid-js'
import Button from '../components/Button'
import Header from '../components/Header'
import PageContent from './PageContent'

type ErrorPageProps = {
	error: Error
	reset?: () => void
	recoverable?: boolean
}

const ErrorPage: Component<ErrorPageProps> = props => {
	createEffect(() => {
		console.error(props.error)
	})

	return (
		<PageContent title="Error" description="An error occured" contentFullHeight={true}>
			<Header />
			<div class="dark:text-white-dark flex flex-1 flex-col items-center justify-center gap-8 text-black">
				<h1 class="text-center text-4xl font-bold">Sorry, that didn't work</h1>
				<p class="text-xl">{props.error.toString()}</p>
				<Show when={props.reset !== undefined}>
					{/* eslint-disable-next-line solid/reactivity */}
					<Button onClick={() => props.reset && props.reset()}>Try again</Button>
				</Show>
				<Show when={props.recoverable}>
					<A href="/" class="mt-8 transition-all hover:underline">
						Back to home
					</A>
				</Show>
			</div>
		</PageContent>
	)
}

export default ErrorPage
