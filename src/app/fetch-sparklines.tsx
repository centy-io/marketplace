import { cache } from 'react'
import type { Pkg, NpmRangeResult } from './types'

export const fetchSparklines = cache(
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
