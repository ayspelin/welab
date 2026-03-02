import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'welab-assets-2026.s3.eu-central-1.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;
