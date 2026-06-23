"use client"

import { useState, useEffect, useRef } from 'react'
import { MapPin, Navigation, X, Loader2, Search, Target, Layers, ChevronRight } from 'lucide-react'
import { reverseGeocode as geoReverse, placePredictions, resolvePrediction, type PlacePrediction } from '@/lib/googleMaps'

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

const MAP_STYLES = {
  carto: { name: 'Clean', url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', attribution: '© CartoDB' },
  osm: { name: 'Standard', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '© OpenStreetMap' },
  esri: { name: 'Satellite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: '© Esri' },
}

export default function MapView({ userData, onProceed, onClose }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const tileLayerRef = useRef<any>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [address, setAddress] = useState<string>('')
  const [components, setComponents] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<boolean>(false)
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<PlacePrediction[]>([])
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [mapLoaded, setMapLoaded] = useState<boolean>(false)
  const [locating, setLocating] = useState<boolean>(false)
  const [isMoving, setIsMoving] = useState<boolean>(false)
  const [currentMapStyle, setCurrentMapStyle] = useState<keyof typeof MAP_STYLES>('carto')
  const [showMapStyles, setShowMapStyles] = useState(false)

  // ── Load Leaflet then init ──────────────────────────────────────────────────
  useEffect(() => {
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
    if (!window.L) {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.async = true
      script.onload = () => setTimeout(() => { setMapLoaded(true); initializeMap() }, 100)
      script.onerror = () => setErrorMessage('Failed to load map')
      document.body.appendChild(script)
    } else {
      setMapLoaded(true)
      initializeMap()
    }
    return () => {
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null }
    }
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    if (mapLoaded && mapRef.current && !mapInstance.current) initializeMap()
    // eslint-disable-next-line
  }, [mapLoaded])

  const initializeMap = () => {
    if (!window.L || !mapRef.current || mapInstance.current) return
    try {
      const map = window.L.map(mapRef.current, { zoomControl: false, attributionControl: false })
        .setView([13.0827, 80.2707], 12) // Chennai fallback

      const style = MAP_STYLES[currentMapStyle]
      tileLayerRef.current = window.L.tileLayer(style.url, { attribution: style.attribution, maxZoom: 19, subdomains: ['a', 'b', 'c'] }).addTo(map)
      window.L.control.zoom({ position: 'bottomright' }).addTo(map)

      // Center-pin model: address always reflects the map centre.
      map.on('movestart', () => { setIsMoving(true); setShowMapStyles(false); setShowSearchResults(false) })
      map.on('moveend', () => { setIsMoving(false); settleToCenter() })

      mapInstance.current = map
      setTimeout(() => { map.invalidateSize(); locateMe(true) }, 250)
    } catch {
      setErrorMessage('Failed to load map')
    }
  }

  // Reverse-geocode whatever is under the centre pin.
  const settleToCenter = () => {
    if (!mapInstance.current) return
    const c = mapInstance.current.getCenter()
    setCoordinates({ lat: c.lat, lng: c.lng })
    updateAddress(c.lat, c.lng)
  }

  const updateAddress = async (lat: number, lng: number) => {
    setLoading(true)
    try {
      const r = await geoReverse(lat, lng) // Google when keyed, else OpenStreetMap
      setAddress(r.formatted || 'Address not found — drag the map a little')
      setComponents(r.components as unknown as Record<string, string>)
      setErrorMessage('')
    } catch {
      setAddress('Could not get address')
      setErrorMessage('Network error')
    } finally {
      setLoading(false)
    }
  }

  const locateMe = (silent = false) => {
    if (!navigator.geolocation) { if (!silent) setErrorMessage('Location not supported'); return }
    setLocating(true)
    if (!silent) setErrorMessage('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false)
        mapInstance.current?.setView([pos.coords.latitude, pos.coords.longitude], 17, { animate: true })
      },
      (err) => {
        setLocating(false)
        if (!silent) setErrorMessage(err.code === 1 ? 'Location permission denied' : err.code === 2 ? 'Location unavailable' : 'Location timeout')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const changeMapStyle = (key: keyof typeof MAP_STYLES) => {
    if (!mapInstance.current || !window.L) return
    if (tileLayerRef.current) mapInstance.current.removeLayer(tileLayerRef.current)
    const style = MAP_STYLES[key]
    tileLayerRef.current = window.L.tileLayer(style.url, { attribution: style.attribution, maxZoom: 19, subdomains: ['a', 'b', 'c'] }).addTo(mapInstance.current)
    setCurrentMapStyle(key)
    setShowMapStyles(false)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    if (query.length < 3) { setSearchResults([]); setShowSearchResults(false); setIsSearching(false); return }
    setIsSearching(true)
    searchTimeoutRef.current = setTimeout(async () => {
      const preds = await placePredictions(query) // Google when keyed, else OpenStreetMap
      setSearchResults(preds)
      setShowSearchResults(true)
      setIsSearching(false)
    }, 350)
  }

  const selectSearchResult = async (item: PlacePrediction) => {
    setSearchQuery(item.primary)
    setShowSearchResults(false)
    setSearchResults([])
    const r = await resolvePrediction(item)
    if (r) mapInstance.current?.setView([r.coordinates.lat, r.coordinates.lng], 17, { animate: true })
  }

  const handleProceed = () => {
    if (!coordinates) { setErrorMessage('Pick a location first'); return }
    window.__selectedLocation = { address, coordinates, components }
    onProceed(coordinates, address)
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-1 sm:p-4">
      <div className="bg-white sm:rounded-2xl shadow-xl w-full h-full sm:h-[85vh] sm:max-w-md sm:max-h-[640px] flex flex-col overflow-hidden relative">

        {/* Header */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 px-4 py-3 flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md">
              <MapPin className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">Set delivery location</h2>
              <p className="text-[11px] text-green-100">Move the map to place the pin exactly</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 bg-white/20 hover:bg-white/30 rounded-md flex items-center justify-center transition">
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
              <button onClick={() => { setSearchQuery(''); setShowSearchResults(false); setSearchResults([]) }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
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
        <div className="flex-1 relative min-h-0 bg-gray-200">
          <div ref={mapRef} className="absolute inset-0 w-full h-full z-0" />

          {/* Fixed centre pin */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-[15] -translate-x-1/2" style={{ transform: `translate(-50%, ${isMoving ? '-115%' : '-100%'})`, transition: 'transform .15s ease-out' }}>
            <div className="relative w-10 h-10">
              <div className="absolute left-1/2 top-0 -translate-x-1/2 w-8 h-8 rounded-full rounded-bl-none bg-gradient-to-b from-green-500 to-emerald-600 border-[3px] border-white shadow-lg" style={{ transform: 'rotate(45deg)' }}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full" />
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-[14] -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-black/30 blur-[1px]" />

          {/* Controls */}
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-20">
            <button onClick={() => locateMe(false)} className="w-9 h-9 bg-white hover:bg-gray-50 active:scale-95 rounded-lg shadow-md flex items-center justify-center border border-gray-100">
              {locating ? <Loader2 className="w-4 h-4 text-green-500 animate-spin" /> : <Target className="w-4 h-4 text-green-600" />}
            </button>
            <div className="relative">
              <button onClick={() => setShowMapStyles(!showMapStyles)} className="w-9 h-9 bg-white hover:bg-gray-50 active:scale-95 rounded-lg shadow-md flex items-center justify-center border border-gray-100">
                <Layers className="w-4 h-4 text-gray-600" />
              </button>
              {showMapStyles && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 min-w-[100px] z-30">
                  {Object.entries(MAP_STYLES).map(([key, style]) => (
                    <button key={key} onClick={() => changeMapStyle(key as keyof typeof MAP_STYLES)} className={`w-full px-3 py-1.5 text-left text-xs ${currentMapStyle === key ? 'bg-green-50 text-green-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}>
                      {style.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {errorMessage && (
            <div className="absolute top-2 left-2 right-14 bg-red-500 text-white px-3 py-1.5 rounded-md text-[11px] font-medium shadow-md z-20 flex items-center justify-between">
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage('')}><X className="w-3 h-3" /></button>
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
              {loading ? (
                <span className="flex items-center gap-1 text-xs text-gray-500"><Loader2 className="w-3 h-3 animate-spin text-green-500" /> Finding address…</span>
              ) : (
                <p className="text-xs text-gray-700 line-clamp-2">{address || 'Move the map to choose a spot'}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleProceed}
            disabled={!coordinates || loading}
            className="w-full py-3.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold text-sm rounded-2xl transition flex items-center justify-center gap-1.5 active:scale-[0.98]"
          >
            <Navigation className="w-4 h-4" /> Confirm location
          </button>
        </div>
      </div>
    </div>
  )
}
