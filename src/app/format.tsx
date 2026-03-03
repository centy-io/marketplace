export function fmtRelativeDate(iso: string | null): string {
  if (iso === null) return '—'
  const date = new Date(iso)
  if (isNaN(date.getTime())) return '—'
  const diffMs = date.getTime() - Date.now()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  if (Math.abs(diffDays) < 1) return 'today'
  if (Math.abs(diffDays) < 30) return rtf.format(diffDays, 'day')
  const diffMonths = Math.round(diffDays / 30.44)
  if (Math.abs(diffMonths) < 12) return rtf.format(diffMonths, 'month')
  const diffYears = Math.round(diffDays / 365.25)
  return rtf.format(diffYears, 'year')
}

export function fmtBytes(n: number | null): string {
  if (n === null) return '—'
  if (n < 1000) return `${n} B`
  if (n < 1_000_000) return `${(n / 1000).toFixed(1)} kB`
  return `${(n / 1_000_000).toFixed(1)} MB`
}

export function npmUrl(name: string): string {
  return `https://www.npmjs.com/package/${encodeURIComponent(name)}`
}
