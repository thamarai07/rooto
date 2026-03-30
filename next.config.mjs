/** @type {import('next').NextConfig} */
const nextConfig = {

  typescript: {
    ignoreBuildErrors: true,
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  images: {
    unoptimized: true,  // 👈 ADD THIS (IMPORTANT for static export)
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/vfs_portal/vfs-admin/assets/images/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'rootoportal.onrender.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.rooto.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'rooto.in',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
