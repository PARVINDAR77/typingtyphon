import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@typingtyphon/contracts'],
  reactStrictMode: true,
  devIndicators: false,
};

export default nextConfig;
