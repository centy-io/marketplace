import { Suspense } from 'react'
import type { Metadata } from 'next'
import { HeaderStatsSkeleton, SectionSkeleton } from './skeletons'
import PackageManagerToggle from './PackageManagerToggle'
import { PeriodProvider } from './period-context'
import HeaderStats from './HeaderStats'
import PackageList from './PackageList'

export const metadata: Metadata = {
  title: 'Centy · npm Packages',
  description: 'All npm packages in the Centy ecosystem',
}

export default function Home() {
  return (
    <PeriodProvider>
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
    </PeriodProvider>
  )
}
