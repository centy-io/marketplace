# Marketplace

The Centy marketplace — a Next.js app listing available packages.

## Scripts

| Script                  | Description                                        |
| ----------------------- | -------------------------------------------------- |
| `pnpm dev`              | Start the development server                       |
| `pnpm build`            | Build the production app                           |
| `pnpm start`            | Start the production server                        |
| `pnpm lint`             | Run ESLint                                         |
| `pnpm format`           | Format source files with Prettier                  |
| `pnpm spell`            | Run spell check                                    |
| `pnpm test:screenshots` | Run Playwright screenshot tests                    |
| `pnpm analyze`          | Build with webpack and open the bundle size report |

## Bundle Analysis

Run `pnpm analyze` to generate an interactive bundle size report. This builds the
app using webpack with `ANALYZE=true` which enables `@next/bundle-analyzer` and
opens the report in your browser once the build completes.

Normal `pnpm build` (Turbopack) is unaffected — the analyzer only runs when
`ANALYZE=true` is set.
