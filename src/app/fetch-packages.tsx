import { cache } from 'react'
import type { Pkg, NpmSearchResult } from './types'

function isCentyPackage(name: string): boolean {
  return name.startsWith('centy-')
}

export const fetchPackages = cache(async (): Promise<Pkg[]> => {
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
      downloads: { 'last-week': null, 'last-month': null, 'all-time': null },
      unpackedSize: null,
      publishedAt: null,
    }))
})
