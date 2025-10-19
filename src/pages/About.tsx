import { A } from '@solidjs/router'
import { AiOutlineGithub } from 'solid-icons/ai'
import Header from '../components/Header'
import PageContent from '../layouts/PageContent'

const About = () => {
	return (
		<PageContent
			title="About metar.live"
			description="Learn how metar.live delivers live METAR and TAF aviation weather, runway wind tools, and open-source data for pilots worldwide.">
			<div class="dark:text-white-dark container text-black">
				<Header />
				<h1 class="pt-16 text-4xl font-bold">About metar.live</h1>

				<h2 class="pt-16 text-3xl">What is this?</h2>
				<p class="mt-4">
					metar.live <i>(previously known as metar.gg)</i> is an open source aviation weather platform built
					to keep pilots, dispatchers, and avgeeks informed with live METAR reports and TAF forecasts for more
					than 5,000 airports. The app enriches raw data from the publicly available{' '}
					<a href="https://www.ourairports.com/">OurAirports</a> database and near real-time weather feeds
					imported every two minutes directly from <a href="https://www.noaa.gov/">NOAA</a>.
				</p>
				<p class="mt-4">
					By decoding complex weather strings into readable insights, metar.live makes it faster to understand
					visibility, crosswinds, and rapidly changing flight conditions—whether you are preparing a flight
					plan or tracking a loved one's journey.
				</p>
				<p class="mt-4">Features of the app include:</p>
				<ul class="list-disc pl-6">
					<li>a graphical representation of the raw METAR and TAF strings</li>
					<li>a runway layout view for representing wind conditions</li>
					<li>a time prediction for the next METAR update</li>
					<li>automatic weather updates, without having to refresh the page</li>
					<li>automatic unit conversions, that can also be changed manually</li>
					<li>a dark mode</li>
				</ul>
				<p class="mt-4">
					While this app, aims to be as accurate as possible, it is not guaranteed to be accurate or
					error-free. Therefore the app and the data it provides is to be viewed under the{' '}
					<A href="/terms">disclaimer found here</A>.
				</p>

				<h2 class="pt-16 text-3xl">Open Source</h2>
				<p class="mt-4">
					This is a free and open source project. You can find both the source code for the app as well as the
					API here:
				</p>
				<ul class="mt-4 flex flex-col gap-2 pl-2">
					<li>
						<a class="flex gap-2" href="https://github.com/benjasper/metar.live-web">
							<AiOutlineGithub class="my-auto" size={24} />
							<span class="my-auto">Web app</span>
						</a>
					</li>
					<li>
						<a class="flex gap-2" href="https://github.com/benjasper/metar.gg-backend">
							<AiOutlineGithub class="my-auto" size={24} />
							<span class="my-auto">Backend</span>
						</a>
					</li>
				</ul>

				<p class="mt-4">
					Feel free to contribute or open an issue if you find a bug or have a feature request.
				</p>
			</div>
		</PageContent>
	)
}

export default About
