import { http, HttpResponse } from 'msw'

const MOCK_DOWNLOADS: Record<string, number> = {
  centy: 2049,
  'centy-plugin-persona': 150,
  '@centy-io/centy-installer': 222,
  '@centy-io/centy-installer-darwin-arm64': 198,
  '@centy-io/centy-installer-darwin-x64': 201,
  '@centy-io/centy-installer-linux-x64': 227,
  '@centy-io/centy-installer-linux-arm64': 199,
  '@centy-io/centy-installer-win32-x64': 212,
  '@centy-io/assets': 558,
}

export const handlers = [
  http.get(
    'https://api.npmjs.org/downloads/point/last-month/:package',
    ({ params }) => {
      const pkg = decodeURIComponent(String(params.package))
      const downloads = Object.prototype.hasOwnProperty.call(
        MOCK_DOWNLOADS,
        pkg
      )
        ? MOCK_DOWNLOADS[pkg]
        : 100
      return HttpResponse.json({
        downloads,
        package: pkg,
        start: '2026-01-01',
        end: '2026-01-31',
      })
    }
  ),
]
