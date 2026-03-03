'use client'

import { usePeriod, type Period } from './period-context'
import {
  ALL_PERIODS,
  fmt,
  getPeriodLabel,
  getPeriodSuffix,
  getDownloadValue,
  getTotalForPeriod,
  getPeriodHeaderLabel,
} from './period-utils'

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
