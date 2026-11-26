"use client"

import { useSyncExternalStore } from "react"
import { DEFAULT_TAX_RATE_PERCENT, getTaxRatePercent, subscribeTaxRate } from "@/lib/pricing"

/**
 * Current tax rate in percent (set by the admin in CMS → Settings).
 * Re-renders the component when the rate loads or changes.
 * The server render always uses the default, so hydration never mismatches;
 * the real rate is applied right after hydration.
 */
export function useTaxRate(): number {
  return useSyncExternalStore(subscribeTaxRate, getTaxRatePercent, () => DEFAULT_TAX_RATE_PERCENT)
}
