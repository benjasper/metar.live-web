import { BsMoonStars } from 'solid-icons/bs'
import { WiDaySunny } from 'solid-icons/wi'
import { Component, createSignal } from 'solid-js'
import { ThemeMode, useSettingsStore } from '../context/SettingsStore'

interface TabGroupProps {
	class?: string
}

const DarkModeToggle: Component<TabGroupProps> = props => {
	const [settingsStore, { setTheme }] = useSettingsStore()
	const isDark = () => settingsStore.theme === ThemeMode.Dark
	const isLight = () => settingsStore.theme === ThemeMode.Light
	const isSystem = () => settingsStore.theme === ThemeMode.System
	const [expanded, setExpanded] = createSignal(false)
	let toggleRef: HTMLDivElement | undefined

	const expand = () => setExpanded(true)
	const collapse = () => {
		if (toggleRef?.matches(':focus-within')) return
		setExpanded(false)
	}
	const handleFocusOut = (event: FocusEvent & { currentTarget: HTMLDivElement }) => {
		const relatedTarget = event.relatedTarget
		if (!relatedTarget || !(relatedTarget instanceof Node) || !event.currentTarget.contains(relatedTarget)) {
			collapse()
		}
	}

	return (
		<div class="flex">
			<div
				aria-label="Theme mode toggle"
				class={`group dark:text-white-light flex items-center gap-1 rounded-2xl border border-slate-300/60 bg-slate-50/85 p-1.5 backdrop-blur-md transition-all duration-300 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-lg dark:backdrop-blur-md ${
					props.class ?? ''
				}`}
				ref={el => (toggleRef = el)}
				onPointerEnter={expand}
				onPointerLeave={collapse}
				onFocusIn={expand}
				onFocusOut={handleFocusOut}>
				<button
					type="button"
					role="switch"
					aria-checked={settingsStore.theme === ThemeMode.Dark}
					aria-label="Dark mode"
					onClick={() => setTheme(ThemeMode.Dark)}
					class="flex cursor-pointer items-center gap-0 rounded-xl px-2.5 py-2 text-[0.65rem] font-semibold text-slate-700 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-300/60 focus-visible:ring-offset-[1.5px] focus-visible:ring-offset-white focus-visible:outline-hidden md:px-3 dark:text-slate-300 dark:focus-visible:ring-indigo-400/50 dark:focus-visible:ring-offset-transparent"
					classList={{
						'bg-slate-50 text-slate-900 ring-1 ring-slate-300/60 cursor-default dark:bg-white/15 dark:text-white dark:ring-white/20 dark:shadow-none':
							isDark(),
						'gap-1.5': expanded(),
						'hover:bg-slate-50/80': !isDark(),
						'hover:text-slate-800': !isDark(),
						'dark:hover:bg-white/10': !isDark(),
						'dark:hover:text-white/90': !isDark(),
					}}>
					<BsMoonStars
						size={17}
						class="transition-colors duration-200"
						classList={{
							'text-slate-900 dark:text-white': isDark(),
							'text-slate-700 dark:text-slate-500': !isDark(),
						}}
					/>
					<span
						class="inline-flex max-w-0 overflow-hidden text-[0.65rem] font-semibold opacity-0 transition-all duration-200 ease-out"
						classList={{
							'max-w-12': expanded(),
							'opacity-100': expanded(),
						}}>
						Dark
					</span>
				</button>
				<button
					type="button"
					role="switch"
					aria-checked={settingsStore.theme === ThemeMode.Light}
					aria-label="Light mode"
					onClick={() => setTheme(ThemeMode.Light)}
					class="flex cursor-pointer items-center gap-0 rounded-xl px-2.5 py-2 text-[0.65rem] font-semibold text-slate-700 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-300/60 focus-visible:ring-offset-[1.5px] focus-visible:ring-offset-white focus-visible:outline-hidden md:px-3 dark:text-slate-300 dark:focus-visible:ring-indigo-400/50 dark:focus-visible:ring-offset-transparent"
					classList={{
						'bg-slate-50 text-slate-900 ring-1 ring-slate-300/60 cursor-default dark:bg-white/15 dark:text-white dark:ring-white/20 dark:shadow-none':
							isLight(),
						'gap-1.5': expanded(),
						'hover:bg-slate-50/80': !isLight(),
						'hover:text-slate-800': !isLight(),
						'dark:hover:bg-white/10': !isLight(),
						'dark:hover:text-white/90': !isLight(),
					}}>
					<WiDaySunny
						class="transition-colors duration-200"
						classList={{
							'text-slate-900 dark:text-white': isLight(),
							'text-slate-700 dark:text-slate-500': !isLight(),
						}}
						size={22}
					/>
					<span
						class="inline-flex max-w-0 overflow-hidden text-[0.65rem] font-semibold opacity-0 transition-all duration-200 ease-out"
						classList={{
							'max-w-12': expanded(),
							'opacity-100': expanded(),
						}}>
						Light
					</span>
				</button>
				<button
					type="button"
					role="switch"
					aria-checked={settingsStore.theme === ThemeMode.System}
					aria-label="System theme"
					onClick={() => setTheme(ThemeMode.System)}
					class="flex cursor-pointer items-center gap-0 rounded-xl px-2.5 py-2 text-[0.65rem] font-semibold text-slate-700 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-300/60 focus-visible:ring-offset-[1.5px] focus-visible:ring-offset-white focus-visible:outline-hidden md:px-3 dark:text-slate-300 dark:focus-visible:ring-indigo-400/50 dark:focus-visible:ring-offset-transparent"
					classList={{
						'bg-slate-50 text-slate-900 ring-1 ring-slate-300/60 cursor-default dark:bg-white/15 dark:text-white dark:ring-white/20 dark:shadow-none':
							isSystem(),
						'gap-1.5': expanded(),
						'hover:bg-slate-50/80': !isSystem(),
						'hover:text-slate-800': !isSystem(),
						'dark:hover:bg-white/10': !isSystem(),
						'dark:hover:text-white/90': !isSystem(),
					}}>
					<span
						class="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 text-[0.6rem] leading-none font-semibold text-slate-700 transition-colors duration-200 dark:border-white/30 dark:text-slate-400"
						classList={{
							'border-slate-400 text-slate-800 dark:border-white/60 dark:text-white': isSystem(),
						}}>
						S
					</span>
					<span
						class="inline-flex max-w-0 overflow-hidden text-[0.65rem] font-semibold opacity-0 transition-all duration-200 ease-out"
						classList={{
							'max-w-14': expanded(),
							'opacity-100': expanded(),
						}}>
						System
					</span>
				</button>
			</div>
		</div>
	)
}

export default DarkModeToggle
