import { Meta } from '@solidjs/meta'
import Header from '../components/Header'
import Logo from '../components/Logo'
import PageContent from '../layouts/PageContent'

const PrivacyPolicy = () => {
	return (
		<PageContent title="Privacy policy" description="">
			<Meta name="robots" content="noindex" />

			<div class="dark:text-white-dark container text-black">
				<Header />
				<h1 class="pt-16 text-4xl font-bold">Privacy policy</h1>
				<p class="mt-4">
					We use Plausible Analytics (self-hosted) to track overall trends in the usage of our website.
					Plausible Analytics collects only aggregated information, which does not allow us to identify any
					visitor to our website. For more information, please visit the{' '}
					<a href="https://plausible.io/data-policy" target="_blank">
						https://plausible.io/data-policy
					</a>
					.
				</p>
				<p class="mt-4">
					The purpose of us using this software is to understand our website traffic in the most
					privacy-friendly way possible so that we can continually improve our website. The lawful basis as
					per the GDPR is "Article 6(1)(f); where our legitimate interests are to improve our website and
					business continually." As per the explanation, no personal data is stored over time.
				</p>
			</div>
		</PageContent>
	)
}

export default PrivacyPolicy
