import type { Period } from './period-context'

export const ALL_PERIODS: Period[] = ['last-week', 'last-month', 'all-time']

export function fmt(n: number | null): string {
  if (n === null) return '—'
  return n.toLocaleString('en-US')
}

export function getPeriodLabel(p: Period): string {
  if (p === 'last-week') return 'WEEK'
  if (p === 'last-month') return 'MONTH'
  return 'ALL'
}

export function getPeriodSuffix(p: Period): string {
  if (p === 'last-week') return '/wk'
  if (p === 'last-month') return '/mo'
  return '/all'
}

export function getPeriodHeaderLabel(p: Period): string {
  if (p === 'last-week') return 'WEEK'
  if (p === 'last-month') return 'MONTH'
  return 'ALL TIME'
}

export function getDownloadValue(
  downloads: Record<Period, number | null>,
  p: Period
): number | null {
  if (p === 'last-week') return downloads['last-week']
  if (p === 'last-month') return downloads['last-month']
  return downloads['all-time']
}

export function getTotalForPeriod(
  totals: Record<Period, number>,
  p: Period
): number {
  if (p === 'last-week') return totals['last-week']
  if (p === 'last-month') return totals['last-month']
  return totals['all-time']
}
