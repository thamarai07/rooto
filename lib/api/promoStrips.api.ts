// lib/api/promoStrips.api.ts
// Promo strips managed from the admin portal (Promo Strips page).

import { API_BASE } from "@/lib/config"

/** Must match PROMO_STRIP_PLACEMENTS in rootoadmin/includes/promo_strip_helpers.php */
export type PromoPlacement =
  | "home_top"
  | "home_bottom"
  | "products"
  | "category"
  | "product"
  | "cart"
  | "festival"
  | "wishlist"
  | "orders"
  | "areas"

export interface PromoStripItem {
  id: number
  title: string
  desktop_image: string
  mobile_image: string | null
  link_url: string | null
  open_new_tab: boolean
  placements: PromoPlacement[]
}

// One request per page load, shared by every <PromoStrip /> on the page.
let cached: Promise<PromoStripItem[]> | null = null

export function getPromoStrips(): Promise<PromoStripItem[]> {
  if (!cached) {
    cached = fetch(`${API_BASE}/get_promo_strips.php`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => (data?.status === "success" && Array.isArray(data.items) ? data.items : []))
      .catch(() => {
        cached = null // allow a retry on the next navigation
        return []
      })
  }
  return cached
}
