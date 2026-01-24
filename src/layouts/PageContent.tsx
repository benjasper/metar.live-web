import { Meta } from '@solidjs/meta'
import { ParentComponent } from 'solid-js'
import Footer from '../components/Footer'
import StatusBanner from '../components/StatusBanner'
import PageTitle from '../components/PageTitle'
import metarGGLogo from '../images/metargg-logo.webp'

interface PageContentProps {
	title: string
	description: string
	contentFullHeight?: boolean
	containerOnMobile?: boolean
}

const PageContent: ParentComponent<PageContentProps> = props => {
	const containerClasses = () =>
		props.containerOnMobile === false
			? 'relative flex w-full flex-col px-4 transition-colors sm:container sm:px-8'
			: 'relative container flex flex-col transition-colors'

	return (
		<>
			<PageTitle content={props.title} />
			<Meta name="description" content={props.description} />

			<Meta name="og:title" content={props.title} />
			<Meta name="og:description" content={props.description} />
			<Meta name="og:image" content={metarGGLogo} />

			<Meta name="twitter:card" content="summary" />
			<Meta name="twitter:title" content={props.title} />
			<Meta name="twitter:description" content={props.description} />
			<Meta name="twitter:image" content={metarGGLogo} />

			<div class="relative min-h-screen overflow-hidden">
				<div class="pointer-events-none absolute inset-0 -z-10">
					<div class="bg-gray-light h-full w-full transition-colors dark:bg-black" />
					<div class="absolute top-0 left-1/2 h-128 w-[120%] -translate-x-1/2 translate-z-0 rounded-b-[55%] bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.28),transparent_65%)] blur-3xl transition-opacity duration-500 ease-out dark:bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.22),transparent_70%)]" />
					<div class="absolute bottom-[-35%] left-1/2 h-120 w-[95%] -translate-x-1/2 translate-z-0 rounded-[50%] bg-[radial-gradient(circle,rgba(99,102,241,0.18),transparent_70%)] blur-3xl transition-opacity duration-700 ease-out dark:bg-[radial-gradient(circle,rgba(45,212,191,0.18),transparent_72%)]" />
					<div class="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0)_35%,rgba(15,23,42,0.25)_100%)] opacity-70 transition-opacity dark:opacity-40" />
				</div>
				<div class="grid-rows-layout relative grid min-h-screen pt-6 transition-colors">
					<div class={containerClasses()} classList={{ 'min-h-screen': props.contentFullHeight ?? false }}>
						<StatusBanner />
						{props.children}
					</div>
					<Footer />
				</div>
			</div>
		</>
	)
}

export default PageContent
