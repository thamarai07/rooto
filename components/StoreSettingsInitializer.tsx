"use client"

import { useEffect } from "react"
import { applyCachedStoreSettings, refreshStoreSettings } from "@/lib/api/storeSettings.api"

/**
 * Loads the admin-controlled store settings (tax rate) once per page load,
 * and again when the shopper comes back to the tab (throttled to once a minute),
 * so a long-open tab picks up a change made in the admin panel.
 */
export default function StoreSettingsInitializer() {
  useEffect(() => {
    applyCachedStoreSettings()
    refreshStoreSettings(true)

    const onFocus = () => {
      refreshStoreSettings()
    }
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [])

  return null
}
