import {
	Combobox,
	type ComboboxContentProps,
	type ComboboxInputValueChangeDetails,
	type ComboboxItemProps,
	type ComboboxValueChangeDetails,
	type UseComboboxContext,
	useListCollection,
} from '@ark-ui/solid/combobox'
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
	onMount,
	onCleanup,
	Show,
	Switch,
} from 'solid-js'
import { useFavoriteAirportsStore } from '../context/FavoriteAirportsStore'
import { createAbortableGraphQLClient } from '../context/GraphQLClient'
import { AIRPORT_SEARCH } from '../queries/AirportQueries'
import { AirportSearchQuery, AirportSearchQueryVariables } from '../queries/generated/graphql'
import { A } from '@solidjs/router'
import Button from './Button'

type AirportEdge = NonNullable<AirportSearchQuery['getAirports']>['edges'][number]
type ComboboxContentRenderProps = Parameters<NonNullable<ComboboxContentProps['asChild']>>[0]
type ComboboxItemRenderProps = Parameters<NonNullable<ComboboxItemProps['asChild']>>[0]

interface SearchBarProps {
	class?: string
	onSearch: (airportIdentifier: string, options?: { newTab?: boolean }) => void
	placeholder?: string
	autofocus?: boolean
}

const SearchBar: Component<SearchBarProps> = (properties: SearchBarProps) => {
	const props = mergeProps({ class: '', placeholder: 'Search for an airport' }, properties)

	const [isFocused, setIsFocused] = createSignal(false)
	const [queryVars, setQueryVars] = createSignal<AirportSearchQueryVariables | null>(null)
	const [currentInput, setCurrentInput] = createSignal<string>('')
	const [openInNewTabIntent, setOpenInNewTabIntent] = createSignal(false)
	let inputRef: HTMLInputElement | undefined

	const { client: searchClient, abort: abortSearch } = createAbortableGraphQLClient('https://api.metar.live/graphql')
	const [, favoriteActions] = useFavoriteAirportsStore()

	// eslint-disable-next-line solid/reactivity
	const [airportRequest, refetch] = searchClient<AirportSearchQuery, AirportSearchQueryVariables>(
		AIRPORT_SEARCH,
		queryVars
	)

	const [airportResults, setAirportResults] = createSignal<AirportEdge[]>([])
	const [lastCompletedTerm, setLastCompletedTerm] = createSignal('')
	const { collection, set: setCollection } = useListCollection<AirportEdge>({
		initialItems: [],
		itemToString: (item: AirportEdge) => item.node.identifier,
		itemToValue: (item: AirportEdge) => item.node.identifier,
	})
	const requestedTerm = createMemo(() => queryVars()?.search?.trim() ?? '')
	const trimmedInput = createMemo(() => currentInput().trim())
	createEffect(() => {
		if (airportRequest.state !== 'ready') {
			return
		}
		if (airportRequest.loading) {
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
		setCollection(sanitizedEdges)
		setLastCompletedTerm(requestedTerm())
	})
	const hasResults = createMemo(() => airportResults().length > 0)
	const hasSearchTerm = createMemo(() => trimmedInput().length > 0)
	const isAbortError = (error: unknown) =>
		error instanceof DOMException
			? error.name === 'AbortError'
			: (error as Error | undefined)?.name === 'AbortError'
	const hasError = createMemo(() => Boolean(airportRequest.error) && !isAbortError(airportRequest.error))
	const isEmptyState = createMemo(
		() =>
			hasSearchTerm() &&
			lastCompletedTerm() === trimmedInput() &&
			!airportRequest.loading &&
			!hasError() &&
			!hasResults()
	)
	const retrySearch = () => {
		if (refetch.refetch) {
			refetch.refetch()
		}
	}

	const throttledSearch = debounce((queryVars: AirportSearchQueryVariables | null) => setQueryVars(queryVars), 50)

	const resetResults = () => {
		setQueryVars(null)
		setAirportResults([])
		setCollection([])
		refetch.mutate(undefined)
	}

	const onSubmit = (airportIdentifier: string, options?: { newTab?: boolean }) => {
		props.onSearch(airportIdentifier.toUpperCase(), options)
		setCurrentInput('')
		resetResults()
	}

	onMount(() => {
		const handler = (event: KeyboardEvent) => {
			if (event.defaultPrevented) {
				return
			}

			if (event.metaKey || event.ctrlKey || event.altKey) {
				return
			}

			const target = event.target as HTMLElement | null
			if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
				return
			}

			if (document.activeElement === inputRef) {
				return
			}

			const isBackspace = event.key === 'Backspace'
			const isCharacter = event.key.length === 1 && /[a-z0-9]/i.test(event.key)

			if (!isBackspace && !isCharacter) {
				return
			}

			inputRef?.focus()
		}

		window.addEventListener('keydown', handler)

		onCleanup(() => {
			window.removeEventListener('keydown', handler)
		})
	})

	onCleanup(() => {
		abortSearch()
	})

	return (
		<Combobox.Root
			class="w-full"
			collection={collection()}
			inputValue={currentInput()}
			inputBehavior="autohighlight"
			selectionBehavior="preserve"
			onInputValueChange={(details: ComboboxInputValueChangeDetails) => {
				if (details.reason && details.reason !== 'input-change') {
					return
				}

				setCurrentInput(details.inputValue)

				if (details.inputValue.length === 0) {
					resetResults()
					return
				}

				throttledSearch({ search: details.inputValue })
			}}
			onValueChange={(details: ComboboxValueChangeDetails<AirportEdge>) => {
				const selected = details.items?.[0]

				if (!selected) {
					return
				}

				const shouldOpenInNewTab = openInNewTabIntent()
				setOpenInNewTabIntent(false)
				onSubmit(selected.node.identifier, { newTab: shouldOpenInNewTab })
			}}>
			<div class={`flex flex-col ${props.class}`}>
				<div class="relative mx-auto w-full max-w-none sm:max-w-xl">
					<Combobox.Control
						class="group relative overflow-hidden rounded-[1.65rem] border border-slate-300/60 bg-slate-50/80 px-3 py-0.5 transition-colors duration-200 ease-out dark:border-white/10 dark:bg-white/10"
						classList={{
							'ring-2 ring-indigo-300/80 dark:ring-indigo-400/70 dark:shadow-none': isFocused(),
						}}>
						<Combobox.Input
							ref={element => {
								inputRef = element
							}}
							autofocus={props.autofocus ?? false}
							spellcheck={false}
							autocomplete="off"
							placeholder={props.placeholder}
							onFocus={() => setIsFocused(true)}
							onBlur={() => setIsFocused(false)}
							onKeyDown={event => {
								if (event.key !== 'Enter') {
									return
								}

								setOpenInNewTabIntent(event.metaKey || event.ctrlKey)
							}}
							class="dark:text-white-dark dark:placeholder:text-white-darker w-full rounded-3xl border-none bg-transparent py-2.5 pr-11 pl-11 text-left text-lg font-medium text-slate-900 outline-hidden transition-colors duration-200 placeholder:text-slate-700 focus:outline-hidden"
						/>
						<AiOutlineSearch
							class="dark:text-white-darker pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 transform text-slate-700 transition-colors duration-300 group-hover:text-slate-800"
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
									class="dark:text-white-darker h-5 w-5 animate-spin text-slate-700"
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
					</Combobox.Control>
					<Combobox.Context<AirportEdge>>
						{(combobox: UseComboboxContext<AirportEdge>) => (
							<Transition
								class="my-auto flex flex-col gap-32"
								show={combobox().open && (hasResults() || isEmptyState() || hasError())}
								enter="transform transition duration-200"
								enterFrom="opacity-0"
								enterTo="opacity-100"
								leave="transform duration-200 transition ease-in-out"
								leaveFrom="opacity-100 rotate-0"
								leaveTo="opacity-0">
								<Combobox.Content
									asChild={(props: ComboboxContentRenderProps) => (
										<ul
											{...props({
												'aria-label': 'Airport selection search bar',
												class: 'ring-opacity-5 absolute left-0 z-50 mt-3 w-full origin-top-right overflow-y-auto rounded-2xl border border-slate-300/60 bg-slate-50/95 p-2 shadow-none ring-1 ring-slate-900/5 backdrop-blur-md focus:outline-hidden dark:border-white/10 dark:bg-slate-900/90 dark:ring-white/10 dark:shadow-lg dark:backdrop-blur-xl',
											})}>
											<Show when={hasResults()}>
												<For each={airportResults()}>
													{airportNode => {
														const airportIdentifier = () => airportNode.node.identifier
														const isFavorite = () =>
															favoriteActions.isFavorite(airportIdentifier())

														return (
															<Combobox.Item
																item={airportNode}
																asChild={(itemProps: ComboboxItemRenderProps) => (
																	<span
																		{...itemProps({
																			class: 'relative block w-full cursor-pointer rounded-xl px-5 py-3 pr-14 text-sm font-medium transition-all duration-200 data-[highlighted]:bg-slate-200/80 data-[highlighted]:text-slate-900 data-[highlighted]:ring-1 data-[highlighted]:ring-slate-300/70 dark:data-[highlighted]:bg-white/10 dark:data-[highlighted]:text-white-dark dark:data-[highlighted]:ring-0 dark:data-[highlighted]:shadow-none',
																			classList: {
																				'text-slate-800 hover:bg-slate-100/70 dark:text-slate-300 dark:hover:bg-white/10':
																					airportNode.node.station !== null,
																				'text-slate-700 dark:text-slate-500':
																					airportNode.node.station === null,
																			},
																			onPointerDown: event => {
																				setOpenInNewTabIntent(
																					event.metaKey || event.ctrlKey
																				)
																			},
																		})}>
																		<Combobox.ItemText>
																			<Switch>
																				<Match
																					when={
																						airportNode.node.icaoCode &&
																						airportNode.node.iataCode
																					}>
																					{airportNode.node.icaoCode} /{' '}
																					{airportNode.node.iataCode} •{' '}
																					{airportNode.node.name}
																				</Match>
																				<Match when={airportNode.node.icaoCode}>
																					{airportNode.node.icaoCode} •{' '}
																					{airportNode.node.name}
																				</Match>
																				<Match when={airportNode.node.gpsCode}>
																					{airportNode.node.gpsCode} •{' '}
																					{airportNode.node.name}
																				</Match>
																				<Match when={true}>
																					{airportNode.node.identifier} •{' '}
																					{airportNode.node.name}
																				</Match>
																			</Switch>
																		</Combobox.ItemText>
																		<span
																			role="img"
																			aria-label={
																				isFavorite()
																					? 'Saved to favorites'
																					: 'Not favorited'
																			}
																			class="absolute top-1/2 right-4 -translate-y-1/2 transform text-slate-700 dark:text-slate-500"
																			classList={{
																				'text-amber-400 drop-shadow-sm':
																					isFavorite(),
																			}}>
																			<Show when={isFavorite()}>
																				<AiFillStar size={18} />
																			</Show>
																		</span>
																	</span>
																)}
															/>
														)
													}}
												</For>
											</Show>
											<Show when={isEmptyState()}>
												<li
													class="dark:text-white-dark pointer-events-none block w-full rounded-xl px-5 py-3 text-sm font-medium text-slate-800"
													role="option">
													Nothing found.
												</li>
											</Show>
											<Show when={hasError()}>
												<li
													role="alert"
													class="flex flex-col gap-3 rounded-xl border border-rose-200/60 bg-rose-50/80 px-5 py-4 text-sm font-medium text-rose-900 shadow-none dark:border-rose-400/40 dark:bg-rose-500/10 dark:text-rose-100 dark:shadow-sm">
													<span>Unable to reach metar.live right now.</span>
													<Button class="w-fit" onClick={retrySearch}>
														Retry search
													</Button>
												</li>
											</Show>
										</ul>
									)}
								/>
							</Transition>
						)}
					</Combobox.Context>
				</div>
			</div>
		</Combobox.Root>
	)
}

export default SearchBar
