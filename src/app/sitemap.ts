import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://marketplace.centy.io',
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]
}
