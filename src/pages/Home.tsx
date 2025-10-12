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
				title="Latest aviation weather"
				description="Find the latest aviation weather observations and forecasts for any airport around the world. Get your METARs and TAFs here."
				contentFullHeight={true}>
				<Header />
				<div class="mt-[15vh] flex flex-col gap-8 transition-all md:mt-[20vh]">
					<Logo showText={false} class="mx-auto hidden md:flex" />
					<h2 class="dark:text-white-dark text-center">What's the weather like in...</h2>
					<div class="flex flex-col">
						<SearchBar onSearch={doSearch} />
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
