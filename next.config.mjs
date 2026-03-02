/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Strip console.log from production bundles automatically
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  images: {
    remotePatterns: [
      // Local development
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/vfs_portal/vfs-admin/assets/images/uploads/**',
      },
      // Production — Update 'api.rooto.in' to wherever your images are served from
      {
        protocol: 'https',
        hostname: 'api.rooto.in',
        pathname: '/**',
      },
      // Allow any rooto.in subdomain for flexibility
      {
        protocol: 'https',
        hostname: '**.rooto.in',
        pathname: '/**',
      },
      // Allow rooto.in base domain
      {
        protocol: 'https',
        hostname: 'rooto.in',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
