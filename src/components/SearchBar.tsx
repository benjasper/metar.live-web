import { useKeyDownEvent, useKeyDownList } from '@solid-primitives/keyboard'
import { debounce } from '@solid-primitives/scheduled'
import { Transition } from 'solid-headless'
import { AiFillStar, AiOutlineSearch } from 'solid-icons/ai'
import {
	Component,
	createEffect,
	createMemo,
	createSignal,
	For,
	Match,
	mergeProps,
	Show,
	Switch,
	untrack,
} from 'solid-js'
import { useFavoriteAirportsStore } from '../context/FavoriteAirportsStore'
import { useGraphQL } from '../context/GraphQLClient'
import { AIRPORT_SEARCH } from '../queries/AirportQueries'
import { AirportSearchQuery, AirportSearchQueryVariables } from '../queries/generated/graphql'
import { A } from '@solidjs/router'
import Button from './Button'

type AirportEdge = NonNullable<AirportSearchQuery['getAirports']>['edges'][number]

interface SearchBarProps {
	class?: string
	onSearch: (airportIdentifier: string) => void
	placeholder?: string
	autofocus?: boolean
}

const SearchBar: Component<SearchBarProps> = (properties: SearchBarProps) => {
	const props = mergeProps({ class: '', placeholder: 'Search for an airport' }, properties)

	const [isFocused, setIsFocused] = createSignal(false)
	const [queryVars, setQueryVars] = createSignal<AirportSearchQueryVariables | false>(false)
	const [currentInput, setCurrentInput] = createSignal<string>('')

	let root!: HTMLInputElement
	let input!: HTMLInputElement

	const [selectedAirportId, setSelectedAirportId] = createSignal<number | undefined>(undefined)
	const keys = useKeyDownList()
	const event = useKeyDownEvent()

	const newQuery = useGraphQL()
	const [, favoriteActions] = useFavoriteAirportsStore()

	// eslint-disable-next-line solid/reactivity
	const [airportRequest, refetch] = newQuery<AirportSearchQuery, AirportSearchQueryVariables>(
		AIRPORT_SEARCH,
		queryVars
	)

	const [airportResults, setAirportResults] = createSignal<AirportEdge[]>([])
	const [lastCompletedTerm, setLastCompletedTerm] = createSignal('')
	const trimmedInput = createMemo(() => currentInput().trim())
	createEffect(() => {
		if (airportRequest.state !== 'ready') {
			return
		}

		const airports = airportRequest()?.getAirports
		const sanitizedEdges =
			airports?.edges
				?.filter((edge): edge is AirportEdge => Boolean(edge))
				.map(edge => ({
					...edge,
					node: {
						...edge.node,
						station: edge.node.station ? { ...edge.node.station } : null,
					},
				})) ?? []

		setAirportResults(sanitizedEdges)
		setLastCompletedTerm(trimmedInput())
	})
	const hasResults = createMemo(() => airportResults().length > 0)
	const hasSearchTerm = createMemo(() => trimmedInput().length > 0)
	const isEmptyState = createMemo(
		() =>
			hasSearchTerm() &&
			lastCompletedTerm() === trimmedInput() &&
			!airportRequest.loading &&
			!airportRequest.error &&
			!hasResults()
	)
	const shouldShowDropdown = createMemo(
		() =>
			isFocused() &&
			hasSearchTerm() &&
			(Boolean(airportRequest.error) || hasResults() || isEmptyState())
	)

	const retrySearch = () => {
		if (refetch.refetch) {
			refetch.refetch()
		}
	}

	const throttledSearch = debounce((queryVars: AirportSearchQueryVariables | false) => setQueryVars(queryVars), 200)

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement

		setCurrentInput(target.value)

		if (target.value.length === 0) {
			setQueryVars(false)
			refetch.mutate(undefined)
			return
		}

		throttledSearch({ search: target.value })
		setSelectedAirportId(0)
	}

	const onSubmit = (airportIdentifier: string) => {
		props.onSearch(airportIdentifier.toUpperCase())
		input.blur()
		setIsFocused(false)
		setCurrentInput('')
		input.value = ''
	}

	const onFocusLeave = (e: Event) => {
		setTimeout(() => setIsFocused(false), 100)
	}

	createEffect(() => {
		const id = untrack(selectedAirportId)
		const untrackedEvent = untrack(event)

		if (keys().length === 0) {
			return
		}

		if (keys().includes('ESCAPE')) {
			setIsFocused(false)
			input.blur()
			return
		}

		if (
			keys().includes('ARROWDOWN') ||
			keys().includes('TAB') ||
			(keys().includes('CONTROL') && keys().includes('N'))
		) {
			untrackedEvent!.preventDefault()
			setSelectedAirportId(prev =>
				prev === undefined || prev < airportResults().length - 1 ? (prev ?? -1) + 1 : 0
			)
			return
		}

		if (keys().includes('ARROWUP') || (keys().includes('CONTROL') && keys().includes('P'))) {
			untrackedEvent!.preventDefault()
			setSelectedAirportId(prev =>
				prev === undefined || prev > 0 ? (prev ?? 1) - 1 : airportResults().length - 1
			)
			return
		}

		if (keys().length >= 2) {
			return
		}

		if (keys().includes('ENTER')) {
			if (id === undefined || !airportResults()[id]) {
				return
			}

			onSubmit(airportResults()[id].node.identifier)
		}

		// If it doesn't have focus we want to give it focus when we detect letters and numbers
		if (
			document.activeElement !== input &&
			untrackedEvent &&
			((untrackedEvent!.key.length === 1 && untrackedEvent!.key.match(/[a-z0-9]/i)) ||
				keys().includes('BACKSPACE'))
		) {
			input.focus()
			return
		}
	})

	return (
		<div class={`flex flex-col ${props.class}`}>
			<div ref={root} class="relative mx-auto w-full max-w-xl">
				<div
					class="group relative overflow-hidden rounded-[1.65rem] border border-slate-200/80 bg-white px-3 py-0.5 transition-colors duration-200 ease-out dark:border-white/10 dark:bg-white/10"
					classList={{
						'ring-2 ring-indigo-300/80 shadow-sm dark:ring-indigo-400/70 dark:shadow-none': isFocused(),
					}}>
					<input
						ref={input}
						type="text"
						autofocus={props.autofocus ?? false}
						spellcheck={false}
						tabIndex={-1}
						role="combobox"
						aria-expanded={shouldShowDropdown()}
						aria-owns="search-bar"
						aria-haspopup="listbox"
						autocomplete="off"
						placeholder={props.placeholder}
						onInput={e => handleInput(e)}
						onFocus={e => setIsFocused(true)}
						onFocusOut={e => onFocusLeave(e)}
						class="dark:text-white-dark dark:placeholder:text-white-darker w-full rounded-3xl border-none bg-transparent py-2.5 pr-11 pl-11 text-left text-lg font-medium text-slate-900 outline-hidden transition-colors duration-200 placeholder:text-slate-400 focus:outline-hidden"
					/>
					<AiOutlineSearch
						class="dark:text-white-darker pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 transform text-slate-400 transition-colors duration-300 group-hover:text-slate-500"
						size={18}
					/>
					<Transition
						show={airportRequest.loading}
						enter="transition duration-25"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="duration-200 transition ease-in-out"
						leaveFrom="opacity-100"
						leaveTo="opacity-0">
						<div class="absolute top-1/2 right-5 -translate-y-1/2 transform">
							<svg
								class="dark:text-white-darker h-5 w-5 animate-spin text-slate-400"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24">
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								/>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								/>
							</svg>
						</div>
					</Transition>
				</div>
				<Transition
					class="my-auto flex flex-col gap-32"
					show={shouldShowDropdown()}
					enter="transform transition duration-200"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="transform duration-200 transition ease-in-out"
					leaveFrom="opacity-100 rotate-0"
					leaveTo="opacity-0">
					<ul
						class="ring-opacity-5 absolute left-0 z-40 mt-3 w-full origin-top-right overflow-y-auto rounded-2xl border border-slate-200/80 bg-white/85 p-2 shadow-lg ring-1 ring-black/5 backdrop-blur-md focus:outline-hidden dark:border-white/10 dark:bg-slate-900/75 dark:ring-white/10 dark:backdrop-blur-md"
						role="listbox"
						id="search-bar"
						aria-label="Airport selection search bar"
						aria-orientation="vertical"
						aria-activedescendant={`search-bar-item-${selectedAirportId()}`}
						tabIndex={-1}>
						<Show when={hasResults()}>
							<For each={airportResults()}>
								{(airportNode, i) => {
									const airportIdentifier = () => airportNode.node.identifier
									const isFavorite = () => favoriteActions.isFavorite(airportIdentifier())

									return (
										<li
											id={`search-bar-item-${i()}`}
											onMouseEnter={_ => setSelectedAirportId(i())}
											role="option"
											aria-selected={i() === selectedAirportId()}
											tabIndex={i()}
											class="relative">
											<A
												class="block w-full cursor-pointer rounded-xl px-5 py-3 pr-14 text-sm font-medium transition-all duration-200"
												classList={{
													'bg-white text-slate-900 ring-1 ring-slate-200 shadow-sm dark:bg-white/10 dark:text-white-dark dark:ring-0 dark:shadow-none':
														i() === selectedAirportId(),
													'text-slate-600 hover:bg-slate-100/70 dark:text-slate-300 dark:hover:bg-white/10':
														i() !== selectedAirportId() &&
														airportNode.node.station !== null,
													'text-slate-400 dark:text-slate-500':
														airportNode.node.station === null,
												}}
												href={`/airport/${airportNode.node.identifier}`}>
												<Switch>
													<Match
														when={airportNode.node.icaoCode && airportNode.node.iataCode}>
														{airportNode.node.icaoCode} / {airportNode.node.iataCode} •{' '}
														{airportNode.node.name}
													</Match>
													<Match when={airportNode.node.icaoCode}>
														{airportNode.node.icaoCode} • {airportNode.node.name}
													</Match>
													<Match when={airportNode.node.gpsCode}>
														{airportNode.node.gpsCode} • {airportNode.node.name}
													</Match>
													<Match when={true}>
														{airportNode.node.identifier} • {airportNode.node.name}
													</Match>
												</Switch>
												<span
													role="img"
													aria-label={isFavorite() ? 'Saved to favorites' : 'Not favorited'}
													class="absolute top-1/2 right-4 -translate-y-1/2 transform text-slate-300 dark:text-slate-500"
													classList={{
														'text-amber-400 drop-shadow-sm': isFavorite(),
													}}>
													<Show when={isFavorite()}>
														<AiFillStar size={18} />
													</Show>
												</span>
											</A>
										</li>
									)
								}}
							</For>
						</Show>
						<Show when={isEmptyState()}>
							<li
								class="dark:text-white-dark pointer-events-none block w-full rounded-xl px-5 py-3 text-sm font-medium text-slate-500"
								role="option">
								Nothing found.
							</li>
						</Show>
						<Show when={airportRequest.error}>
							<li
								role="alert"
								class="flex flex-col gap-3 rounded-xl border border-rose-200/60 bg-rose-50/80 px-5 py-4 text-sm font-medium text-rose-900 shadow-sm dark:border-rose-400/40 dark:bg-rose-500/10 dark:text-rose-100">
								<span>Unable to reach metar.live right now.</span>
								<Button class="w-fit" onClick={retrySearch}>
									Retry search
								</Button>
							</li>
						</Show>
					</ul>
				</Transition>
			</div>
		</div>
	)
}

export default SearchBar
