import { PeriodToggle } from './period-toggle'
import { fetchPackages } from './fetch-packages'
import { fetchStats } from './fetch-stats'
import { fetchSizes, fetchPublishDates } from './fetch-metadata'
import { fetchSparklines } from './fetch-sparklines'
import PkgRow from './PkgRow'
import type { Pkg } from './types'

export default async function PackageList() {
  const discovered = await fetchPackages()
  const [stats, sizes, sparklines, dates] = await Promise.all([
    fetchStats(discovered),
    fetchSizes(discovered),
    fetchSparklines(discovered),
    fetchPublishDates(discovered),
  ])

  const packages: Pkg[] = discovered.map(pkg => {
    const pkgStats = stats.get(pkg.name)
    const sizeValue = sizes.get(pkg.name)
    const dateStr = dates.get(pkg.name)
    return {
      ...pkg,
      downloads: pkgStats !== undefined ? pkgStats : pkg.downloads,
      unpackedSize: sizeValue !== undefined ? sizeValue : null,
      publishedAt: dateStr !== undefined ? dateStr : null,
    }
  })

  return (
    <>
      <div className="section-header animate-in">
        <span className="name">PACKAGES</span>
        <span className="line" />
        <PeriodToggle />
      </div>

      <div className="animate-in pkg-list">
        {packages.map((pkg, i) => (
          <PkgRow
            key={pkg.name}
            pkg={pkg}
            delay={100 + i * 40}
            sparkline={sparklines.get(pkg.name)}
          />
        ))}
      </div>

      {/* Official badge note */}
      <div className="animate-in pkg-badge-note">
        <span className="badge badge-official">✓ official</span>
        <span className="pkg-badge-note-text">
          All listed packages are officially maintained by the Centy team
        </span>
      </div>
    </>
  )
}
