import { Suspense, cache } from 'react'
import type { Metadata } from 'next'
import { HeaderStatsSkeleton, SectionSkeleton } from './skeletons'
import CopyButton from './CopyButton'
import PackageManagerToggle from './PackageManagerToggle'

export const metadata: Metadata = {
  title: 'Centy · npm Packages',
  description: 'All npm packages in the Centy ecosystem',
}

interface Pkg {
  name: string
  version: string
  description: string
  downloads: number | null
  unpackedSize: number | null
  publishedAt: string | null
}

interface NpmSearchResult {
  objects: Array<{
    package: {
      name: string
      version: string
      description: string
    }
  }>
}

interface NpmRangeResult {
  downloads: Array<{ day: string; downloads: number }>
}

function isCentyPackage(name: string): boolean {
  return name.startsWith('centy-')
}

const fetchPackages = cache(async (): Promise<Pkg[]> => {
  const res = await fetch(
    'https://registry.npmjs.org/-/v1/search?text=centy-&size=50',
    { next: { revalidate: 3600 } }
  )
  if (!res.ok) return []
  const data: NpmSearchResult = await res.json()
  return data.objects
    .map(o => o.package)
    .filter(pkg => isCentyPackage(pkg.name))
    .map(pkg => ({
      name: pkg.name,
      version: pkg.version,
      description: pkg.description,
      downloads: null,
      unpackedSize: null,
      publishedAt: null,
    }))
})

const fetchStats = cache(
  async (packages: Pkg[]): Promise<Map<string, number>> => {
    const map = new Map<string, number>()
    await Promise.allSettled(
      packages.map(async pkg => {
        try {
          const res = await fetch(
            `https://api.npmjs.org/downloads/point/last-month/${encodeURIComponent(pkg.name)}`,
            { cache: 'force-cache' }
          )
          if (!res.ok) return
          const data: { downloads?: number } = await res.json()
          if (typeof data.downloads === 'number') {
            map.set(pkg.name, data.downloads)
          }
        } catch {
          // ignore
        }
      })
    )
    return map
  }
)

const fetchSizes = cache(
  async (packages: Pkg[]): Promise<Map<string, number>> => {
    const map = new Map<string, number>()
    await Promise.allSettled(
      packages.map(async pkg => {
        try {
          const res = await fetch(
            `https://registry.npmjs.org/${encodeURIComponent(pkg.name)}/latest`,
            { next: { revalidate: 3600 } }
          )
          if (!res.ok) return
          const data: { dist?: { unpackedSize?: number } } = await res.json()
          if (
            data.dist !== undefined &&
            typeof data.dist.unpackedSize === 'number'
          ) {
            map.set(pkg.name, data.dist.unpackedSize)
          }
        } catch {
          // ignore
        }
      })
    )
    return map
  }
)

const fetchSparklines = cache(
  async (packages: Pkg[]): Promise<Map<string, number[]>> => {
    const map = new Map<string, number[]>()
    await Promise.allSettled(
      packages.map(async pkg => {
        try {
          const res = await fetch(
            `https://api.npmjs.org/downloads/range/last-year/${encodeURIComponent(pkg.name)}`,
            { cache: 'force-cache' }
          )
          if (!res.ok) return
          const data: NpmRangeResult = await res.json()
          const monthly = new Map<string, number>()
          for (const { day, downloads } of data.downloads) {
            const month = day.slice(0, 7)
            const prev = monthly.get(month)
            monthly.set(month, (prev !== undefined ? prev : 0) + downloads)
          }
          const sorted = Array.from(monthly.keys()).sort()
          const points = sorted.slice(-12).map(m => {
            const v = monthly.get(m)
            return v !== undefined ? v : 0
          })
          if (points.length >= 2) map.set(pkg.name, points)
        } catch {
          // ignore
        }
      })
    )
    return map
  }
)

interface NpmRegistryTime {
  modified?: string
}

interface NpmRegistryResponse {
  time?: NpmRegistryTime
}

const fetchPublishDates = cache(
  async (packages: Pkg[]): Promise<Map<string, string>> => {
    const map = new Map<string, string>()
    await Promise.allSettled(
      packages.map(async pkg => {
        try {
          const res = await fetch(
            `https://registry.npmjs.org/${encodeURIComponent(pkg.name)}`,
            { cache: 'force-cache' }
          )
          if (!res.ok) return
          const data: NpmRegistryResponse = await res.json()
          const time = data.time
          if (time === null || time === undefined) return
          const modified = time.modified
          if (typeof modified === 'string') {
            map.set(pkg.name, modified)
          }
        } catch {
          // ignore
        }
      })
    )
    return map
  }
)

function fmtRelativeDate(iso: string | null): string {
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

function fmtBytes(n: number | null): string {
  if (n === null) return '—'
  if (n < 1000) return `${n} B`
  if (n < 1_000_000) return `${(n / 1000).toFixed(1)} kB`
  return `${(n / 1_000_000).toFixed(1)} MB`
}

function fmt(n: number | null): string {
  if (n === null) return '—'
  return n.toLocaleString('en-US')
}

function npmUrl(name: string): string {
  return `https://www.npmjs.com/package/${encodeURIComponent(name)}`
}

function Sparkline({ data }: { data: number[] }) {
  const W = 56
  const H = 20
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data
    .map((v, i) => {
      const x = ((i / (data.length - 1)) * W).toFixed(1)
      const y = (H - ((v - min) / range) * (H - 4) - 2).toFixed(1)
      return `${x},${y}`
    })
    .join(' ')
  const mid = Math.floor(data.length / 2)
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
  const overall = avg(data)
  const threshold = overall * 0.05
  const trend = avg(data.slice(mid)) - avg(data.slice(0, mid))
  const stroke =
    trend > threshold
      ? 'var(--c-green)'
      : trend < -threshold
        ? '#e05c5c'
        : 'var(--c-muted)'
  return (
    <svg width={W} height={H} aria-hidden="true" className="pkg-sparkline">
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ── Async data components ────────────────────────────────────────────────────

async function HeaderStats() {
  const discovered = await fetchPackages()
  const stats = await fetchStats(discovered)
  const totalDownloads = discovered.reduce((s, p) => {
    const d = stats.get(p.name)
    return s + (d !== undefined ? d : p.downloads !== null ? p.downloads : 0)
  }, 0)

  return (
    <div className="header-stats">
      <div className="header-stats-label">TOTAL DOWNLOADS / MONTH</div>
      <div className="header-stats-total">
        {totalDownloads.toLocaleString('en-US')}
      </div>
      <div className="header-stats-count">
        across {discovered.length} packages
      </div>
    </div>
  )
}

function PkgRow({
  pkg,
  delay,
  sparkline,
}: {
  pkg: Pkg
  delay: number
  sparkline: number[] | undefined
}) {
  return (
    <div
      className="pkg-row animate-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* indicator dot */}
      <span className="pkg-dot" />

      {/* name + description */}
      <div className="pkg-name-col">
        <a
          className="pkg-link"
          href={npmUrl(pkg.name)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {pkg.name}
        </a>
        <p className="pkg-desc">{pkg.description}</p>
      </div>

      {/* version */}
      <span className="pkg-version">v{pkg.version}</span>

      {/* publish date */}
      <span className="pkg-date">{fmtRelativeDate(pkg.publishedAt)}</span>

      {/* sparkline */}
      {sparkline !== undefined && sparkline.length >= 2 ? (
        <Sparkline data={sparkline} />
      ) : (
        <span aria-hidden="true" className="pkg-sparkline" />
      )}

      {/* downloads */}
      <span className="pkg-downloads">
        <span className="pkg-dl-arrow">↓</span>
        <span className="pkg-dl-count">{fmt(pkg.downloads)}</span>
        {pkg.downloads !== null && <span className="pkg-dl-unit">/mo</span>}
      </span>

      {/* unpacked size */}
      <span className="pkg-size">
        <span className="pkg-size-icon">⊞</span>
        <span className="pkg-size-val">{fmtBytes(pkg.unpackedSize)}</span>
      </span>

      {/* npm link */}
      <a
        href={npmUrl(pkg.name)}
        target="_blank"
        rel="noopener noreferrer"
        className="npm-link"
      >
        npm ↗
      </a>

      {/* copy install command */}
      <CopyButton pkgName={pkg.name} />
    </div>
  )
}

async function PackageList() {
  const discovered = await fetchPackages()
  const [stats, sizes, sparklines, dates] = await Promise.all([
    fetchStats(discovered),
    fetchSizes(discovered),
    fetchSparklines(discovered),
    fetchPublishDates(discovered),
  ])

  const packages: Pkg[] = discovered.map(pkg => {
    const statsDownloads = stats.get(pkg.name)
    const sizeValue = sizes.get(pkg.name)
    const dateStr = dates.get(pkg.name)
    return {
      ...pkg,
      downloads: statsDownloads !== undefined ? statsDownloads : pkg.downloads,
      unpackedSize: sizeValue !== undefined ? sizeValue : null,
      publishedAt: dateStr !== undefined ? dateStr : null,
    }
  })

  return (
    <>
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

// ── Page shell ───────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <main className="page-main">
      {/* Top amber line */}
      <div className="top-accent-line" />

      {/* Header */}
      <header className="animate-in header-outer">
        <div className="header-inner">
          <div className="header-flex">
            {/* Title */}
            <div className="header-title">
              <div className="header-title-row">
                <span className="header-logo">CENTY</span>
                <span className="header-subtitle">PACKAGES</span>
              </div>
              <p className="header-tagline">
                npm packages in the Centy ecosystem
              </p>
            </div>

            {/* Stats — streams in independently */}
            <Suspense fallback={<HeaderStatsSkeleton />}>
              <HeaderStats />
            </Suspense>
          </div>
        </div>
      </header>

      {/* Package list */}
      <div className="main-content">
        <PackageManagerToggle />
        <Suspense fallback={<SectionSkeleton rowCount={9} />}>
          <PackageList />
        </Suspense>
      </div>

      {/* Footer */}
      <footer className="page-footer">
        <p className="footer-text">
          Data sourced from{' '}
          <a
            href="https://www.npmjs.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            npmjs.com
          </a>{' '}
          · Updated at build time · All packages are official Centy releases
        </p>
      </footer>
    </main>
  )
}
