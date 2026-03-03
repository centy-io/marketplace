import { cache } from 'react'
import type { Pkg, NpmRegistryResponse } from './types'

export const fetchSizes = cache(
  async (packages: Pkg[]): Promise<Map<string, number>> => {
    const map = new Map<string, number>()
    await Promise.allSettled(
      packages.map(async pkg => {
        try {
          const res = await fetch(
            `https://registry.npmjs.org/${encodeURIComponent(pkg.name)}/latest`,
            { next: { revalidate: 3600 } }
          )
          if (!res.ok) return
          const data: { dist?: { unpackedSize?: number } } = await res.json()
          if (
            data.dist !== undefined &&
            typeof data.dist.unpackedSize === 'number'
          ) {
            map.set(pkg.name, data.dist.unpackedSize)
          }
        } catch {
          // ignore
        }
      })
    )
    return map
  }
)

export const fetchPublishDates = cache(
  async (packages: Pkg[]): Promise<Map<string, string>> => {
    const map = new Map<string, string>()
    await Promise.allSettled(
      packages.map(async pkg => {
        try {
          const res = await fetch(
            `https://registry.npmjs.org/${encodeURIComponent(pkg.name)}`,
            { cache: 'force-cache' }
          )
          if (!res.ok) return
          const data: NpmRegistryResponse = await res.json()
          const time = data.time
          if (time === null || time === undefined) return
          const modified = time.modified
          if (typeof modified === 'string') {
            map.set(pkg.name, modified)
          }
        } catch {
          // ignore
        }
      })
    )
    return map
  }
)
