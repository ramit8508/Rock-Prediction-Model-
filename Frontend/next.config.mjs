/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizeCss: true,
  },
  productionBrowserSourceMaps: false,
  webpack: (config, { isServer }) => {
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [import.meta.url],
      },
    }
    return config
  },
}

export default nextConfig
