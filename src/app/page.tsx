import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Centy · npm Packages',
  description: 'All npm packages in the Centy ecosystem',
}

interface Pkg {
  name: string
  version: string
  description: string
  downloads: number | null
  group: 'core' | 'installer' | 'platform' | 'assets'
}

const FALLBACK: Pkg[] = [
  {
    name: 'centy',
    version: '0.7.8',
    description:
      'CLI for managing project issues and docs via code in the .centy folder',
    downloads: 2049,
    group: 'core',
  },
  {
    name: 'centy-plugin-persona',
    version: '0.1.4',
    description: 'Persona CLI by Centy',
    downloads: null,
    group: 'core',
  },
  {
    name: '@centy-io/centy-installer',
    version: '0.1.1',
    description: 'Multi-ecosystem installer for the centy-daemon binary',
    downloads: 222,
    group: 'installer',
  },
  {
    name: '@centy-io/centy-installer-darwin-arm64',
    version: '0.1.1',
    description: 'macOS ARM64',
    downloads: 198,
    group: 'platform',
  },
  {
    name: '@centy-io/centy-installer-darwin-x64',
    version: '0.1.1',
    description: 'macOS x64',
    downloads: 201,
    group: 'platform',
  },
  {
    name: '@centy-io/centy-installer-linux-x64',
    version: '0.1.1',
    description: 'Linux x64',
    downloads: 227,
    group: 'platform',
  },
  {
    name: '@centy-io/centy-installer-linux-arm64',
    version: '0.1.1',
    description: 'Linux ARM64',
    downloads: 199,
    group: 'platform',
  },
  {
    name: '@centy-io/centy-installer-win32-x64',
    version: '0.1.1',
    description: 'Windows x64',
    downloads: 212,
    group: 'platform',
  },
  {
    name: '@centy-io/assets',
    version: '0.0.1',
    description: 'Centy brand assets — logos, icons, and design resources',
    downloads: 558,
    group: 'assets',
  },
]

async function fetchStats(): Promise<Map<string, number>> {
  const map = new Map<string, number>()
  await Promise.allSettled(
    FALLBACK.map(async pkg => {
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
        // fall back to hardcoded value
      }
    })
  )
  return map
}

function fmt(n: number | null): string {
  if (n === null) return '—'
  return n.toLocaleString('en-US')
}

function npmUrl(name: string): string {
  return `https://www.npmjs.com/package/${encodeURIComponent(name)}`
}

function SectionHeader({
  title,
  count,
  delay,
}: {
  title: string
  count: number
  delay: number
}) {
  return (
    <div
      className="section-header animate-in"
      style={{ animationDelay: `${delay}ms`, opacity: 0 }}
    >
      <span className="name">{title}</span>
      <span className="line" />
      <span style={{ whiteSpace: 'nowrap' }}>
        {count} package{count !== 1 ? 's' : ''}
      </span>
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
    </div>
  )
}

export default async function Home() {
  const stats = await fetchStats()

  const packages: Pkg[] = FALLBACK.map(pkg => {
    const statsDownloads = stats.get(pkg.name)
    return {
      ...pkg,
      downloads: statsDownloads !== undefined ? statsDownloads : pkg.downloads,
    }
  })

  const core = packages.filter(p => p.group === 'core')
  const installer = packages.filter(p => p.group === 'installer')
  const platform = packages.filter(p => p.group === 'platform')
  const assets = packages.filter(p => p.group === 'assets')

  const totalDownloads = packages.reduce(
    (s, p) => s + (p.downloads !== null ? p.downloads : 0),
    0
  )

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
        className="animate-in"
        style={{
          borderBottom: '1px solid var(--c-border)',
          padding: '2.5rem 2rem 2rem',
          animationDelay: '0ms',
          opacity: 0,
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '2rem',
            }}
          >
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

            {/* Stats */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
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
                across {packages.length} packages
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Package registry */}
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '0 2rem 4rem',
        }}
      >
        {/* CORE */}
        <SectionHeader title="CORE" count={core.length} delay={100} />
        <div
          className="animate-in"
          style={{
            border: '1px solid var(--c-border)',
            borderRadius: '4px',
            overflow: 'hidden',
            animationDelay: '150ms',
            opacity: 0,
          }}
        >
          {core.map((pkg, i) => (
            <PkgRow key={pkg.name} pkg={pkg} delay={150 + i * 40} />
          ))}
        </div>

        {/* INSTALLER */}
        <SectionHeader
          title="INSTALLER"
          count={installer.length + platform.length}
          delay={300}
        />
        <div
          className="animate-in"
          style={{
            border: '1px solid var(--c-border)',
            borderRadius: '4px',
            overflow: 'hidden',
            animationDelay: '350ms',
            opacity: 0,
          }}
        >
          {installer.map((pkg, i) => (
            <PkgRow key={pkg.name} pkg={pkg} delay={350 + i * 40} />
          ))}

          {/* Platform binaries sub-table */}
          <div
            className="animate-in"
            style={{
              borderTop: '1px solid var(--c-border)',
              background: 'var(--c-bg2)',
              animationDelay: '400ms',
              opacity: 0,
            }}
          >
            <div
              style={{
                padding: '0.5rem 1rem 0.35rem 2.5rem',
                fontSize: '0.62rem',
                color: 'var(--c-muted)',
                letterSpacing: '0.12em',
                borderBottom: '1px solid var(--c-border)',
              }}
            >
              PLATFORM BINARIES
            </div>
            {platform.map(pkg => (
              <div key={pkg.name} className="platform-row">
                <a
                  className="pkg-link"
                  href={npmUrl(pkg.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.72rem' }}
                >
                  {pkg.name}
                </a>
                <span style={{ color: 'var(--c-muted)', fontSize: '0.68rem' }}>
                  {pkg.description}
                </span>
                <span
                  style={{
                    color: 'var(--c-muted)',
                    fontSize: '0.68rem',
                    textAlign: 'right',
                  }}
                >
                  <span style={{ marginRight: '0.25rem' }}>↓</span>
                  {fmt(pkg.downloads)}
                  {pkg.downloads !== null && (
                    <span style={{ fontSize: '0.6rem' }}>/mo</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ASSETS */}
        <SectionHeader title="ASSETS" count={assets.length} delay={520} />
        <div
          className="animate-in"
          style={{
            border: '1px solid var(--c-border)',
            borderRadius: '4px',
            overflow: 'hidden',
            animationDelay: '570ms',
            opacity: 0,
          }}
        >
          {assets.map((pkg, i) => (
            <PkgRow key={pkg.name} pkg={pkg} delay={570 + i * 40} />
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
            animationDelay: '650ms',
            opacity: 0,
          }}
        >
          <span className="badge badge-official">✓ official</span>
          <span>
            All listed packages are officially maintained by the Centy team
          </span>
        </div>
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
