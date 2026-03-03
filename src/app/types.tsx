import type { Period } from './period-context'

export interface Pkg {
  name: string
  version: string
  description: string
  downloads: Record<Period, number | null>
  unpackedSize: number | null
  publishedAt: string | null
}

export interface NpmSearchResult {
  objects: Array<{
    package: {
      name: string
      version: string
      description: string
    }
  }>
}

export interface NpmRangeResult {
  downloads: Array<{ day: string; downloads: number }>
}

export interface NpmRegistryTime {
  modified?: string
}

export interface NpmRegistryResponse {
  time?: NpmRegistryTime
}
