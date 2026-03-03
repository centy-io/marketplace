export default function Sparkline({ data }: { data: number[] }) {
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
