import { ForecastChangeIndicator, ForecastFragment } from '../../queries/generated/graphql'

export type IndicatorPaletteKey = 'BASE' | ForecastChangeIndicator

export interface IndicatorPaletteEntry {
	border: string
	background: string
	text: string
}

export const indicatorPalette: Record<IndicatorPaletteKey, IndicatorPaletteEntry> = {
	BASE: {
		border: 'border-slate-500/70 dark:border-slate-600',
		background: 'bg-slate-200/70 dark:bg-slate-900/40',
		text: 'text-slate-900 dark:text-white',
	},
	[ForecastChangeIndicator.Becmg]: {
		border: 'border-sky-500/70 dark:border-sky-700',
		background: 'bg-sky-200/60 dark:bg-sky-900/40',
		text: 'text-sky-900 dark:text-sky-100',
	},
	[ForecastChangeIndicator.Tempo]: {
		border: 'border-amber-500/70 dark:border-amber-600',
		background: 'bg-amber-100/80 dark:bg-amber-900/30',
		text: 'text-amber-900 dark:text-amber-200',
	},
	[ForecastChangeIndicator.Prob]: {
		border: 'border-emerald-500/70 dark:border-emerald-700',
		background: 'bg-emerald-100/70 dark:bg-emerald-900/30',
		text: 'text-emerald-900 dark:text-emerald-100',
	},
	[ForecastChangeIndicator.Fm]: {
		border: 'border-slate-500/70 dark:border-slate-600',
		background: 'bg-slate-200/70 dark:bg-slate-900/40',
		text: 'text-slate-900 dark:text-white',
	},
}

export const indicatorPaletteKeyForForecast = (forecast?: ForecastFragment | null): IndicatorPaletteKey => {
	if (!forecast || !forecast.changeIndicator || forecast.changeIndicator === ForecastChangeIndicator.Fm) {
		return 'BASE'
	}
	return forecast.changeIndicator
}

export const indicatorClassesForForecast = (forecast?: ForecastFragment | null): IndicatorPaletteEntry =>
	indicatorPalette[indicatorPaletteKeyForForecast(forecast)]
