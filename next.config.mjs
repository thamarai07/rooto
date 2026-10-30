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
        hostname: 'seashell-skunk-617240.hostingersite.com',
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

// Cloudflare bindings emulation (spawns workerd) is only needed for `next dev`.
// Running it during `next build` crashes the build when workerd can't start.
if (process.env.NODE_ENV === 'development') {
  import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
}
