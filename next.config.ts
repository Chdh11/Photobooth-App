// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dgfzwksxczyedxpukmnb.supabase.co',
        pathname: '/storage/v1/object/public/photostripes/**',
      },
    ],
  },
};

module.exports = nextConfig;
