import { cache } from 'react'
import type { Pkg } from './types'
import type { Period } from './period-context'

function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

export const fetchStats = cache(
  async (
    packages: Pkg[]
  ): Promise<Map<string, Record<Period, number | null>>> => {
    const map = new Map<string, Record<Period, number | null>>()
    await Promise.allSettled(
      packages.map(async pkg => {
        const encoded = encodeURIComponent(pkg.name)
        const opts = { next: { revalidate: 3600 } }
        const [weekRes, monthRes, allRes] = await Promise.allSettled([
          fetch(
            `https://api.npmjs.org/downloads/point/last-week/${encoded}`,
            opts
          ),
          fetch(
            `https://api.npmjs.org/downloads/point/last-month/${encoded}`,
            opts
          ),
          fetch(
            `https://api.npmjs.org/downloads/range/2000-01-01:${getToday()}/${encoded}`,
            opts
          ),
        ])

        let week: number | null = null
        if (weekRes.status === 'fulfilled' && weekRes.value.ok) {
          const weekData: { downloads?: number } = await weekRes.value.json()
          week =
            typeof weekData.downloads === 'number' ? weekData.downloads : null
        }

        let month: number | null = null
        if (monthRes.status === 'fulfilled' && monthRes.value.ok) {
          const monthData: { downloads?: number } = await monthRes.value.json()
          month =
            typeof monthData.downloads === 'number' ? monthData.downloads : null
        }

        let allTime: number | null = null
        if (allRes.status === 'fulfilled' && allRes.value.ok) {
          const allData: { downloads?: Array<{ downloads: number }> } =
            await allRes.value.json()
          if (Array.isArray(allData.downloads)) {
            allTime = allData.downloads.reduce((sum, d) => sum + d.downloads, 0)
          }
        }

        map.set(pkg.name, {
          'last-week': week,
          'last-month': month,
          'all-time': allTime,
        })
      })
    )
    return map
  }
)
