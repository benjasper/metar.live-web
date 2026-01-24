import { ParentComponent } from 'solid-js'
import { useSettingsStore } from '../context/SettingsStore'
import { init } from '@plausible-analytics/tracker'

const Page: ParentComponent = props => {
	const [settingsStore] = useSettingsStore()

	init({
		domain: 'metar.live',
		outboundLinks: true,
		endpoint: 'https://plausible.benjaminjasper.com/api/event',
		customProperties: () => {
			return {
				theme: settingsStore.theme,
			}
		},
	})

	return <>{props.children}</>
}

export default Page
