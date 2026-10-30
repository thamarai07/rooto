"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, Navigation, X, Loader2, Search, Target, Layers, ChevronLeft, ChevronRight } from 'lucide-react'
import { reverseGeocode as geoReverse, placePredictions, resolvePrediction, type PlacePrediction, type GeoResult } from '@/lib/googleMaps'

interface UserData {
  id: any
  name: string
  email: string
  phone?: string
}

interface MapViewProps {
  userData: UserData
  onProceed: (coords: { lat: number; lng: number }, address: string) => void
  onClose: () => void
  onBack?: () => void
}

declare global {
  interface Window {
    L: any
    __selectedLocation?: {
      address: string
      coordinates: { lat: number; lng: number }
      components?: Record<string, string>
    }
  }
}

type LatLng = { lat: number; lng: number }

// Thin handle over the Leaflet map instance.
interface MapAdapter {
  getCenter: () => LatLng
  flyTo: (lat: number, lng: number, zoom: number) => void
  setStyle: (key: string) => void
  destroy: () => void
}

const CHENNAI: LatLng = { lat: 13.0827, lng: 80.2707 }

// Straight-line distance in metres (equirectangular — plenty accurate at street scale).
function distanceMeters(a: LatLng, b: LatLng): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const x = toRad(b.lng - a.lng) * Math.cos(toRad((a.lat + b.lat) / 2))
  const y = toRad(b.lat - a.lat)
  return Math.sqrt(x * x + y * y) * R
}

// Free, key-less map tiles. (CARTO basemaps now require an API key — don't use them.)
// Google is used for the search box only (see lib/googleMaps), never for map display.
const LEAFLET_STYLES = {
  osm: {
    name: 'Map',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
    maxZoom: 19,
  },
  esri: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxZoom: 19,
  },
} as const

export default function MapView({ userData, onProceed, onClose, onBack }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const adapterRef = useRef<MapAdapter | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  // Increments on every reverse-geocode request; only the latest one may update the UI,
  // so a slow response for an old pin position can never overwrite the current address.
  const geocodeSeq = useRef(0)
  // The place the customer picked from search. While the pin is still on it we show that
  // result (e.g. "Hansa Garden Apartment, …") instead of re-looking up the spot on OpenStreetMap.
  const pickedPlaceRef = useRef<GeoResult | null>(null)
  // Building name from the last search pick — still applies if the customer nudges the pin
  // a little to sit exactly on their block (the OSM lookup there won't know the name).
  const pickedBuildingRef = useRef<{ name: string; coordinates: LatLng } | null>(null)
  // The pin confirmed earlier in this checkout, if any (cleared when an order is placed).
  const [previousPin] = useState<LatLng | null>(() =>
    typeof window !== 'undefined' ? window.__selectedLocation?.coordinates ?? null : null)

  const [address, setAddress] = useState<string>('')
  const [components, setComponents] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<boolean>(false)
  const [coordinates, setCoordinates] = useState<LatLng | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<PlacePrediction[]>([])
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [infoMessage, setInfoMessage] = useState<string>('')
  const [mapLoaded, setMapLoaded] = useState<boolean>(false)
  const [locating, setLocating] = useState<boolean>(false)
  const [isMoving, setIsMoving] = useState<boolean>(false)
  const [currentStyle, setCurrentStyle] = useState<string>('')
  const [showMapStyles, setShowMapStyles] = useState(false)

  const styleOptions: Record<string, string> =
    Object.fromEntries(Object.entries(LEAFLET_STYLES).map(([k, v]) => [k, v.name]))

  // ── Reverse-geocode whatever is under the centre pin ───────────────────────
  const updateAddress = useCallback(async (lat: number, lng: number) => {
    const seq = ++geocodeSeq.current
    setLoading(true)
    try {
      const r = await geoReverse(lat, lng) // free OpenStreetMap
      if (seq !== geocodeSeq.current) return // a newer pin position superseded this one
      setAddress(r.formatted || 'Address not found — drag the map a little')
      setComponents(r.components as unknown as Record<string, string>)
      setErrorMessage('')
    } catch {
      if (seq !== geocodeSeq.current) return
      setAddress('Could not get address')
      setErrorMessage('Network error')
    } finally {
      if (seq === geocodeSeq.current) setLoading(false)
    }
  }, [])

  const settleToCenter = useCallback(() => {
    const a = adapterRef.current
    if (!a) return
    const c = a.getCenter()
    setCoordinates(c)

    const picked = pickedPlaceRef.current
    if (picked && distanceMeters(c, picked.coordinates) < 15) {
      geocodeSeq.current++ // cancel any lookup still in flight
      setAddress(picked.formatted)
      setComponents(picked.components as unknown as Record<string, string>)
      setLoading(false)
      return
    }
    pickedPlaceRef.current = null // pin moved away from the searched place
    updateAddress(c.lat, c.lng)
  }, [updateAddress])

  const onMoveStart = useCallback(() => {
    setIsMoving(true)
    setShowMapStyles(false)
    setShowSearchResults(false)
    // The customer is placing the pin by hand — hints/warnings are no longer relevant.
    setErrorMessage('')
    setInfoMessage('')
  }, [])

  // Auto-dismiss banners so they never sit on top of the map.
  useEffect(() => {
    if (!errorMessage && !infoMessage) return
    const t = setTimeout(() => { setErrorMessage(''); setInfoMessage('') }, 5000)
    return () => clearTimeout(t)
  }, [errorMessage, infoMessage])

  const onMoveEnd = useCallback(() => {
    setIsMoving(false)
    settleToCenter()
  }, [settleToCenter])

  // ── Locate the customer via device GPS ──────────────────────────────────────
  const locateMe = useCallback((silent = false) => {
    if (!navigator.geolocation) { if (!silent) setErrorMessage('Location not supported'); return }
    setLocating(true)
    if (!silent) setErrorMessage('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false)
        adapterRef.current?.flyTo(pos.coords.latitude, pos.coords.longitude, 18)
        // Laptops locate by Wi-Fi/IP and can be hundreds of metres off — ask the user to fine-tune.
        if (pos.coords.accuracy > 100) {
          setInfoMessage(`Your location is approximate (±${Math.round(pos.coords.accuracy)} m). Drag the map to place the pin exactly.`)
        } else {
          setInfoMessage('')
        }
      },
      (err) => {
        setLocating(false)
        if (silent) return
        // Not an error the customer did — just guide them to the other ways of picking a spot.
        setInfoMessage(err.code === 1
          ? 'Location access is off. Search your area or drag the map to place the pin.'
          : 'Couldn\'t get your location. Search your area or drag the map to place the pin.')
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }, [])

  // ── Leaflet + OpenStreetMap ────────────────────────────────
  const loadLeaflet = (): Promise<any> => new Promise((resolve, reject) => {
    if (!document.querySelector('link[data-leaflet]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      link.setAttribute('data-leaflet', '')
      document.head.appendChild(link)
    }
    if (window.L) return resolve(window.L)
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.async = true
    script.onload = () => resolve(window.L)
    script.onerror = () => reject(new Error('leaflet-load-failed'))
    document.body.appendChild(script)
  })

  const initLeaflet = useCallback(async (): Promise<boolean> => {
    try {
      const L = await loadLeaflet()
      if (!mapRef.current) return false
      const map = L.map(mapRef.current, { zoomControl: false, attributionControl: true })
        // Coming back to the map keeps the pin where the customer left it.
        .setView(previousPin ? [previousPin.lat, previousPin.lng] : [CHENNAI.lat, CHENNAI.lng], previousPin ? 18 : 12)
      map.attributionControl.setPrefix(false)

      let tileLayer: any = null
      const applyStyle = (key: string) => {
        const s = LEAFLET_STYLES[key as keyof typeof LEAFLET_STYLES]
        if (!s) return
        if (tileLayer) map.removeLayer(tileLayer)
        tileLayer = L.tileLayer(s.url, { attribution: s.attribution, maxZoom: s.maxZoom }).addTo(map)
      }
      applyStyle('osm')
      L.control.zoom({ position: 'bottomright' }).addTo(map)

      map.on('movestart', onMoveStart)
      map.on('moveend', onMoveEnd)

      adapterRef.current = {
        getCenter: () => { const c = map.getCenter(); return { lat: c.lat, lng: c.lng } },
        flyTo: (lat, lng, zoom) => map.setView([lat, lng], zoom, { animate: true }),
        setStyle: applyStyle,
        destroy: () => map.remove(),
      }
      setCurrentStyle('osm')
      // Leaflet measures its container on init; re-measure once the modal has laid out.
      setTimeout(() => map.invalidateSize(), 200)
      return true
    } catch {
      return false
    }
  }, [onMoveStart, onMoveEnd])

  // ── Boot ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false

    initLeaflet().then((ok) => {
      if (cancelled) return
      if (!ok) { setErrorMessage('Failed to load map. Please check your internet connection.'); return }
      setMapLoaded(true)
      // Initialise coordinates from the default centre immediately so Confirm works even if
      // GPS is denied/slow; locateMe() then moves the map to the customer.
      settleToCenter()
      if (!previousPin) locateMe(true)
    })

    return () => {
      cancelled = true
      adapterRef.current?.destroy()
      adapterRef.current = null
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const changeMapStyle = (key: string) => {
    adapterRef.current?.setStyle(key)
    setCurrentStyle(key)
    setShowMapStyles(false)
  }

  // ── Search ─────────────────────────────────────────────────────────────────
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    if (query.trim().length < 3) { setSearchResults([]); setShowSearchResults(false); setIsSearching(false); return }
    setIsSearching(true)
    searchTimeoutRef.current = setTimeout(async () => {
      const preds = await placePredictions(query) // Google Places when keyed, else OpenStreetMap
      setSearchResults(preds)
      setShowSearchResults(true)
      setIsSearching(false)
    }, 400)
  }

  const selectSearchResult = async (item: PlacePrediction) => {
    setSearchQuery(item.primary)
    setShowSearchResults(false)
    setSearchResults([])
    const r = await resolvePrediction(item)
    if (r) {
      pickedPlaceRef.current = r
      pickedBuildingRef.current = r.components.building ? { name: r.components.building, coordinates: r.coordinates } : null
      adapterRef.current?.flyTo(r.coordinates.lat, r.coordinates.lng, 18)
      setInfoMessage('Drag the map to place the pin exactly on your building.')
    } else {
      setErrorMessage('Could not open that place — try another result')
    }
  }

  const handleProceed = () => {
    // Use the live map centre — it's always exactly where the pin is.
    const coords = adapterRef.current?.getCenter() ?? coordinates
    if (!coords) { setErrorMessage('Pick a location on the map first'); return }
    const comps: Record<string, string> = { ...components }
    const pb = pickedBuildingRef.current
    if (!comps.building && pb && distanceMeters(coords, pb.coordinates) < 300) comps.building = pb.name
    window.__selectedLocation = { address, coordinates: coords, components: comps }
    onProceed(coords, address)
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-1 sm:p-4">
      <div className="bg-white sm:rounded-2xl shadow-xl w-full h-full sm:h-[85vh] sm:max-w-md sm:max-h-[640px] flex flex-col overflow-hidden relative">

        {/* Header */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 px-4 py-3 flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBack && (
              <button onClick={onBack} aria-label="Back to saved addresses" className="w-7 h-7 bg-white/20 hover:bg-white/30 rounded-md flex items-center justify-center transition">
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
            )}
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md">
              <MapPin className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">Set delivery location</h2>
              <p className="text-[11px] text-green-100">Move the map to place the pin exactly</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-7 h-7 bg-white/20 hover:bg-white/30 rounded-md flex items-center justify-center transition">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-2 bg-gray-50 border-b relative z-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
              placeholder="Search area, street, landmark…"
              className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none"
            />
            {isSearching && <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 animate-spin" />}
            {searchQuery && !isSearching && (
              <button onClick={() => { setSearchQuery(''); setShowSearchResults(false); setSearchResults([]) }} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {showSearchResults && (
            <div className="absolute left-3 right-3 top-[calc(100%-2px)] bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-[9999] max-h-56 overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <button key={item.id} onClick={() => selectSearchResult(item)} className="w-full px-3 py-2.5 flex items-center gap-2 hover:bg-green-50 transition text-left border-b border-gray-50 last:border-0">
                    <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="flex-1 min-w-0">
                      <span className="block text-xs font-medium text-gray-900 truncate">{item.primary}</span>
                      {item.secondary && <span className="block text-[11px] text-gray-500 truncate">{item.secondary}</span>}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-gray-500">No locations found</div>
              )}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 relative min-h-0 bg-gray-100">
          <div ref={mapRef} className="absolute inset-0 w-full h-full z-0" />

          {/* Fixed centre pin — its tip marks the exact delivery point */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-[15]" style={{ transform: `translate(-50%, ${isMoving ? '-115%' : '-100%'})`, transition: 'transform .15s ease-out' }}>
            <div className="relative w-10 h-10">
              <div className="absolute left-1/2 top-0 w-8 h-8 rounded-full rounded-bl-none bg-gradient-to-b from-green-500 to-emerald-600 border-[3px] border-white shadow-lg" style={{ transform: 'translateX(-50%) rotate(-45deg)' }}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full" />
              </div>
            </div>
          </div>
          <div className={`pointer-events-none absolute left-1/2 top-1/2 z-[14] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/30 blur-[1px] transition-all ${isMoving ? 'w-3 h-1.5' : 'w-2 h-2'}`} />

          {/* Controls */}
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-20">
            <button onClick={() => locateMe(false)} aria-label="Use my current location" title="Use my current location" className="w-9 h-9 bg-white hover:bg-gray-50 active:scale-95 rounded-lg shadow-md flex items-center justify-center border border-gray-100">
              {locating ? <Loader2 className="w-4 h-4 text-green-500 animate-spin" /> : <Target className="w-4 h-4 text-green-600" />}
            </button>
            <div className="relative">
              <button onClick={() => setShowMapStyles(!showMapStyles)} aria-label="Map type" title="Map type" className="w-9 h-9 bg-white hover:bg-gray-50 active:scale-95 rounded-lg shadow-md flex items-center justify-center border border-gray-100">
                <Layers className="w-4 h-4 text-gray-600" />
              </button>
              {showMapStyles && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 min-w-[100px] z-30">
                  {Object.entries(styleOptions).map(([key, name]) => (
                    <button key={key} onClick={() => changeMapStyle(key)} className={`w-full px-3 py-1.5 text-left text-xs ${currentStyle === key ? 'bg-green-50 text-green-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}>
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {errorMessage ? (
            <div className="absolute top-2 left-2 right-14 bg-red-500 text-white px-3 py-1.5 rounded-md text-[11px] font-medium shadow-md z-20 flex items-center justify-between gap-2">
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage('')} aria-label="Dismiss"><X className="w-3 h-3" /></button>
            </div>
          ) : infoMessage && (
            <div className="absolute top-2 left-2 right-14 bg-gray-900/85 text-white px-3 py-1.5 rounded-md text-[11px] font-medium shadow-md z-20 flex items-center justify-between gap-2">
              <span>{infoMessage}</span>
              <button onClick={() => setInfoMessage('')} aria-label="Dismiss"><X className="w-3 h-3" /></button>
            </div>
          )}

          {!mapLoaded && (
            <div className="absolute inset-0 bg-white flex items-center justify-center z-30">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-green-100 border-t-green-500 rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-600">Loading map…</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t flex-shrink-0">
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-2 flex items-start gap-2">
            <MapPin className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-green-700 mb-0.5">Delivering to this location</p>
              {loading || isMoving ? (
                <span className="flex items-center gap-1 text-xs text-gray-500"><Loader2 className="w-3 h-3 animate-spin text-green-500" /> Finding address…</span>
              ) : (
                <p className="text-xs text-gray-700 line-clamp-2">{address || 'Move the map to choose a spot'}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleProceed}
            disabled={!coordinates || loading || isMoving}
            className="w-full py-3.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold text-sm rounded-2xl transition flex items-center justify-center gap-1.5 active:scale-[0.98]"
          >
            <Navigation className="w-4 h-4" /> Confirm location
          </button>
        </div>
      </div>
    </div>
  )
}
