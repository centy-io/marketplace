import CopyButton from './CopyButton'
import Sparkline from './Sparkline'
import { DownloadsCell } from './period-toggle'
import { fmtRelativeDate, fmtBytes, npmUrl } from './format'
import type { Pkg } from './types'

export default function PkgRow({
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
      <DownloadsCell downloads={pkg.downloads} />

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
