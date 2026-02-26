function PkgRowSkeleton() {
  return (
    <div className="pkg-row" aria-hidden="true">
      <span className="pkg-dot-skeleton" />
      <div className="skeleton-name-col">
        <div className="skeleton skeleton-pkg-name" />
        <div className="skeleton skeleton-pkg-desc" />
      </div>
      <div className="skeleton skeleton-ver-md" />
      <div className="skeleton pkg-date skeleton-date" />
      <div className="skeleton pkg-sparkline" />
      <div className="skeleton skeleton-ver-lg" />
      <div className="skeleton skeleton-dl" />
    </div>
  )
}

export function SectionSkeleton({ rowCount }: { rowCount: number }) {
  return (
    <div
      className="section-loading"
      aria-busy="true"
      aria-label="Loading packages"
    >
      <div className="section-header">
        <div className="skeleton skeleton-label-sm" />
        <span className="line" />
        <div className="skeleton skeleton-label-lg" />
      </div>
      <div className="skeleton-section-list">
        {Array.from({ length: rowCount }, (_, i) => (
          <PkgRowSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export function HeaderStatsSkeleton() {
  return (
    <div
      className="header-stats"
      aria-busy="true"
      aria-label="Loading download statistics"
    >
      <div className="header-stats-label">TOTAL DOWNLOADS / MONTH</div>
      <div className="skeleton skeleton-total" />
      <div className="skeleton skeleton-total-count" />
    </div>
  )
}
