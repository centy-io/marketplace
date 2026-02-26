'use client'

import { usePeriod, type Period } from './period-context'

const ALL_PERIODS: Period[] = ['last-week', 'last-month', 'all-time']

function fmt(n: number | null): string {
  if (n === null) return '—'
  return n.toLocaleString('en-US')
}

function getPeriodLabel(p: Period): string {
  if (p === 'last-week') return 'WEEK'
  if (p === 'last-month') return 'MONTH'
  return 'ALL'
}

function getPeriodSuffix(p: Period): string {
  if (p === 'last-week') return '/wk'
  if (p === 'last-month') return '/mo'
  return '/all'
}

function getPeriodHeaderLabel(p: Period): string {
  if (p === 'last-week') return 'WEEK'
  if (p === 'last-month') return 'MONTH'
  return 'ALL TIME'
}

function getDownloadValue(
  downloads: Record<Period, number | null>,
  p: Period
): number | null {
  if (p === 'last-week') return downloads['last-week']
  if (p === 'last-month') return downloads['last-month']
  return downloads['all-time']
}

function getTotalForPeriod(totals: Record<Period, number>, p: Period): number {
  if (p === 'last-week') return totals['last-week']
  if (p === 'last-month') return totals['last-month']
  return totals['all-time']
}

export function PeriodToggle() {
  const { period, setPeriod } = usePeriod()

  return (
    <div className="period-toggle" role="group" aria-label="Download period">
      {ALL_PERIODS.map(p => (
        <button
          key={p}
          className={`period-btn${period === p ? ' active' : ''}`}
          onClick={() => setPeriod(p)}
          aria-pressed={period === p}
        >
          {getPeriodLabel(p)}
        </button>
      ))}
    </div>
  )
}

export function DownloadsCell({
  downloads,
}: {
  downloads: Record<Period, number | null>
}) {
  const { period } = usePeriod()
  const value = getDownloadValue(downloads, period)

  return (
    <span key={period} className="pkg-downloads count-anim">
      <span className="pkg-dl-arrow">↓</span>
      <span className="pkg-dl-count">{fmt(value)}</span>
      {value !== null && (
        <span className="pkg-dl-unit">{getPeriodSuffix(period)}</span>
      )}
    </span>
  )
}

export function HeaderTotalsDisplay({
  totals,
  packageCount,
}: {
  totals: Record<Period, number>
  packageCount: number
}) {
  const { period } = usePeriod()

  return (
    <div className="header-stats">
      <div className="header-stats-label">
        TOTAL DOWNLOADS / {getPeriodHeaderLabel(period)}
      </div>
      <div key={period} className="header-stats-total count-anim">
        {getTotalForPeriod(totals, period).toLocaleString('en-US')}
      </div>
      <div className="header-stats-count">across {packageCount} packages</div>
    </div>
  )
}
