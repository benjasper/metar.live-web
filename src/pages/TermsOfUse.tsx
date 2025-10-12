import { Meta } from '@solidjs/meta'
import Header from '../components/Header'
import PageContent from '../layouts/PageContent'

const TermsOfUse = () => {
	return (
		<PageContent title="Terms of Use" description="">
			<Meta name="robots" content="noindex" />

			<div class="dark:text-white-dark container text-black">
				<Header />
				<h1 class="pt-16 text-4xl font-bold">Terms of Use</h1>
				<h2 class="pt-16 text-3xl">Usage Disclaimer</h2>
				<p class="mt-4">
					All information provided by this website is for informational purposes only. The information is
					provided by <a href="https://www.ourairports.com/">OurAirports</a> and{' '}
					<a href="https://www.noaa.gov/">NOAA</a> and while I endeavor to keep the information up to date and
					correct, I make no representations or warranties of any kind, express or implied, about the
					completeness, accuracy, reliability, suitability, or availability concerning the website or the
					information, products, services, or related graphics contained on the website for any purpose. Any
					reliance you place on such information is therefore strictly at your own risk.
				</p>
				<p class="mt-4">
					In no event will I be liable for any loss or damage including without limitation, indirect or
					consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits
					arising out of, or in connection with, the use of this website.
				</p>
				<h2 class="pt-8 text-3xl">Links to other websites</h2>
				<p class="mt-4">
					Through this website, you can visit other websites which are not under the control of I. I have no
					control over the nature, content and availability of those sites. The inclusion of any links does
					not necessarily imply a recommendation or endorse the views expressed within them.
				</p>
				<h2 class="pt-8 text-3xl">Availability</h2>
				<p class="mt-4">
					Every effort is made to keep the website up and running smoothly. However, I take no responsibility
					for, and will not be liable for, the website being temporarily unavailable due to technical issues
					beyond my control.
				</p>
			</div>
		</PageContent>
	)
}

export default TermsOfUse
