import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      new URL('https://file.garden/**')
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
