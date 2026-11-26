// Loads store settings the admin controls (CMS → Settings) — currently the
// tax rate — from /get_store_settings.php and applies them to lib/pricing.ts.
//
// The last known rate is kept in localStorage so a returning visitor sees the
// right totals immediately. If the request fails, the last known (or default)
// rate stays; the server still checks every order total, so a stale rate can
// only make it ask the customer to review the cart — never charge them wrongly.

import { API_BASE } from "@/lib/config"
import { normalizeTaxRatePercent, setTaxRatePercent } from "@/lib/pricing"

const CACHE_KEY = "rooto_tax_rate_percent"
const MIN_REFRESH_GAP_MS = 60_000

let lastFetchAt = 0
let inFlight: Promise<void> | null = null

/** Apply the rate saved from the previous visit (call after hydration). */
export function applyCachedStoreSettings() {
  try {
    const cached = normalizeTaxRatePercent(localStorage.getItem(CACHE_KEY))
    if (cached !== null) setTaxRatePercent(cached)
  } catch {
    /* storage unavailable — keep the default */
  }
}

/** Fetch the current settings. Throttled unless `force` is true. */
export function refreshStoreSettings(force = false): Promise<void> {
  if (inFlight) return inFlight
  if (!force && Date.now() - lastFetchAt < MIN_REFRESH_GAP_MS) return Promise.resolve()
  lastFetchAt = Date.now()

  inFlight = (async () => {
    try {
      const res = await fetch(`${API_BASE}/get_store_settings.php`, { cache: "no-store" })
      if (!res.ok) return
      const json = await res.json()
      const rate = json?.status === "success" ? normalizeTaxRatePercent(json?.data?.tax_rate_percent) : null
      if (rate === null) return
      setTaxRatePercent(rate)
      try {
        localStorage.setItem(CACHE_KEY, String(rate))
      } catch {
        /* ignore */
      }
    } catch {
      /* network error — keep the current rate */
    } finally {
      inFlight = null
    }
  })()
  return inFlight
}
