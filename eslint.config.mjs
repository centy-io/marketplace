import nextConfig from 'eslint-config-next'

export default [
  ...nextConfig,
  {
    ignores: ['out', '.next', 'node_modules', '.centy', 'commitlint.config.js', 'eslint.config.mjs', 'playwright.config.ts', 'tests/**'],
  },
]
