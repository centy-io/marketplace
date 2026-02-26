import agentConfig from 'eslint-config-agent'
import nextConfig from 'eslint-config-next'

// Build a map of plugin instances from nextConfig (takes precedence for shared plugins).
const nextPlugins = Object.fromEntries(
  nextConfig.flatMap((c) => (c.plugins ? Object.entries(c.plugins) : []))
)

// For each agentConfig entry that registers plugins also present in nextConfig,
// replace the plugin instance with the one from nextConfig so ESLint sees a
// single registration and won't throw "Cannot redefine plugin".
const agentConfigNormalized = agentConfig.map((c) => {
  if (!c.plugins) return c
  const normalizedPlugins = Object.fromEntries(
    Object.entries(c.plugins).map(([name, plugin]) =>
      name in nextPlugins ? [name, nextPlugins[name]] : [name, plugin]
    )
  )
  return { ...c, plugins: normalizedPlugins }
})

export default [
  ...nextConfig,
  ...agentConfigNormalized,
  {
    ignores: ['out', '.next', 'node_modules', '.centy', 'commitlint.config.js', 'eslint.config.mjs', 'playwright.config.ts', 'tests/**'],
  },
  {
    // Project-specific overrides: disable rules that are not appropriate for this codebase.
    rules: {
      // npm registry URLs are intentional constants, not secrets or configurable endpoints.
      'default/no-hardcoded-urls': 'off',
      // Next.js pages are legitimately larger than generic 100/70-line limits.
      'max-lines': ['warn', { max: 600, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    // Next.js config and instrumentation files: process.env access is framework-required here.
    files: ['next.config.ts', 'src/instrumentation.ts'],
    rules: {
      'ddd/require-spec-file': 'off',
      'no-restricted-syntax': 'off',
    },
  },
  {
    // MSW mock files: spec files and url-hardcoding rules don't apply to test infrastructure.
    files: ['src/mocks/**'],
    rules: {
      'ddd/require-spec-file': 'off',
      'default/no-hardcoded-urls': 'off',
      'security/detect-object-injection': 'off',
    },
  },
]
