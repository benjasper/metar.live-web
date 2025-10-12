import { Meta } from '@solidjs/meta'
import { ParentComponent } from 'solid-js'
import Footer from '../components/Footer'
import PageTitle from '../components/PageTitle'
import metarGGLogo from '../images/metargg-logo.webp'

interface PageContentProps {
	title: string
	description: string
	contentFullHeight?: boolean
}

const PageContent: ParentComponent<PageContentProps> = props => {
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

			<div class="grid-rows-layout bg-gray-light grid min-h-screen pt-6 transition-colors dark:bg-black">
				<div
					class="container flex flex-col transition-colors"
					classList={{ 'min-h-screen': props.contentFullHeight ?? false }}>
					{props.children}
				</div>
				<Footer />
			</div>
		</>
	)
}

export default PageContent
