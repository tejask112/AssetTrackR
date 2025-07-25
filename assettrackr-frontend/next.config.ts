import { NextConfig } from 'next';

const nextConfig: NextConfig = {

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.logo.dev',  
        pathname: '/**',       
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*', 
        destination: 'http://localhost:5000/api/:path*',
      },
      {
        source: '/logo/:path*',
        destination: 'https://logo.dev/:path*',
      },
    ];
  },
};

export default nextConfig;
