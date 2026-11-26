// ============================================================================
// Single source of truth for ALL cart money math.
// Every page / drawer / popup must use these helpers so quantity and price
// stay identical everywhere (and never drift when one screen is edited).
// ============================================================================

export const FREE_SHIPPING_THRESHOLD = 500 // ₹ — free shipping above this
export const SHIPPING_FEE = 50             // ₹ — flat fee below threshold

/** Round to 2 decimals, killing float artefacts like 7.700000000001. */
export const round2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100

// ─── Tax rate (set by the admin in CMS → Settings) ───────────────────────────
// The server (create_order.php) charges the rate saved in the admin panel and
// rejects an order whose total differs from what it computes. The site loads
// that rate from /get_store_settings.php (lib/api/storeSettings.api.ts) and
// keeps it here, so every screen shows exactly what will be charged.
// 8 = the rate charged before the setting existed, and the server's own default.

export const DEFAULT_TAX_RATE_PERCENT = 8
const MAX_TAX_RATE_PERCENT = 28

let taxRatePercent = DEFAULT_TAX_RATE_PERCENT
const taxListeners = new Set<() => void>()

/** A valid percent (0–28, 2 decimals) or null. */
export function normalizeTaxRatePercent(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null
  const n = Number(v)
  if (!Number.isFinite(n) || n < 0 || n > MAX_TAX_RATE_PERCENT) return null
  return round2(n)
}

/** Current tax rate in percent (e.g. 8). */
export const getTaxRatePercent = () => taxRatePercent

/** Update the tax rate; re-renders every component using useTaxRate(). */
export function setTaxRatePercent(v: unknown) {
  const n = normalizeTaxRatePercent(v)
  if (n === null || n === taxRatePercent) return
  taxRatePercent = n
  taxListeners.forEach((l) => l())
}

export function subscribeTaxRate(listener: () => void) {
  taxListeners.add(listener)
  return () => {
    taxListeners.delete(listener)
  }
}

/** "8", "2.5", "0" */
export const formatTaxPercent = (p: number) => String(round2(p))

/** Label for the live cart: "Tax (8%)". */
export const taxLabel = (p: number = taxRatePercent) => `Tax (${formatTaxPercent(p)}%)`

/**
 * Label for an order that is already placed — worked out from the order's own
 * saved amounts, so it shows the rate that order was charged, not today's rate.
 */
export function taxLabelForOrder(tax: unknown, subtotal: unknown) {
  const s = Number(subtotal) || 0
  if (s <= 0) return "Tax"
  const pct = Math.round(((Number(tax) || 0) / s) * 1000) / 10 // 1 decimal
  return `Tax (${formatTaxPercent(pct)}%)`
}

/**
 * The price the customer actually pays per unit.
 * Prefers an explicit discounted `final_price`, else applies `discount_percent`
 * to the base price, else the base price. Used at ADD time so the cart stores
 * the same price the product UI shows.
 */
export function unitPrice(p: {
  price_per_kg?: number
  price?: number
  final_price?: number
  discount_percent?: number
}): number {
  if (p.final_price != null && p.final_price > 0) return round2(p.final_price)
  const base = p.price_per_kg ?? p.price ?? 0
  const pct = p.discount_percent ?? 0
  return round2(pct > 0 ? base * (1 - pct / 100) : base)
}

/** Subtotal for a single cart line. */
export const lineSubtotal = (price: number, qty: number) =>
  round2((Number(price) || 0) * (Number(qty) || 0))

export interface CartTotals {
  subtotal: number
  tax: number
  shipping: number
  total: number
}

type TotalsItem = { price?: number; quantity?: number; subtotal?: number }

/**
 * The ONE cart-totals formula used across the whole app.
 * Components pass the rate from useTaxRate() so they re-render when it loads;
 * event handlers can omit it to use the latest rate.
 */
export function cartTotals(items: TotalsItem[], ratePercent: number = taxRatePercent): CartTotals {
  const subtotal = round2(
    (items || []).reduce(
      (s, i) =>
        s +
        (i.subtotal != null
          ? Number(i.subtotal) || 0
          : (Number(i.price) || 0) * (Number(i.quantity) || 0)),
      0
    )
  )
  // Same expression as create_order.php: subtotal × (percent / 100).
  const tax = round2(subtotal * (ratePercent / 100))
  const shipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const total = round2(subtotal + tax + shipping)
  return { subtotal, tax, shipping, total }
}
