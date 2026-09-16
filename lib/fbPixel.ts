// Thin wrapper around the Meta (Facebook) Pixel's global `fbq()` — the base
// pixel script + PageView is already wired in app/layout.tsx. This just adds
// the "Purchase" conversion event Meta Ads Manager needs to unlock Purchase
// as a campaign optimization goal. Safe no-op if fbq hasn't loaded yet.

declare global {
  interface Window {
    fbq?: (...args: any[]) => void
  }
}

export function fbTrack(event: string, params?: Record<string, unknown>) {
  try {
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq("track", event, params)
    }
  } catch {
    // Never let a Pixel hiccup break the order-success flow.
  }
}

/** Fire once, right after an order is confirmed as placed. */
export function trackPurchase(value: number, orderId?: string | number, currency = "INR") {
  fbTrack("Purchase", {
    value: Number((Number(value) || 0).toFixed(2)),
    currency,
    ...(orderId ? { content_ids: [String(orderId)], content_type: "product" } : {}),
  })
}
