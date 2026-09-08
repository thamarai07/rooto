// lib/festivals.api.ts
// Isolated client for the NEW festival endpoints. Does not touch existing APIs.

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://seashell-skunk-617240.hostingersite.com/vfs-admin/api"

export interface FestivalUnit {
  unit: "kg" | "piece" | string
  label: string
  price: number        // discounted per-unit price the customer pays
  base_price: number   // pre-discount per-unit price
  step: number
  min: number
  max: number | null
  is_default: boolean
}

export interface FestivalProduct {
  id: number
  name: string
  slug: string
  category: string | null
  description: string | null
  image: string
  thumbnail: string
  stock: number
  unit: string
  price_per_kg: number
  piece_price: number | null
  discount_percent: number
  final_price: number
  has_discount: boolean
  in_stock: boolean
  low_stock: boolean
  out_of_stock: boolean
  min_quantity: number
  max_quantity: number
  units: FestivalUnit[]
  url: string
}

export interface Festival {
  id: number
  name: string
  slug: string
  description: string | null
  tagline: string | null
  theme_color: string | null
  banner_image: string | null
  mobile_image: string | null
  is_active: number
  product_count?: number
  url?: string
}

export interface FestivalDetail {
  status: "success" | "error"
  festival?: Festival
  items?: FestivalProduct[]
  message?: string
}

/** List of active festivals (for the homepage strip / nav). */
export async function getFestivals(): Promise<Festival[]> {
  try {
    const res = await fetch(`${API_BASE}/get_festivals.php`, { next: { revalidate: 300 } })
    if (!res.ok) return []
    const data = await res.json()
    return data.status === "success" && Array.isArray(data.items) ? data.items : []
  } catch {
    return []
  }
}

/**
 * One festival + its products.
 * Returns { status:'error' } on 404 (unknown/inactive slug) or network failure —
 * the page decides between "not found" and "error" using httpStatus.
 */
export async function getFestival(
  slug: string
): Promise<FestivalDetail & { httpStatus: number }> {
  try {
    const res = await fetch(
      `${API_BASE}/get_festival.php?slug=${encodeURIComponent(slug)}`,
      { cache: "no-store" }
    )
    const data = await res.json().catch(() => ({}))
    return {
      httpStatus: res.status,
      status: data.status === "success" ? "success" : "error",
      festival: data.festival,
      items: Array.isArray(data.items) ? data.items : [],
      message: data.message,
    }
  } catch {
    return { httpStatus: 0, status: "error", items: [], message: "network" }
  }
}
