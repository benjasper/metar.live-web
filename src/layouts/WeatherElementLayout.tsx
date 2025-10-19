import { autoUpdate, flip, offset } from '@floating-ui/dom'
import { useFloating } from 'solid-floating-ui'
import { Menu, MenuItem } from 'solid-headless'
import { BiSolidLockAlt, BiSolidLockOpenAlt } from 'solid-icons/bi'
import { BsThreeDotsVertical } from 'solid-icons/bs'
import {
	For,
	JSX,
	Match,
	ParentComponent,
	Show,
	Switch,
	createEffect,
	createMemo,
	createSignal,
	onCleanup,
} from 'solid-js'
import { Portal } from 'solid-js/web'
import Tooltip from '../components/Tooltip'
import { UnitStore, useUnitStore } from '../context/UnitStore'

export enum UpdatePing {
	Worse = -1,
	Neutral = 0,
	Better = 1,
}

export interface ParsedWeatherElementLayoutProps {
	name: string
	class?: string
	unitType?: { name?: string; unitType: keyof UnitStore }[]
	icon?: JSX.Element

	updatePingOldValue?: string
	updatePingNewValue?: string
	updatePing?: UpdatePing
}

const WeatherElementLayout: ParentComponent<ParsedWeatherElementLayoutProps> = props => {
	const [unitStore, { selectUnit, lockUnit, unlockUnit }] = useUnitStore()
	const [isOpen, setIsOpen] = createSignal(false)

	// ID from sanitized name
	const id = () => props.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()

	const unitConfigurations = createMemo(() => {
		if (props.unitType === undefined) {
			return []
		}

		return props.unitType.map(item => {
			return { name: item.name, type: item.unitType, configuration: unitStore[item.unitType] }
		})
	})

	const lockedUnits = createMemo(() => {
		return unitConfigurations()
			.map(x => x)
			.filter(item => item.configuration.locked !== '')
	})

	const hasUpdate = () => props.updatePing !== undefined && props.updatePingOldValue && props.updatePingNewValue

	const [reference, setReference] = createSignal<HTMLElement>()
	const [popper, setPopper] = createSignal<HTMLElement>()

	const position = useFloating(reference, popper, {
		whileElementsMounted: autoUpdate,
		placement: 'right',
		middleware: [offset(10), flip({ fallbackPlacements: ['top', 'bottom', 'left'] })],
	})

	const onClick = (event: MouseEvent) => {
		// Check if the click was outside the menu
		if (isOpen() && !popper()?.contains(event.target as Node) && !reference()?.contains(event.target as Node)) {
			setIsOpen(false)
		}
	}

	window.addEventListener('click', onClick)

	onCleanup(() => {
		window.removeEventListener('click', onClick)
	})

	const [triggerPing, setTriggerPing] = createSignal(false)
	const isDifferent = () => props.updatePingOldValue !== props.updatePingNewValue

	const ping = () => {
		if (triggerPing()) {
			return
		}

		setTriggerPing(true)
		setTimeout(() => {
			setTriggerPing(false)
		}, 3000)
	}

	createEffect<string | undefined>(previous => {
		if (previous && props.updatePingNewValue && props.updatePingNewValue !== previous) {
			ping()
		}

		return props.updatePingNewValue
	})

	return (
		<div
			class={`group dark:text-white-light relative flex h-auto min-h-[10.5rem] w-full flex-1 basis-full flex-col justify-center gap-3 rounded-3xl border border-slate-200/70 bg-white px-6 py-5 text-slate-900 transition-colors duration-200 md:mx-0 md:min-w-[220px] md:flex-[1_1_220px] md:basis-[calc(50%-1.5rem)] lg:basis-[calc(33%-1.5rem)] dark:border-white/10 dark:bg-slate-900/70 ${
				props.class ?? ''
			}`}>
			<label class="relative z-10 mx-auto flex items-center gap-2 px-4 text-center text-[0.66rem] font-semibold tracking-[0.3em] text-slate-500 uppercase transition-colors dark:text-white/70">
				<Show when={props.icon}>
					<div class="my-auto">{props.icon}</div>
				</Show>
				<span class="my-auto whitespace-nowrap">{props.name}</span>
				<Show when={hasUpdate()}>
					<Tooltip text={`Previously ${props.updatePingOldValue}`}>
						<span
							class="relative z-10 my-auto ml-1 inline-flex h-2.5 w-2.5 rounded-full transition-all"
							classList={{
								'bg-sky-400': props.updatePing === UpdatePing.Neutral && isDifferent(),
								'bg-slate-400': props.updatePing === UpdatePing.Neutral && !isDifferent(),
								'bg-emerald-400': props.updatePing === UpdatePing.Better,
								'bg-rose-500': props.updatePing === UpdatePing.Worse,
							}}>
							<span
								class="absolute my-auto inline-flex h-full w-full rounded-full opacity-70 transition-all"
								classList={{
									'animate-ping-large': triggerPing(),
									'bg-sky-400': props.updatePing === UpdatePing.Neutral && isDifferent(),
									'bg-slate-400': props.updatePing === UpdatePing.Neutral && !isDifferent(),
									'bg-emerald-400': props.updatePing === UpdatePing.Better,
									'bg-rose-500': props.updatePing === UpdatePing.Worse,
								}}
							/>
						</span>
					</Tooltip>
				</Show>
			</label>
			<Show when={unitConfigurations().length > 0 || hasUpdate()}>
				<div class="absolute top-2 right-2 flex gap-1 px-2 md:right-0">
					<Show when={unitConfigurations().length > 0}>
						<Show when={lockedUnits().length > 0}>
							<div class="invisible my-auto md:visible">
								<Tooltip
									text={`The unit${lockedUnits().length > 1 ? 's' : ''} of this component ${
										lockedUnits().length > 1 ? 'are' : 'is'
									} locked to ${lockedUnits()
										.map(x => unitStore[x.type].units[unitStore[x.type].selected].symbol)
										.join(', ')}. It will persist across different airports. You can unlock ${
										lockedUnits().length > 1 ? 'them' : 'it'
									} by opening the context menu.`}>
									<BiSolidLockAlt />
								</Tooltip>
							</div>
						</Show>
						<button
							type="button"
							aria-expanded={isOpen()}
							aria-haspopup="true"
							aria-controls={`context-menu-${id()}`}
							aria-label={`Context menu for ${props.name}. Includes unit conversions.`}
							onClick={() => setIsOpen(!isOpen())}
							ref={setReference}
							class="group my-auto inline-flex cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white/85 p-2 text-base font-medium text-slate-500 shadow-sm transition-colors duration-200 hover:border-gray-300 hover:text-slate-800 focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-hidden dark:border-white/15 dark:bg-slate-800 dark:text-white/70 dark:hover:border-white/25 dark:hover:text-white"
							classList={{
								'border-gray-300 bg-white text-slate-800 shadow-md dark:border-white/25 dark:bg-slate-800/90 dark:text-white':
									isOpen(),
							}}>
							<BsThreeDotsVertical />
						</button>
						<Show when={isOpen()}>
							<Portal>
								<div
									ref={setPopper}
									class="z-30 w-max px-4"
									style={{
										position: position.strategy,
										top: `${position.y ?? 0}px`,
										left: `${position.x ?? 0}px`,
									}}>
									<Menu
										aria-label={`Context menu for ${props.name}. Includes unit conversion.`}
										id={`context-menu-${id()}`}
										class="flex shrink-0 flex-col gap-1 overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 p-2 shadow-xl backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/85 dark:shadow-lg">
										<For each={unitConfigurations()}>
											{(unitConfiguration, index) => (
												<>
													<span class="px-4 pt-2 text-[0.68rem] font-semibold tracking-[0.2em] text-slate-500 uppercase dark:text-white/60">
														{unitConfiguration.name ?? props.name} unit conversion
													</span>
													<For each={unitConfiguration.configuration!.units}>
														{unit => (
															<MenuItem
																as="button"
																disabled={
																	unitStore[unitConfiguration.type!].locked !== ''
																}
																onClick={() =>
																	selectUnit(unitConfiguration.type!, unit.symbol)
																}
																class="flex gap-2 rounded-xl px-4 py-2 text-left text-sm font-medium whitespace-nowrap text-slate-600 transition-colors duration-200 hover:text-slate-900 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-60 dark:text-white/85 dark:hover:bg-white/10 dark:hover:text-white"
																classList={{
																	'cursor-default':
																		unitStore[unitConfiguration.type!].units[
																			unitStore[unitConfiguration.type!].selected
																		].symbol === unit.symbol,
																	'bg-white':
																		unitStore[unitConfiguration.type!].units[
																			unitStore[unitConfiguration.type!].selected
																		].symbol === unit.symbol,
																	'text-slate-900':
																		unitStore[unitConfiguration.type!].units[
																			unitStore[unitConfiguration.type!].selected
																		].symbol === unit.symbol,
																	'shadow-sm':
																		unitStore[unitConfiguration.type!].units[
																			unitStore[unitConfiguration.type!].selected
																		].symbol === unit.symbol,
																	'ring-1':
																		unitStore[unitConfiguration.type!].units[
																			unitStore[unitConfiguration.type!].selected
																		].symbol === unit.symbol,
																	'ring-indigo-300/70 dark:ring-indigo-500/60':
																		unitStore[unitConfiguration.type!].units[
																			unitStore[unitConfiguration.type!].selected
																		].symbol === unit.symbol,
																	'dark:bg-white/10':
																		unitStore[unitConfiguration.type!].units[
																			unitStore[unitConfiguration.type!].selected
																		].symbol === unit.symbol,
																	'dark:text-white':
																		unitStore[unitConfiguration.type!].units[
																			unitStore[unitConfiguration.type!].selected
																		].symbol === unit.symbol,
																	'enabled:hover:bg-gray-100':
																		unitStore[unitConfiguration.type!].units[
																			unitStore[unitConfiguration.type!].selected
																		].symbol !== unit.symbol,
																	'dark:enabled:hover:bg-white/10':
																		unitStore[unitConfiguration.type!].units[
																			unitStore[unitConfiguration.type!].selected
																		].symbol !== unit.symbol,
																}}>
																<div class="flex items-center gap-2">
																	<div
																		class="h-2.5 w-2.5 rounded-full border border-gray-300 bg-white transition-all duration-300 dark:border-white/40 dark:bg-transparent"
																		classList={{
																			'border-indigo-500/80 bg-indigo-500/90 dark:border-indigo-400 dark:bg-indigo-400':
																				unitStore[unitConfiguration.type!]
																					.units[
																					unitStore[unitConfiguration.type!]
																						.selected
																				].symbol === unit.symbol,
																		}}>
																		<span
																			class="block h-full w-full rounded-full"
																			classList={{
																				'bg-indigo-600 dark:bg-indigo-400':
																					unitStore[unitConfiguration.type!]
																						.units[
																						unitStore[
																							unitConfiguration.type!
																						].selected
																					].symbol === unit.symbol,
																			}}
																		/>
																	</div>
																	<span class="text-sm font-medium text-slate-700 dark:text-white/85">
																		Display in {unit.name} ({unit.symbol})
																	</span>
																</div>
															</MenuItem>
														)}
													</For>
													<MenuItem
														as="button"
														onClick={() =>
															unitStore[unitConfiguration.type!].locked === ''
																? lockUnit(
																		unitConfiguration.type!,
																		unitStore[unitConfiguration.type!].units[
																			unitStore[unitConfiguration.type!].selected
																		].symbol
																	)
																: unlockUnit(unitConfiguration.type!)
														}
														class="flex gap-2 rounded-xl px-4 py-2 text-left text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-100/70 hover:text-slate-900 focus-visible:outline-hidden dark:text-white/85 dark:hover:bg-white/10 dark:hover:text-white">
														<div
															class="my-auto flex flex-col items-center text-slate-400 transition-colors duration-200 dark:text-white/70"
															classList={{
																'text-slate-900 dark:text-primary-light!':
																	unitStore[unitConfiguration.type!].locked !== '',
															}}>
															<Switch>
																<Match
																	when={
																		unitStore[unitConfiguration.type!].locked === ''
																	}>
																	<BiSolidLockAlt class="my-auto w-2 scale-[1.6]" />
																</Match>
																<Match
																	when={
																		unitStore[unitConfiguration.type!].locked !== ''
																	}>
																	<BiSolidLockOpenAlt class="my-auto w-2 scale-[1.6]" />
																</Match>
															</Switch>
														</div>
														<span class="text-sm">
															{unitStore[unitConfiguration.type!].locked === ''
																? 'Lock'
																: 'Unlock'}{' '}
															current unit (
															{
																unitStore[unitConfiguration.type!].units[
																	unitStore[unitConfiguration.type!].selected
																].symbol
															}
															)
														</span>
													</MenuItem>
													<Show
														when={
															index() !== (unitConfigurations().length ?? 0) - 1 &&
															(unitConfigurations().length ?? 0) > 0
														}>
														<hr class="border-gray-200/80 dark:border-white/15" />
													</Show>
												</>
											)}
										</For>
									</Menu>
								</div>
							</Portal>
						</Show>
					</Show>
				</div>
			</Show>
			{props.children}
		</div>
	)
}

export default WeatherElementLayout
