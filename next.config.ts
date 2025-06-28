// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ylbxpomrxdmmlmpnrfvb.supabase.co',
        pathname: '/storage/v1/object/public/photostrips/**',
      },
    ],
  },
};

module.exports = nextConfig;
