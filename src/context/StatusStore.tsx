import { Accessor, ParentComponent, Setter, createContext, createSignal, useContext } from 'solid-js'

type StatusSetter = Setter<string | null>
type StatusStore = [Accessor<string | null>, StatusSetter]

const StatusStoreContext = createContext<StatusStore>([
	() => null,
	() => {
		throw new Error('useStatusStore must be used within a StatusStoreProvider')
	},
])

const StatusStoreProvider: ParentComponent = props => {
	const [lastWeatherSync, setLastWeatherSync] = createSignal<string | null>(null)

	return (
		<StatusStoreContext.Provider value={[lastWeatherSync, setLastWeatherSync]}>
			{props.children}
		</StatusStoreContext.Provider>
	)
}

const useStatusStore = () => useContext(StatusStoreContext)

export { StatusStoreProvider, useStatusStore }
