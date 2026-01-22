import { A, useNavigate } from '@solidjs/router'
import { Component, For } from 'solid-js'
import FavoriteAirports from '../components/FavoriteAirports'
import Header from '../components/Header'
import Logo from '../components/Logo'
import SearchBar from '../components/SearchBar'
import PageContent from '../layouts/PageContent'

const Home: Component = () => {
	const navigate = useNavigate()
	const popularAirports = [
		{ code: 'KJFK', label: 'New York' },
		{ code: 'EGLL', label: 'London' },
		{ code: 'EDDF', label: 'Frankfurt' },
		{ code: 'OMDB', label: 'Dubai' },
		{ code: 'RJTT', label: 'Tokyo' },
	]

	const doSearch = (airportIdentifier: string, options?: { newTab?: boolean }) => {
		if (airportIdentifier.length === 0) {
			// TODO return to search page
			return
		}

		const targetPath = `/airport/${airportIdentifier}`
		if (options?.newTab) {
			window.open(targetPath, '_blank', 'noopener')
			return
		}

		navigate(targetPath)
	}

	return (
		<>
			<PageContent
				title="Live METAR & TAF Aviation Weather Reports"
				description="Search 5,000+ airports for real-time METARs, TAF forecasts, runway winds, and automated aviation weather updates with metar.live."
				contentFullHeight={false}>
				<Header />
				<div class="mt-16 flex flex-col gap-8 transition-all md:mt-[20vh]">
					<div class="relative mx-auto w-full max-w-3xl">
						<div class="pointer-events-none absolute -inset-8 rounded-[40px] bg-linear-to-b from-slate-200/70 via-slate-100/20 to-transparent blur-3xl dark:from-white/10 dark:via-white/5" />
						<div class="relative z-10 flex flex-col gap-10 rounded-3xl border border-slate-200/70 bg-white/90 px-8 py-10 shadow-sm backdrop-blur md:px-12 md:py-12 dark:border-white/10 dark:bg-slate-900/70">
							<Logo showText={false} class="mx-auto hidden md:flex" />
							<div class="flex flex-col items-center gap-2">
								<h2 class="text-center text-2xl text-slate-900 dark:text-white">
									Live METARs and TAFs for any airport
								</h2>
								<p class="dark:text-white-darker text-center text-xs text-slate-700">
									Aviation weather and forecast trends in real-time
								</p>
							</div>
							<div class="flex flex-col">
								<SearchBar onSearch={doSearch} autofocus={true} />
							</div>
							<div class="mx-auto flex w-full max-w-3xl flex-col gap-3">
								<span class="text-center text-xs tracking-wide text-slate-600 uppercase dark:text-white/60">
									Popular
								</span>
								<div class="flex flex-wrap justify-center gap-2">
									<For each={popularAirports}>
										{airport => (
											<A
												href={`/airport/${airport.code}`}
												aria-label={`Open weather for ${airport.code} (${airport.label})`}
												class="dark:text-white-dark inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-hidden dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:text-white dark:focus-visible:ring-sky-500/60 dark:focus-visible:ring-offset-transparent">
												<span class="font-semibold tracking-wide text-slate-700 dark:text-white">
													{airport.code}
												</span>
												<span class="text-slate-600 dark:text-white/70">{airport.label}</span>
											</A>
										)}
									</For>
								</div>
							</div>
						</div>
					</div>
				</div>
				<FavoriteAirports />
			</PageContent>
		</>
	)
}

export default Home
