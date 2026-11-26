import { MetadataRoute } from 'next'
import { AREA_SLUGS } from '@/lib/areas'
import { API_BASE, SITE_URL } from '@/lib/config'
import { categoriesWithProducts, getCatalog } from '@/lib/catalog'

// Built per request from live data (see lib/catalog.ts for why no fetch cache).
async function getActiveFestivals(): Promise<{ slug: string; is_active: number }[]> {
  try {
    const res = await fetch(`${API_BASE}/get_festivals.php`, { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    return data.status === 'success' && Array.isArray(data.items) ? data.items : []
  } catch {
    return []
  }
}

// Only canonical, indexable, 200-status URLs belong here:
//  - products come from the LIVE list endpoint (get-product.php — the old
//    get-products.php URL 404s, which left the sitemap with zero products);
//  - category pages are included only while they actually have products;
//  - retired URLs (/areas/bharath-college, /category/fruits-vegetables)
//    redirect and are intentionally absent.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const [products, festivals] = await Promise.all([getCatalog(), getActiveFestivals()])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/products`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/areas`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/faq`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/shipping`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/returns`, changeFrequency: 'yearly', priority: 0.2 },
  ]

  const areaRoutes: MetadataRoute.Sitemap = AREA_SLUGS.map((slug) => ({
    url: `${SITE_URL}/areas/${slug}`,
    lastModified: now, // product list + prices on the page refresh continuously
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const categoryRoutes: MetadataRoute.Sitemap = categoriesWithProducts(products).map((slug) => ({
    url: `${SITE_URL}/category/${slug}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }))

  const productRoutes: MetadataRoute.Sitemap = products.map(({ slug, updated_at }) => {
    const updated = updated_at ? new Date(updated_at.replace(' ', 'T') + '+05:30') : null
    return {
      url: `${SITE_URL}/product/${encodeURIComponent(slug)}`,
      lastModified: updated && !isNaN(updated.getTime()) ? updated : now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }
  })

  const festivalRoutes: MetadataRoute.Sitemap = festivals
    .filter((f) => f.slug && Number(f.is_active) === 1)
    .map((f) => ({
      url: `${SITE_URL}/festival/${encodeURIComponent(f.slug)}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }))

  return [...staticRoutes, ...productRoutes, ...areaRoutes, ...categoryRoutes, ...festivalRoutes]
}
