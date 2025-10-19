import { useNavigate } from '@solidjs/router'
import { Component } from 'solid-js'
import Header from '../components/Header'
import Logo from '../components/Logo'
import SearchBar from '../components/SearchBar'
import PageContent from '../layouts/PageContent'

const Home: Component = () => {
	const navigate = useNavigate()

	const doSearch = (airportIdentifier: string) => {
		if (airportIdentifier.length === 0) {
			// TODO return to search page
			return
		}

		navigate(`/airport/${airportIdentifier}`)
	}

	return (
		<>
			<PageContent
				title="Live METAR & TAF Aviation Weather Reports"
				description="Search 5,000+ airports for real-time METARs, TAF forecasts, runway winds, and automated aviation weather updates with metar.live."
				contentFullHeight={true}>
				<Header />
				<div class="mt-[15vh] flex flex-col gap-8 transition-all md:mt-[20vh]">
					<Logo showText={false} class="mx-auto hidden md:flex" />
					<h2 class="dark:text-white-dark text-center">
						Find live aviation weather for any airport worldwide
					</h2>
					<div class="flex flex-col">
						<SearchBar onSearch={doSearch} autofocus={true} />
						<span class="dark:text-white-darker mx-auto mt-2 text-center text-gray-600">
							Simply start typing
						</span>
					</div>
				</div>
			</PageContent>
		</>
	)
}

export default Home
