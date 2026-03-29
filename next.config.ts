import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'welab-assets-2026.s3.eu-central-1.amazonaws.com',
        port: '',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
