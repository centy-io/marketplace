import { Suspense, cache } from 'react'
import type { Metadata } from 'next'
import { HeaderStatsSkeleton, SectionSkeleton } from './skeletons'

export const metadata: Metadata = {
  title: 'Centy · npm Packages',
  description: 'All npm packages in the Centy ecosystem',
}

interface Pkg {
  name: string
  version: string
  description: string
  downloads: number | null
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

function fmt(n: number | null): string {
  if (n === null) return '—'
  return n.toLocaleString('en-US')
}

function npmUrl(name: string): string {
  return `https://www.npmjs.com/package/${encodeURIComponent(name)}`
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

function PkgRow({ pkg, delay }: { pkg: Pkg; delay: number }) {
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

      {/* downloads */}
      <span className="pkg-downloads">
        <span className="pkg-dl-arrow">↓</span>
        <span className="pkg-dl-count">{fmt(pkg.downloads)}</span>
        {pkg.downloads !== null && <span className="pkg-dl-unit">/mo</span>}
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
    </div>
  )
}

async function PackageList() {
  const discovered = await fetchPackages()
  const stats = await fetchStats(discovered)

  const packages: Pkg[] = discovered.map(pkg => {
    const statsDownloads = stats.get(pkg.name)
    return {
      ...pkg,
      downloads: statsDownloads !== undefined ? statsDownloads : pkg.downloads,
    }
  })

  return (
    <>
      <div className="animate-in pkg-list">
        {packages.map((pkg, i) => (
          <PkgRow key={pkg.name} pkg={pkg} delay={100 + i * 40} />
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
