function PkgRowSkeleton() {
  return (
    <div className="pkg-row" aria-hidden="true">
      <span
        style={{
          display: 'inline-block',
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          background: 'var(--c-bg3)',
          alignSelf: 'center',
          flexShrink: 0,
        }}
      />
      <div
        style={{
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
        }}
      >
        <div className="skeleton" style={{ height: '0.75rem', width: '55%' }} />
        <div className="skeleton" style={{ height: '0.6rem', width: '75%' }} />
      </div>
      <div className="skeleton" style={{ height: '0.7rem', width: '3.5rem' }} />
      <div className="skeleton" style={{ height: '0.7rem', width: '5rem' }} />
      <div
        className="skeleton"
        style={{ height: '0.65rem', width: '2.5rem' }}
      />
    </div>
  )
}

export function SectionSkeleton({ rowCount }: { rowCount: number }) {
  return (
    <div aria-busy="true" aria-label="Loading packages">
      <div className="section-header">
        <div className="skeleton" style={{ height: '0.7rem', width: '4rem' }} />
        <span className="line" />
        <div className="skeleton" style={{ height: '0.7rem', width: '7rem' }} />
      </div>
      <div
        style={{
          border: '1px solid var(--c-border)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
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
      style={{ textAlign: 'right', flexShrink: 0 }}
      aria-busy="true"
      aria-label="Loading download statistics"
    >
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
        className="skeleton"
        style={{ height: '2rem', width: '7rem', marginLeft: 'auto' }}
      />
      <div
        className="skeleton"
        style={{
          height: '0.65rem',
          width: '9rem',
          marginTop: '0.4rem',
          marginLeft: 'auto',
        }}
      />
    </div>
  )
}
