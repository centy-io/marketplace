import { http, HttpResponse } from 'msw'

function buildYearlyDownloads(
  startIso: string,
  endIso: string
): Array<{ day: string; downloads: number }> {
  const result: Array<{ day: string; downloads: number }> = []
  const cursor = new Date(startIso)
  const last = new Date(endIso)
  let i = 0
  while (cursor <= last) {
    result.push({
      day: cursor.toISOString().slice(0, 10),
      downloads: 5 + (i % 8),
    })
    cursor.setDate(cursor.getDate() + 1)
    i++
  }
  return result
}

export const handlers = [
  http.get(
    'https://api.npmjs.org/downloads/point/last-month/:package',
    ({ params }) => {
      const pkg = decodeURIComponent(String(params.package))
      return HttpResponse.json({
        downloads: 100,
        package: pkg,
        start: '2026-01-01',
        end: '2026-01-31',
      })
    }
  ),
  http.get('https://registry.npmjs.org/:package/latest', ({ params }) => {
    const pkg = decodeURIComponent(String(params.package))
    return HttpResponse.json({
      name: pkg,
      version: '1.0.0',
      dist: {
        unpackedSize: 12345,
      },
    })
  }),
  http.get(
    'https://api.npmjs.org/downloads/range/last-year/:package',
    ({ params }) => {
      const pkg = decodeURIComponent(String(params.package))
      const start = '2025-02-26'
      const end = '2026-02-25'
      return HttpResponse.json({
        package: pkg,
        start,
        end,
        downloads: buildYearlyDownloads(start, end),
      })
    }
  ),
  http.get('https://registry.npmjs.org/:package', ({ params }) => {
    const pkg = decodeURIComponent(String(params.package))
    return HttpResponse.json({
      name: pkg,
      time: {
        modified: '2026-02-01T00:00:00.000Z',
      },
    })
  }),
]
