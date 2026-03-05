import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'deweuqoukaoxqgezhzfj.supabase.co',
        port: '',
        pathname: '/storage/v1/render/image/public/**', 
      },
      {
        protocol: 'https',
        hostname: 'deweuqoukaoxqgezhzfj.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '**', 
        port: '',
        pathname: '/**',
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/:path*",
        destination: "https://assettrackr-api.vercel.app/:path*",
      },
      {
        source: "/logo/:path*",
        destination: "https://logo.dev/:path*",
      },
    ];
  },
};

export default nextConfig;
