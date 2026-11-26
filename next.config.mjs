/** @type {import('next').NextConfig} */
const nextConfig = {

  typescript: {
    ignoreBuildErrors: true,
  },

  // Permanent (308) redirects for URLs that were merged or retired during the
  // SEO clean-up, so any links / indexed copies pass their signals on instead
  // of 404-ing.
  async redirects() {
    return [
      // Bharath College area page duplicated /areas/selaiyur (same streets);
      // merged into Selaiyur.
      { source: '/areas/bharath-college', destination: '/areas/selaiyur', permanent: true },
      // There is no "Fruits & Vegetables" category in the shop — the fruit
      // range lives at /products. The old page was always empty.
      { source: '/category/fruits-vegetables', destination: '/products', permanent: true },
    ]
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
