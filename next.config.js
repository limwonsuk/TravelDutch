/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  reactStrictMode: false,
  output: 'export',
  basePath: isProd ? '/TravelDutch' : '',
  assetPrefix: isProd ? '/TravelDutch' : '',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

module.exports = nextConfig;
