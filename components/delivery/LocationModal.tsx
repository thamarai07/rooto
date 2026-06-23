"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { createPortal } from "react-dom"
import { MapPin, Search, Navigation, X, Loader2, ChevronRight, Clock } from "lucide-react"
import { placePredictions, resolvePrediction, reverseGeocode, type PlacePrediction } from "@/lib/googleMaps"

export interface DeliveryLocation {
  formatted: string
  area: string
  city: string
  pincode: string
  coordinates: { lat: number; lng: number }
  savedAt: string
}

const LS_KEY = "rooto_delivery_location"

export function getDeliveryLocation(): DeliveryLocation | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveDeliveryLocation(loc: DeliveryLocation) {
  localStorage.setItem(LS_KEY, JSON.stringify(loc))
  window.dispatchEvent(new Event("delivery-location-changed"))
}

export default function LocationModal({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false)
  const [current, setCurrent] = useState<DeliveryLocation | null>(null)
  const [query, setQuery] = useState("")
  const [preds, setPreds] = useState<PlacePrediction[]>([])
  const [searching, setSearching] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [error, setError] = useState("")
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setMounted(true)
    setCurrent(getDeliveryLocation())
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  const commit = (formatted: string, c: { lat: number; lng: number }, comp: any) => {
    saveDeliveryLocation({
      formatted,
      area: comp?.area || "",
      city: comp?.city || "",
      pincode: comp?.pincode || "",
      coordinates: c,
      savedAt: new Date().toISOString(),
    })
    onClose()
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) { setError("Location is not supported on this device"); return }
    setDetecting(true); setError("")
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const r = await reverseGeocode(pos.coords.latitude, pos.coords.longitude)
          commit(r.formatted, r.coordinates, r.components)
        } catch { setError("Couldn't fetch your address. Try again.") } finally { setDetecting(false) }
      },
      (err) => { setDetecting(false); setError(err.code === 1 ? "Location permission denied" : "Couldn't get your location") },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const onQuery = (v: string) => {
    setQuery(v)
    if (timer.current) clearTimeout(timer.current)
    if (v.trim().length < 3) { setPreds([]); setSearching(false); return }
    setSearching(true)
    timer.current = setTimeout(async () => { setPreds(await placePredictions(v)); setSearching(false) }, 350)
  }

  const pick = async (p: PlacePrediction) => {
    setSearching(true)
    const r = await resolvePrediction(p)
    setSearching(false)
    if (r) commit(r.formatted, r.coordinates, r.components)
    else setError("Couldn't load that place. Try another.")
  }

  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[10050] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[88vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-bold text-gray-900">Select delivery location</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Search for area, street or apartment…"
              className="w-full pl-9 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
            />
            {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 animate-spin" />}
          </div>

          {/* Use current location */}
          <button
            onClick={useCurrentLocation}
            disabled={detecting}
            className="w-full flex items-center gap-3 px-4 py-3 mb-3 rounded-2xl border border-green-200 bg-green-50/60 hover:bg-green-50 transition disabled:opacity-60"
          >
            <span className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
              {detecting ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Navigation className="w-4 h-4 text-white" />}
            </span>
            <span className="text-left">
              <span className="block text-sm font-semibold text-green-700">{detecting ? "Detecting…" : "Use my current location"}</span>
              <span className="block text-[11px] text-gray-500">Enable location for the most accurate address</span>
            </span>
            <ChevronRight className="w-4 h-4 text-green-600 ml-auto flex-shrink-0" />
          </button>

          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg p-2 mb-3">{error}</p>}

          {/* Search results */}
          {preds.length > 0 && (
            <div className="border border-gray-100 rounded-2xl overflow-hidden mb-3">
              {preds.map((p) => (
                <button key={p.id} onClick={() => pick(p)} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-green-50 transition text-left border-b border-gray-50 last:border-0">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-gray-900 truncate">{p.primary}</span>
                    {p.secondary && <span className="block text-[11px] text-gray-500 truncate">{p.secondary}</span>}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Previously selected */}
          {current && (
            <div className="mb-2">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Recent location</p>
              <div className="flex items-start gap-3 px-3 py-2.5 rounded-2xl bg-gray-50 border border-gray-100">
                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700 leading-snug line-clamp-2">{current.formatted}</p>
              </div>
            </div>
          )}

          {/* Manage detailed addresses */}
          <Link href="/addresses" onClick={onClose} className="mt-3 flex items-center justify-center gap-1.5 text-sm font-semibold text-green-700 hover:underline py-2">
            Manage saved addresses <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>,
    document.body
  )
}
