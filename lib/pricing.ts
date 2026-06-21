// ============================================================================
// Single source of truth for ALL cart money math.
// Every page / drawer / popup must use these helpers so quantity and price
// stay identical everywhere (and never drift when one screen is edited).
// ============================================================================

export const TAX_RATE = 0.08              // 8%
export const FREE_SHIPPING_THRESHOLD = 500 // ₹ — free shipping above this
export const SHIPPING_FEE = 50             // ₹ — flat fee below threshold

/** Round to 2 decimals, killing float artefacts like 7.700000000001. */
export const round2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100

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

/** The ONE cart-totals formula used across the whole app. */
export function cartTotals(items: TotalsItem[]): CartTotals {
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
  const tax = round2(subtotal * TAX_RATE)
  const shipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const total = round2(subtotal + tax + shipping)
  return { subtotal, tax, shipping, total }
}
