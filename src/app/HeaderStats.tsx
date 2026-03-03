import { fetchPackages } from './fetch-packages'
import { fetchStats } from './fetch-stats'
import { HeaderTotalsDisplay } from './period-toggle'
import type { Period } from './period-context'

export default async function HeaderStats() {
  const discovered = await fetchPackages()
  const stats = await fetchStats(discovered)

  const totals: Record<Period, number> = {
    'last-week': 0,
    'last-month': 0,
    'all-time': 0,
  }
  for (const pkg of discovered) {
    const pkgStats = stats.get(pkg.name)
    if (pkgStats === undefined) continue
    const weekStat = pkgStats['last-week']
    const monthStat = pkgStats['last-month']
    const allStat = pkgStats['all-time']
    if (weekStat !== null) totals['last-week'] += weekStat
    if (monthStat !== null) totals['last-month'] += monthStat
    if (allStat !== null) totals['all-time'] += allStat
  }

  return (
    <HeaderTotalsDisplay totals={totals} packageCount={discovered.length} />
  )
}
