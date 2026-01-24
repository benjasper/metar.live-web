import { createContext, createEffect, onCleanup, ParentComponent, useContext } from 'solid-js'
import { createStore } from 'solid-js/store'

interface SettingsStore {
	theme: ThemeMode
	actualTheme: Omit<ThemeMode, 'system'>
}

enum ThemeMode {
	Light = 'light',
	Dark = 'dark',
	System = 'system',
}

type SettingsStoreContextInterface = [
	settingsStore: SettingsStore,
	actions: {
		setTheme: (theme: ThemeMode) => void
	},
]

const createSettingsStore = (): SettingsStore => {
	return {
		theme: ThemeMode.System,
		actualTheme: ThemeMode.Light,
	}
}

const SettingsStoreContext = createContext<SettingsStoreContextInterface | undefined>(undefined)

const SettingsStoreProvider: ParentComponent = props => {
	const [store, setStore] = createStore<SettingsStore>(createSettingsStore())

	// Set the theme on load when the saved theme string matches the ThemeMode enum
	if (localStorage.theme && Object.values(ThemeMode).includes(localStorage.theme as ThemeMode)) {
		setStore('theme', localStorage.theme as ThemeMode)
	}

	const actions: SettingsStoreContextInterface[1] = {
		setTheme: (darkMode: ThemeMode) => {
			setStore('theme', darkMode)
			// Save the current mode
			localStorage.theme = store.theme
		},
	}

	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
	// eslint-disable-next-line solid/reactivity
	if (store.theme === ThemeMode.System) {
		setStore('actualTheme', mediaQuery.matches ? ThemeMode.Dark : ThemeMode.Light)
	} else {
		// eslint-disable-next-line solid/reactivity
		setStore('actualTheme', store.theme)
	}

	const evaluateColorScheme = () => {
		// If the toggle has selected a specific mode, use that, otherwise (if system is selected) use the system preference
		if (store.theme === ThemeMode.Dark || (mediaQuery.matches && store.theme === ThemeMode.System)) {
			document.documentElement.classList.add('dark')
			// Set Meta Tag Theme Color
			document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#000212')
			setStore('actualTheme', ThemeMode.Dark)
		} else if (store.theme === ThemeMode.Light || (!mediaQuery.matches && store.theme === ThemeMode.System)) {
			document.documentElement.classList.remove('dark')
			document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#f9f8f9')
			setStore('actualTheme', ThemeMode.Light)
		}
	}

	createEffect(evaluateColorScheme)

	// If the system preference changes, re-evaluate the color scheme
	const onSystemChange = (_event: MediaQueryListEvent) => {
		evaluateColorScheme()
	}

	// Listen for system changes
	mediaQuery.addEventListener('change', onSystemChange)

	onCleanup(() => {
		mediaQuery.removeEventListener('change', onSystemChange)
	})

	return <SettingsStoreContext.Provider value={[store, actions]}>{props.children}</SettingsStoreContext.Provider>
}

function useSettingsStore() {
	const context = useContext(SettingsStoreContext)
	if (!context) {
		throw new Error('useSettingsStore must be used within SettingsStoreProvider')
	}
	return context
}

export { ThemeMode, useSettingsStore, SettingsStoreProvider }
export type { SettingsStoreContextInterface }
