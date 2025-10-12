import { useKeyDownEvent, useKeyDownList } from '@solid-primitives/keyboard'
import { debounce } from '@solid-primitives/scheduled'
import { Transition } from 'solid-headless'
import { AiOutlineSearch } from 'solid-icons/ai'
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
import { useGraphQL } from '../context/GraphQLClient'
import { AIRPORT_SEARCH } from '../queries/AirportQueries'
import { AirportSearchQuery, AirportSearchQueryVariables } from '../queries/generated/graphql'
import { A } from '@solidjs/router'

interface SearchBarProps {
	class?: string
	onSearch: (airportIdentifier: string) => void
	placeholder?: string
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

	// eslint-disable-next-line solid/reactivity
	const [airportRequest, refetch] = newQuery<AirportSearchQuery, AirportSearchQueryVariables>(
		AIRPORT_SEARCH,
		queryVars
	)

	const airportResults = createMemo(() => airportRequest()?.getAirports.edges ?? [])

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

		if (keys().includes('ENTER')) {
			if (
				id === undefined ||
				airportResults() === undefined ||
				airportRequest.loading ||
				!airportResults()[id] ||
				airportRequest()?.getAirports.totalCount === 0
			) {
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
			<div ref={root} class={'relative mx-auto w-full max-w-lg'}>
				<div class="flex flex-col">
					<input
						ref={input}
						type="text"
						autofocus={true}
						spellcheck={false}
						tabIndex={-1}
						role="combobox"
						aria-expanded={
							isFocused() &&
							airportRequest.latest !== undefined &&
							(airportRequest()?.getAirports.totalCount ?? 0) > 0
						}
						aria-owns="search-bar"
						aria-haspopup="listbox"
						autocomplete="off"
						placeholder={props.placeholder}
						onInput={e => handleInput(e)}
						onFocus={e => setIsFocused(true)}
						onFocusOut={e => onFocusLeave(e)}
						class={
							'dark:bg-black-200 dark:text-white-dark w-full rounded-full bg-white px-10 py-2 text-left text-xl text-gray-900 outline-hidden transition-all'
						}
					/>
					<AiOutlineSearch
						class="dark:fill-white-dark absolute top-1/2 left-3 -translate-y-1/2 transform fill-gray-700"
						size={20}
					/>
					<Transition
						show={airportRequest.loading}
						enter="transition duration-25"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="duration-200 transition ease-in-out"
						leaveFrom="opacity-100"
						leaveTo="opacity-0">
						<div class="absolute top-1/2 right-3 -translate-y-1/2 transform">
							<svg
								class="dark:text-white-dark -ml-1 h-5 w-5 animate-spin text-gray-700"
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
					show={isFocused() && currentInput() !== '' && airportRequest.latest !== undefined}
					enter="transform transition duration-200"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="transform duration-200 transition ease-in-out"
					leaveFrom="opacity-100 rotate-0"
					leaveTo="opacity-0">
					<ul
						class="ring-opacity-5 dark:bg-black-200 absolute left-0 z-30 mt-2 w-full origin-top-right overflow-y-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black focus:outline-hidden"
						role="listbox"
						id="search-bar"
						aria-label="Airport selection search bar"
						aria-orientation="vertical"
						aria-activedescendant={`search-bar-item-${selectedAirportId()}`}
						tabindex="-1">
						<Show when={airportRequest.latest && (airportRequest()?.getAirports.totalCount ?? 0) > 0}>
							<For each={airportResults()}>
								{(airportNode, i) => (
									<li
										id={`search-bar-item-${i()}`}
										onMouseEnter={e => setSelectedAirportId(i())}
										role="option"
										aria-selected={i() === selectedAirportId()}
										tabindex={i()}>
										<A
											class="block w-full cursor-pointer px-6 py-2 text-sm"
											classList={{
												'bg-gray-100 dark:bg-black-100': i() === selectedAirportId(),
												'dark:text-white-dark text-gray-900': airportNode.node.station !== null,
												'dark:text-gray-400 text-gray-500': airportNode.node.station === null,
											}}
											href={`/airport/${airportNode.node.identifier}`}>
											<Switch>
												<Match when={airportNode.node.icaoCode && airportNode.node.iataCode}>
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
										</A>
									</li>
								)}
							</For>
						</Show>
						<Show when={airportRequest() && airportRequest()?.getAirports.totalCount === 0}>
							<li
								class="dark:text-white-dark pointer-events-none block w-full px-6 py-2 text-sm text-gray-700"
								role="option">
								Nothing found.
							</li>
						</Show>
					</ul>
				</Transition>
			</div>
		</div>
	)
}

export default SearchBar
