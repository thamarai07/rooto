"use client"

import { useState, useEffect, useRef } from 'react'
import { MapPin, Navigation, X, Loader2, Search, Target, Layers, ChevronRight } from 'lucide-react'

interface UserData {
  id: any
  name: string
  email: string
  phone: string
}

interface SavedAddress {
  type: string
  label?: string
  fullAddress: string
  lat: number
  lng: number
}

interface MapViewProps {
  userData: UserData
  onProceed: (coords: { lat: number; lng: number }, address: string) => void
  onClose: () => void
  savedAddresses?: SavedAddress[]
}

declare global {
  interface Window {
    L: any
    __selectedLocation?: {
      address: string
      coordinates: { lat: number; lng: number }
    }
  }
}

// 🔥 Map tile providers
const MAP_STYLES = {
  osm: {
    name: 'Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap'
  },
  carto: {
    name: 'Clean',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '© CartoDB'
  },
  cartoLight: {
    name: 'Light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '© CartoDB'
  },
  esri: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri'
  }
}

export default function MapView({ userData, onProceed, onClose, savedAddresses = [] }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const markerInstance = useRef<any>(null)
  const tileLayerRef = useRef<any>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [address, setAddress] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [mapLoaded, setMapLoaded] = useState<boolean>(false)
  const [locationRequested, setLocationRequested] = useState<boolean>(false)
  const [currentMapStyle, setCurrentMapStyle] = useState<keyof typeof MAP_STYLES>('osm')
  const [showMapStyles, setShowMapStyles] = useState(false)

  // Load Leaflet
  useEffect(() => {
    // Add CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    // Add JS
    if (!window.L) {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.async = true
      script.onload = () => {
        console.log('✅ Leaflet loaded')
        setTimeout(() => {
          setMapLoaded(true)
          initializeMap()
        }, 100)
      }
      script.onerror = () => {
        console.error('❌ Failed to load Leaflet')
        setErrorMessage('Failed to load map')
      }
      document.body.appendChild(script)
    } else {
      setMapLoaded(true)
      initializeMap()
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [])

  const initializeMap = () => {
    if (!window.L || !mapRef.current || mapInstance.current) {
      console.log('⏳ Waiting for map container...')
      return
    }

    try {
      console.log('🗺️ Initializing map...')
      
      const map = window.L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([13.0827, 80.2707], 11) // Chennai

      // Add tile layer
      const style = MAP_STYLES[currentMapStyle]
      tileLayerRef.current = window.L.tileLayer(style.url, {
        attribution: style.attribution,
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      }).addTo(map)

      // Add zoom control
      window.L.control.zoom({ position: 'bottomright' }).addTo(map)

      // Click handler
      map.on('click', (e: any) => {
        console.log('📍 Map clicked:', e.latlng)
        placeMarker(e.latlng.lat, e.latlng.lng)
        setShowMapStyles(false)
        setShowSearchResults(false)
      })

      mapInstance.current = map

      // Force resize
      setTimeout(() => {
        map.invalidateSize()
        console.log('✅ Map initialized successfully')
      }, 200)

    } catch (error) {
      console.error('❌ Map error:', error)
      setErrorMessage('Failed to load map')
    }
  }

  // Re-init map when ref is ready
  useEffect(() => {
    if (mapLoaded && mapRef.current && !mapInstance.current) {
      initializeMap()
    }
  }, [mapLoaded])

  const changeMapStyle = (styleKey: keyof typeof MAP_STYLES) => {
    if (!mapInstance.current || !window.L) return

    if (tileLayerRef.current) {
      mapInstance.current.removeLayer(tileLayerRef.current)
    }

    const style = MAP_STYLES[styleKey]
    tileLayerRef.current = window.L.tileLayer(style.url, {
      attribution: style.attribution,
      maxZoom: 19,
      subdomains: ['a', 'b', 'c']
    }).addTo(mapInstance.current)

    setCurrentMapStyle(styleKey)
    setShowMapStyles(false)
  }

  const placeMarker = (lat: number, lng: number) => {
    if (!mapInstance.current || !window.L) return

    console.log('📍 Placing marker at:', lat, lng)
    setCoordinates({ lat, lng })
    setErrorMessage('')

    if (markerInstance.current) {
      mapInstance.current.removeLayer(markerInstance.current)
    }

    // Custom pin icon
    const pinIcon = window.L.divIcon({
      className: 'custom-delivery-pin',
      html: `
        <div style="position:relative;width:48px;height:56px;">
          <!-- Pulse ring -->
          <div style="
            position:absolute;
            width:48px;height:48px;
            background:rgba(34,197,94,0.2);
            border-radius:50%;
            animation:pulse 1.5s ease-out infinite;
          "></div>
          <!-- Pin -->
          <div style="
            position:absolute;
            left:8px;top:4px;
            width:32px;height:32px;
            background:linear-gradient(180deg,#22c55e 0%,#16a34a 100%);
            border-radius:50% 50% 50% 4px;
            transform:rotate(-45deg);
            box-shadow:0 4px 12px rgba(34,197,94,0.4),0 2px 4px rgba(0,0,0,0.2);
            border:3px solid white;
          ">
            <div style="
              position:absolute;
              top:50%;left:50%;
              transform:translate(-50%,-50%) rotate(45deg);
              width:10px;height:10px;
              background:white;
              border-radius:50%;
            "></div>
          </div>
          <!-- Shadow -->
          <div style="
            position:absolute;
            bottom:0;left:12px;
            width:24px;height:6px;
            background:rgba(0,0,0,0.15);
            border-radius:50%;
          "></div>
        </div>
        <style>
          @keyframes pulse{0%,100%{transform:scale(1);opacity:0.6}50%{transform:scale(1.8);opacity:0}}
        </style>
      `,
      iconSize: [48, 56],
      iconAnchor: [24, 52],
    })

    const marker = window.L.marker([lat, lng], {
      icon: pinIcon,
      draggable: true,
    }).addTo(mapInstance.current)

    marker.on('dragend', (e: any) => {
      const pos = e.target.getLatLng()
      setCoordinates({ lat: pos.lat, lng: pos.lng })
      reverseGeocode(pos.lat, pos.lng)
    })

    markerInstance.current = marker
    reverseGeocode(lat, lng)
  }

  const flyToLocation = (lat: number, lng: number) => {
    if (!mapInstance.current) return

    mapInstance.current.flyTo([lat, lng], 16, {
      animate: true,
      duration: 1.2
    })

    setTimeout(() => placeMarker(lat, lng), 600)
  }

  const reverseGeocode = async (lat: number, lng: number) => {
    setLoading(true)
    setAddress('Finding address...')

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'DeliveryApp/1.0' } }
      )

      const data = await res.json()

      if (data.display_name) {
        setAddress(data.display_name)
        setErrorMessage('')
      } else {
        setAddress('Address not found')
        setErrorMessage('Try a different location')
      }
    } catch (err) {
      console.error('Geocode error:', err)
      setAddress('Could not get address')
      setErrorMessage('Network error')
    } finally {
      setLoading(false)
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Location not supported')
      return
    }

    setLoading(true)
    setErrorMessage('')
    setLocationRequested(true)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        flyToLocation(pos.coords.latitude, pos.coords.longitude)
        setLoading(false)
      },
      (err) => {
        setLoading(false)
        setErrorMessage(
          err.code === 1 ? 'Location permission denied' :
          err.code === 2 ? 'Location unavailable' : 'Location timeout'
        )
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // 🔥 FIXED: Search with proper dropdown
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)

    if (query.length < 3) {
      setSearchResults([])
      setShowSearchResults(false)
      setIsSearching(false)
      return
    }

    setIsSearching(true)

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('🔍 Searching:', query)
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=IN&limit=5`,
          { headers: { 'User-Agent': 'DeliveryApp/1.0' } }
        )

        const data = await res.json()
        console.log('🔍 Results:', data)
        setSearchResults(data || [])
        setShowSearchResults(true)
      } catch (err) {
        console.error('Search error:', err)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 400)
  }

  const selectSearchResult = (item: any) => {
    const lat = parseFloat(item.lat)
    const lng = parseFloat(item.lon)

    console.log('✅ Selected:', item.display_name)
    setSearchQuery(item.display_name.split(',')[0])
    setShowSearchResults(false)
    setSearchResults([])

    if (!isNaN(lat) && !isNaN(lng)) {
      flyToLocation(lat, lng)
    }
  }

  const handleProceed = () => {
    if (!coordinates) {
      setErrorMessage('Select a location first')
      return
    }
    if (!address || address.includes('not found')) {
      setErrorMessage('Invalid address')
      return
    }

    window.__selectedLocation = { address, coordinates }
    onProceed(coordinates, address)
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-1">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm h-[80vh] max-h-[550px] flex flex-col overflow-hidden relative">

        {/* 🔥 Header */}
        <div className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 px-3 py-2 flex-shrink-0 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-white/10 rounded-full"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md">
                <MapPin className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Delivery Location</h2>
                <p className="text-2xs text-green-100">Hi {userData.name.split(' ')[0]}, pick spot!</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-6 h-6 bg-white/20 hover:bg-white/30 rounded-md flex items-center justify-center transition"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>

        {/* 🔥 Search Bar */}
        <div className="px-3 py-2 bg-gray-50 border-b relative z-50">
          <div className="relative">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-green-100 rounded-md flex items-center justify-center">
              <Search className="w-3 h-3 text-green-600" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
              placeholder="Search location..."
              className="w-full pl-10 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none transition-all"
            />
            {isSearching && (
              <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 animate-spin" />
            )}
            {searchQuery && !isSearching && (
              <button
                onClick={() => { setSearchQuery(''); setShowSearchResults(false); setSearchResults([]) }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center"
              >
                <X className="w-2 h-2 text-gray-600" />
              </button>
            )}
          </div>

          {/* 🔥 FIXED: Search Dropdown */}
          {showSearchResults && (
            <div className="absolute left-3 right-3 top-[calc(100%-2px)] bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-[9999] max-h-48">
              {searchResults.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {searchResults.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => selectSearchResult(item)}
                      className="w-full px-3 py-2 flex items-center gap-2 hover:bg-green-50 active:bg-green-100 transition text-left"
                    >
                      <div className="w-6 h-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-md flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-3 h-3 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {item.display_name?.split(',')[0]}
                        </p>
                        <p className="text-2xs text-gray-500 truncate mt-0.5">
                          {item.display_name}
                        </p>
                      </div>
                      <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              ) : isSearching ? (
                <div className="p-4 text-center">
                  <Loader2 className="w-6 h-6 text-green-500 animate-spin mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Searching...</p>
                </div>
              ) : searchQuery.length >= 3 ? (
                <div className="p-4 text-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-1">
                    <Search className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500">No locations found</p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* 🔥 Map Container */}
        <div className="flex-1 relative min-h-0 bg-gray-200">
          {/* Map */}
          <div ref={mapRef} className="absolute inset-0 w-full h-full z-0" />

          {/* Close dropdown on map click */}
          {showSearchResults && (
            <div 
              className="absolute inset-0 z-10"
              onClick={() => setShowSearchResults(false)}
            />
          )}

          {/* Controls */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 z-20">
            {/* My Location */}
            <button
              onClick={getCurrentLocation}
              disabled={loading && locationRequested}
              className="w-8 h-8 bg-white hover:bg-gray-50 active:scale-95 rounded-lg shadow-md flex items-center justify-center transition-all border border-gray-100"
            >
              {loading && locationRequested ? (
                <Loader2 className="w-4 h-4 text-green-500 animate-spin" />
              ) : (
                <Target className="w-4 h-4 text-green-600" />
              )}
            </button>

            {/* Map Style */}
            <div className="relative">
              <button
                onClick={() => setShowMapStyles(!showMapStyles)}
                className="w-8 h-8 bg-white hover:bg-gray-50 active:scale-95 rounded-lg shadow-md flex items-center justify-center transition-all border border-gray-100"
              >
                <Layers className="w-4 h-4 text-gray-600" />
              </button>

              {showMapStyles && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 min-w-[100px] z-30">
                  {Object.entries(MAP_STYLES).map(([key, style]) => (
                    <button
                      key={key}
                      onClick={() => changeMapStyle(key as keyof typeof MAP_STYLES)}
                      className={`w-full px-3 py-1.5 text-left text-xs transition ${
                        currentMapStyle === key
                          ? 'bg-green-50 text-green-700 font-medium'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          {errorMessage && (
            <div className="absolute top-2 left-2 right-12 bg-red-500 text-white px-3 py-1 rounded-md text-2xs font-medium shadow-md z-20 flex items-center justify-between">
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage('')}>
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Loading overlay */}
          {!mapLoaded && (
            <div className="absolute inset-0 bg-white flex items-center justify-center z-30">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-green-100 border-t-green-500 rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs font-medium text-gray-600">Loading map...</p>
              </div>
            </div>
          )}

          {/* Instruction */}
          {mapLoaded && !coordinates && (
            <div className="absolute bottom-3 left-3 right-3 bg-white rounded-lg p-3 shadow-md z-20 flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-green-600 animate-bounce" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Tap on map</p>
                <p className="text-2xs text-gray-500">to select delivery location</p>
              </div>
            </div>
          )}
        </div>

        {/* 🔥 Footer */}
        <div className="p-3 bg-white border-t flex-shrink-0">
          {/* Address Display */}
          {coordinates && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-2 mb-2 flex items-start gap-2">
              <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center flex-shrink-0">
                <MapPin className="w-3 h-3 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-2xs font-bold text-green-700 mb-0.5">📍 Delivery Address</p>
                {loading ? (
                  <div className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin text-green-500" />
                    <span className="text-2xs text-gray-500">Finding address...</span>
                  </div>
                ) : (
                  <p className="text-xs text-gray-700 line-clamp-2">{address}</p>
                )}
              </div>
            </div>
          )}

          {/* Confirm Button */}
          <button
            onClick={handleProceed}
            disabled={!coordinates || loading}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-1 shadow-md shadow-green-500/30 disabled:shadow-none active:scale-[0.98]"
          >
            <Navigation className="w-4 h-4" />
            <span>Confirm & Continue</span>
          </button>
        </div>
      </div>
    </div>
  )
}