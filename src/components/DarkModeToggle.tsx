import { BsMoonStars } from 'solid-icons/bs'
import { WiDaySunny } from 'solid-icons/wi'
import { Component } from 'solid-js'
import { ThemeMode, useSettingsStore } from '../context/SettingsStore'

interface TabGroupProps {
	class?: string
}

const DarkModeToggle: Component<TabGroupProps> = props => {
	const [settingsStore, { setTheme }] = useSettingsStore()

	return (
		<div class="flex">
			<div
				aria-label="Theme mode toggle"
				class={`bg-gray-background dark:bg-black-200 dark:text-white-light flex rounded-xl p-1 ${
					props.class ?? ''
				}`}>
				<button
					type="button"
					role="switch"
					aria-checked={settingsStore.theme === ThemeMode.Dark}
					aria-label="Dark mode"
					onClick={() => setTheme(ThemeMode.Dark)}
					class="flex cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-all"
					classList={{
						'bg-white dark:bg-black-100 dark:text-white-light bg-opacity-75 text-black cursor-default shadow-xs':
							settingsStore.theme === ThemeMode.Dark,
					}}>
					<BsMoonStars class="my-auto" size={16} />
				</button>
				<button
					type="button"
					role="switch"
					aria-checked={settingsStore.theme === ThemeMode.Light}
					aria-label="Light mode"
					onClick={() => setTheme(ThemeMode.Light)}
					class="flex cursor-pointer rounded-lg px-4 py-2 align-middle text-sm font-medium transition-all"
					classList={{
						'bg-white dark:bg-black-100 dark:text-white-light bg-opacity-75 text-black cursor-default shadow-xs':
							settingsStore.theme === ThemeMode.Light,
					}}>
					<WiDaySunny class="my-auto" size={26} />
				</button>
				<button
					type="button"
					role="switch"
					aria-checked={settingsStore.theme === ThemeMode.System}
					aria-label="System theme"
					onClick={() => setTheme(ThemeMode.System)}
					class="flex cursor-pointer rounded-lg px-4 py-2 align-middle text-sm font-medium transition-all"
					classList={{
						'bg-white dark:bg-black-100 dark:text-white bg-opacity-75 text-black cursor-default shadow-xs':
							settingsStore.theme === ThemeMode.System,
					}}>
					<span class="my-auto">System</span>
				</button>
			</div>
		</div>
	)
}

export default DarkModeToggle
