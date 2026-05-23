import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/checkout/',
          '/account/',
          '/cart',
          '/_next/',
          '/reset-password',
        ],
      },
    ],
    sitemap: 'https://rooto.in/sitemap.xml',
    host: 'https://rooto.in',
  }
}