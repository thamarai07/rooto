import { MetadataRoute } from 'next'

const BASE_URL = 'https://rooto.in'
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  'https://seashell-skunk-617240.hostingersite.com/vfs-admin/api'

const CATEGORY_SLUGS = [
  'fruits-vegetables',
  'dairy-eggs',
  'bakery',
  'beverages',
  'snacks',
  'household',
  'personal-care',
]

// Fetch all product slugs from the API for individual product pages
async function getProductSlugs(): Promise<{ slug: string; updatedAt?: string }[]> {
  try {
    const res = await fetch(`${API_BASE}/get-products.php`, {
      next: { revalidate: 3600 }, // refresh sitemap hourly
    })
    if (!res.ok) return []
    const data = await res.json()
    if (data.status !== 'success') return []

    return (data.data as any[])
      .filter((p) => p.slug) // only products that have a slug
      .map((p) => ({ slug: p.slug, updatedAt: p.updated_at }))
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const productSlugs = await getProductSlugs()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/products`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ]

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORY_SLUGS.map((slug) => ({
    url: `${BASE_URL}/category/${slug}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  const productRoutes: MetadataRoute.Sitemap = productSlugs.map(({ slug, updatedAt }) => ({
    url: `${BASE_URL}/product/${slug}`,
    lastModified: updatedAt ? new Date(updatedAt) : now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticRoutes, ...categoryRoutes, ...productRoutes]
}