// ---------------------------------------------------------------------------
// Server-side catalog helpers for SEO pages (home, /products, /areas/*,
// /category/*, sitemap, product delivery box).
//
// Everything here reads the LIVE list endpoint (get-product.php), so prices,
// stock and the product mix shown on landing pages always match the shop.
// Never hard-code a product, price or availability in page content.
// ---------------------------------------------------------------------------

import { API_BASE, IMAGE_BASE, SITE_URL } from "@/lib/config"

export type CatalogProduct = {
  id: number
  name: string
  slug: string
  category: string | null
  price_per_kg: number
  final_price: number
  discount_percent: number
  unit: string
  piece_price: number | null
  image: string
  description: string | null
  stock: number
  in_stock: boolean
  updated_at?: string
}

/**
 * All active products (the API already filters is_active = 1).
 * Cached with ISR for `revalidate` seconds. Returns [] on any failure so a
 * slow/broken API never breaks a page render.
 */
export async function getCatalog(revalidate = 600): Promise<CatalogProduct[]> {
  try {
    const res = await fetch(`${API_BASE}/get-product.php?limit=100`, {
      next: { revalidate },
    })
    if (!res.ok) return []
    const data = await res.json()
    if (data.status !== "success" || !Array.isArray(data.items)) return []
    return (data.items as any[])
      .filter((p) => p && p.slug && p.name)
      .map((p) => {
        const stock = Number(p.stock) || 0
        return {
          id: Number(p.id),
          name: String(p.name),
          slug: String(p.slug),
          category: p.category ? String(p.category) : null,
          price_per_kg: Number(p.price_per_kg ?? p.price) || 0,
          final_price: Number(p.final_price ?? p.price_per_kg ?? p.price) || 0,
          discount_percent: Number(p.discount_percent) || 0,
          unit: p.unit ? String(p.unit) : "kg",
          piece_price: p.piece_price != null && Number(p.piece_price) > 0 ? Number(p.piece_price) : null,
          image: p.image ? String(p.image) : "",
          description: p.description ? String(p.description) : null,
          stock,
          in_stock: p.in_stock != null ? Boolean(p.in_stock) : stock > 0,
          updated_at: p.updated_at ? String(p.updated_at) : undefined,
        }
      })
  } catch {
    return []
  }
}

/** Absolute URL for a product image (API returns a full URL or a bare filename). */
export function productImage(image?: string | null): string {
  const file = String(image || "").split(",")[0].trim()
  if (!file) return `${SITE_URL}/placeholder.jpg`
  if (/^https?:\/\//i.test(file)) return file
  return `${IMAGE_BASE}/${file}`
}

/** Short customer-facing name: "Koyya Pazham / Guava" → "Guava". */
export function shortName(name: string): string {
  const parts = name.split(/\s*[\/\-]\s*/).filter(Boolean)
  // Names are entered as "Tamil / English" or "English / Tamil"; prefer the
  // part that is a common English fruit word, else the last part.
  const english = parts.find((p) =>
    /apple|guava|papaya|pomegranate|lime|orange|banana|mango|grape|melon|kiwi|pear|sapota|chikoo|pineapple|lemon|berry|fig|dragon/i.test(p),
  )
  return (english || parts[parts.length - 1] || name).trim()
}

/** "₹220/kg" (+ "· ₹50/piece" when the product also sells by piece). */
export function priceLabel(p: CatalogProduct): string {
  const main = `₹${formatRupees(p.final_price)}/${p.unit || "kg"}`
  return p.piece_price ? `${main} · ₹${formatRupees(p.piece_price)}/piece` : main
}

export function formatRupees(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2)
}

/** Natural-language list: "apple, guava and papaya". */
export function joinNatural(items: string[]): string {
  if (items.length <= 1) return items.join("")
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`
}

/** Lowest current price among in-stock products, as "₹80/kg", or null. */
export function lowestPrice(products: CatalogProduct[]): string | null {
  const cheapest = products
    .filter((p) => p.in_stock && p.final_price > 0)
    .sort((x, y) => x.final_price - y.final_price)[0]
  return cheapest ? `₹${formatRupees(cheapest.final_price)}/${cheapest.unit || "kg"}` : null
}

/** "apple, guava, papaya and more" — for lists that are a sample of the range. */
export function sampleList(items: string[]): string {
  return items.length ? `${items.join(", ")} and more` : ""
}

// ─── WhatsApp ordering ──────────────────────────────────────────────────────
export const WHATSAPP_NUMBER = "919677028737"

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

// ─── Categories ─────────────────────────────────────────────────────────────
// URL slug → exact `products.category` value in the database. A category page
// is only indexable (and only listed in the sitemap) while it has products.
// "Fruits" deliberately has no /category page: /products is the canonical
// listing for the fruit range, so a second page would just duplicate it.
export const CATEGORY_DB_NAME: Record<string, string> = {
  "dairy-eggs": "Dairy & Eggs",
  bakery: "Bakery",
  beverages: "Beverages",
  snacks: "Snacks",
  household: "Household",
  "personal-care": "Personal Care",
}

export function categoriesWithProducts(products: CatalogProduct[]): string[] {
  const present = new Set(products.map((p) => (p.category || "").toLowerCase()))
  return Object.entries(CATEGORY_DB_NAME)
    .filter(([, dbName]) => present.has(dbName.toLowerCase()))
    .map(([slug]) => slug)
}
