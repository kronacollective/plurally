import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
      }
    ]
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/app',
        permanent: true,
      }
    ]
  }
};

export default nextConfig;
