import bundleAnalyzer from '@next/bundle-analyzer'
import type { NextConfig } from 'next'

const { ANALYZE } = process.env
const withBundleAnalyzer = bundleAnalyzer({
  enabled: ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  output: 'export',
}

export default withBundleAnalyzer(nextConfig)
