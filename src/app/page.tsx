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
      <div
        style={{
          fontSize: '0.6rem',
          color: 'var(--c-muted)',
          letterSpacing: '0.15em',
          marginBottom: '0.35rem',
        }}
      >
        TOTAL DOWNLOADS / MONTH
      </div>
      <div
        style={{
          fontSize: '2rem',
          fontWeight: 600,
          color: 'var(--c-accent)',
          lineHeight: 1,
        }}
      >
        {totalDownloads.toLocaleString('en-US')}
      </div>
      <div
        style={{
          fontSize: '0.65rem',
          color: 'var(--c-muted)',
          marginTop: '0.4rem',
        }}
      >
        across {discovered.length} packages
      </div>
    </div>
  )
}

function PkgRow({ pkg, delay }: { pkg: Pkg; delay: number }) {
  return (
    <div
      className="pkg-row animate-in"
      style={{ animationDelay: `${delay}ms`, opacity: 0 }}
    >
      {/* indicator dot */}
      <span
        style={{
          display: 'inline-block',
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          background: 'var(--c-accent)',
          opacity: 0.7,
          alignSelf: 'center',
          flexShrink: 0,
        }}
      />

      {/* name + description */}
      <div style={{ minWidth: 0 }}>
        <a
          className="pkg-link"
          href={npmUrl(pkg.name)}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '0.85rem' }}
        >
          {pkg.name}
        </a>
        <p
          style={{
            color: 'var(--c-muted)',
            fontSize: '0.7rem',
            marginTop: '0.2rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {pkg.description}
        </p>
      </div>

      {/* version */}
      <span
        className="pkg-version"
        style={{
          color: 'var(--c-muted)',
          fontSize: '0.72rem',
          whiteSpace: 'nowrap',
          paddingTop: '0.15rem',
        }}
      >
        v{pkg.version}
      </span>

      {/* downloads */}
      <span
        style={{
          color: 'var(--c-text)',
          fontSize: '0.75rem',
          whiteSpace: 'nowrap',
          paddingTop: '0.15rem',
          textAlign: 'right',
          minWidth: '6rem',
        }}
      >
        <span style={{ color: 'var(--c-muted)', marginRight: '0.3rem' }}>
          ↓
        </span>
        <span style={{ fontWeight: 500 }}>{fmt(pkg.downloads)}</span>
        {pkg.downloads !== null && (
          <span style={{ color: 'var(--c-muted)', fontSize: '0.65rem' }}>
            /mo
          </span>
        )}
      </span>

      {/* npm link */}
      <a
        href={npmUrl(pkg.name)}
        target="_blank"
        rel="noopener noreferrer"
        className="npm-link"
        style={{ paddingTop: '0.15rem' }}
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
      <div
        className="animate-in"
        style={{
          border: '1px solid var(--c-border)',
          borderRadius: '4px',
          overflow: 'hidden',
          marginTop: '2rem',
          animationDelay: '100ms',
          opacity: 0,
        }}
      >
        {packages.map((pkg, i) => (
          <PkgRow key={pkg.name} pkg={pkg} delay={100 + i * 40} />
        ))}
      </div>

      {/* Official badge note */}
      <div
        className="animate-in"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '2rem',
          fontSize: '0.65rem',
          color: 'var(--c-muted)',
          animationDelay: '300ms',
          opacity: 0,
        }}
      >
        <span className="badge badge-official">✓ official</span>
        <span>
          All listed packages are officially maintained by the Centy team
        </span>
      </div>
    </>
  )
}

// ── Page shell ───────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--c-bg)',
        color: 'var(--c-text)',
        fontFamily: "'IBM Plex Mono', monospace",
      }}
    >
      {/* Top amber line */}
      <div
        style={{
          height: '2px',
          background:
            'linear-gradient(90deg, var(--c-accent) 0%, transparent 100%)',
        }}
      />

      {/* Header */}
      <header
        className="animate-in header-outer"
        style={{
          animationDelay: '0ms',
          opacity: 0,
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="header-flex">
            {/* Title */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '0.75rem',
                  marginBottom: '0.5rem',
                }}
              >
                <span
                  style={{
                    fontSize: '1.75rem',
                    fontWeight: 600,
                    color: 'var(--c-accent)',
                    letterSpacing: '0.12em',
                  }}
                >
                  CENTY
                </span>
                <span
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--c-muted)',
                    letterSpacing: '0.25em',
                    fontWeight: 300,
                  }}
                >
                  PACKAGES
                </span>
              </div>
              <p
                style={{
                  color: 'var(--c-muted)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.04em',
                }}
              >
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
      <footer
        style={{
          borderTop: '1px solid var(--c-border)',
          padding: '1.25rem 2rem',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            color: 'var(--c-muted)',
            fontSize: '0.65rem',
            letterSpacing: '0.05em',
          }}
        >
          Data sourced from{' '}
          <a
            href="https://www.npmjs.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--c-accent)',
              textDecoration: 'none',
            }}
          >
            npmjs.com
          </a>{' '}
          · Updated at build time · All packages are official Centy releases
        </p>
      </footer>
    </main>
  )
}
