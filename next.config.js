/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: 'canvas' }];  // required by replicate
    return config;
  },
}

module.exports = nextConfig
