import { Meta } from '@solidjs/meta'
import Header from '../components/Header'
import PageContent from '../layouts/PageContent'

const Legal = () => {
	return (
		<PageContent title="Legal" description="">
			<Meta name="robots" content="noindex" />

			<div class="dark:text-white-dark container text-black">
				<Header />
				<h1 class="pt-16 text-4xl font-bold">Legal</h1>
				<h2 class="pt-16 text-3xl">Information according to §5 TMG</h2>
				<p class="mt-4">
					Operator: Benjamin Jasper
					<br />
					Bernhard-Göring-Str. 69
					<br />
					04107 Leipzig
					<br />
					Germany
				</p>
				<h2 class="pt-8 text-3xl">Contact</h2>
				<p>
					<a class="mt-4 block" href="https://benjaminjasper.com">
						benjaminjasper.com
					</a>
				</p>
			</div>
		</PageContent>
	)
}

export default Legal
