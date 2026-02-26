import { http, HttpResponse } from 'msw'

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
]
