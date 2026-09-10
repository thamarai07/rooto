import { MetadataRoute } from 'next'

const BASE_URL = 'https://rooto.in'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Private / user-specific / transactional routes — never useful in search.
        disallow: [
          '/api/',
          '/admin/',
          '/checkout/',
          '/account/',
          '/cart',
          '/orders',
          '/addresses',
          '/wishlist',
          '/reset-password',
          '/_next/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
