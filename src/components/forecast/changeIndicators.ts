export const changeIndicatorToSortingIndex = (changeIndicator: string): number => {
	switch (changeIndicator) {
		case '':
			return 0
		case 'BECMG':
			return 1
		case 'TEMPO':
			return 2
		case 'PROB':
			return 3
		default:
			return 4
	}
}

export const changeIndicatorCodeToText = (changeIndicator: string): string => {
	switch (changeIndicator) {
		case 'BECMG':
			return 'Becoming'
		case 'TEMPO':
			return 'Temporarily'
		case 'PROB':
			return 'Probable'
		case 'FM':
			return 'From'
		default:
			return ''
	}
}

export const changeTypePriority = (changeType: string): number => {
	switch (changeType) {
		case 'BASE':
			return 0
		case 'FM':
			return 1
		case 'BECMG':
			return 2
		case 'TEMPO':
			return 3
		case 'PROB':
			return 4
		default:
			return 5
	}
}

export const changeTypeLabel = (changeType: string): string => {
	if (changeType === 'BASE') {
		return 'Base forecast'
	}

	const mapped = changeIndicatorCodeToText(changeType)

	return mapped || changeType
}

const changeTypeAppearance: Record<
	string,
	{
		base: string
		active: string
	}
> = {
	BASE: {
		base: 'border-sky-200 bg-sky-100/40 dark:border-sky-700 dark:bg-sky-900/40',
		active: 'border-sky-500 bg-sky-500/20 shadow-md dark:border-sky-300 dark:bg-sky-400/25',
	},
	FM: {
		base: 'border-cyan-200 bg-cyan-100/40 dark:border-cyan-700 dark:bg-cyan-900/40',
		active: 'border-cyan-500 bg-cyan-500/20 shadow-md dark:border-cyan-300 dark:bg-cyan-400/25',
	},
	BECMG: {
		base: 'border-emerald-200 bg-emerald-100/35 dark:border-emerald-700 dark:bg-emerald-900/40',
		active: 'border-emerald-500 bg-emerald-500/20 shadow-md dark:border-emerald-300 dark:bg-emerald-400/25',
	},
	TEMPO: {
		base: 'border-amber-200 bg-amber-100/40 dark:border-amber-700 dark:bg-amber-900/40',
		active: 'border-amber-500 bg-amber-400/25 shadow-md dark:border-amber-300 dark:bg-amber-400/25',
	},
	PROB: {
		base: 'border-purple-200 bg-purple-100/35 dark:border-purple-700 dark:bg-purple-900/40',
		active: 'border-purple-500 bg-purple-500/20 shadow-md dark:border-purple-300 dark:bg-purple-400/25',
	},
}

export const classesForChangeType = (changeType: string, isActive: boolean): string => {
	const appearance = changeTypeAppearance[changeType] ?? changeTypeAppearance.BASE

	return isActive ? appearance.active : appearance.base
}
