import { track } from '@plausible-analytics/tracker'
import { createContext, createEffect, ParentComponent, useContext } from 'solid-js'
import { createStore } from 'solid-js/store'

interface FavoriteAirport {
	identifier: string
	addedAt: number
}

interface FavoriteAirportsStore {
	favorites: FavoriteAirport[]
}

type FavoriteAirportsStoreContext = [
	store: FavoriteAirportsStore,
	actions: {
		addFavorite: (favorite: Omit<FavoriteAirport, 'addedAt'>) => void
		removeFavorite: (identifier: string) => void
		toggleFavorite: (favorite: Omit<FavoriteAirport, 'addedAt'>) => void
		isFavorite: (identifier: string) => boolean
		clear: () => void
	},
]

const STORAGE_KEY = 'metar.live:favorites'

const createFavoriteAirportsStore = (): FavoriteAirportsStore => ({
	favorites: [],
})

const FavoriteAirportsStoreContext = createContext<FavoriteAirportsStoreContext>(
	undefined as unknown as FavoriteAirportsStoreContext
)

const FavoriteAirportsStoreProvider: ParentComponent = props => {
	const [store, setStore] = createStore<FavoriteAirportsStore>(createFavoriteAirportsStore())

	if (typeof window !== 'undefined') {
		try {
			const savedFavorites = localStorage.getItem(STORAGE_KEY)
			if (savedFavorites) {
				const parsed = JSON.parse(savedFavorites) as FavoriteAirport[]
				setStore('favorites', parsed)
			}
		} catch (error) {
			console.warn('Unable to parse favorites from localStorage', error)
		}
	}

	createEffect(() => {
		if (typeof window === 'undefined') {
			return
		}

		localStorage.setItem(STORAGE_KEY, JSON.stringify(store.favorites))
	})

	const ensureIdentifier = (identifier: string) => identifier.toUpperCase()

	const addFavorite = (favorite: Omit<FavoriteAirport, 'addedAt'>) => {
		const identifier = ensureIdentifier(favorite.identifier)

		if (store.favorites.some(entry => entry.identifier === identifier)) {
			return
		}

		setStore('favorites', prev => [...prev, { ...favorite, identifier, addedAt: Date.now() }])
	}

	const removeFavorite = (identifier: string) => {
		const ensuredIdentifier = ensureIdentifier(identifier)
		setStore('favorites', prev => prev.filter(entry => entry.identifier !== ensuredIdentifier))
	}

	const toggleFavorite = (favorite: Omit<FavoriteAirport, 'addedAt'>) => {
		if (isFavorite(favorite.identifier)) {
			track('removedFavorite', {})
			removeFavorite(favorite.identifier)
		} else {
			addFavorite(favorite)
			track('addedFavorite', {})
		}
	}

	const isFavorite = (identifier: string) => {
		const ensuredIdentifier = ensureIdentifier(identifier)
		return store.favorites.some(entry => entry.identifier === ensuredIdentifier)
	}

	const clear = () => {
		setStore('favorites', [])
	}

	const actions: FavoriteAirportsStoreContext[1] = {
		addFavorite,
		removeFavorite,
		toggleFavorite,
		isFavorite,
		clear,
	}

	return (
		<FavoriteAirportsStoreContext.Provider value={[store, actions]}>
			{props.children}
		</FavoriteAirportsStoreContext.Provider>
	)
}

const useFavoriteAirportsStore = () => useContext(FavoriteAirportsStoreContext)

export { FavoriteAirportsStoreProvider, useFavoriteAirportsStore }
export type { FavoriteAirportsStoreContext }
