"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin, Search, X, Loader2, Package } from "lucide-react"

interface Product {
  id: string | number
  name: string
  image: string
  price: string | number
  price_per_kg?: string | number
  stock: number
  category?: string
}

interface ApiResponse {
  success: boolean
  searchResults?: Product[]
  topSelling?: Product[]
  error?: string
}

export default function HeaderSearchBar() {
  const [location, setLocation] = useState<string>("Detecting location...")
  const [locationError, setLocationError] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [topSelling, setTopSelling] = useState<Product[]>([])
  const [showResults, setShowResults] = useState<boolean>(false)
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // === Get user location ===
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
            )
            const data = await response.json()
            const city = data.address.city || data.address.town || data.address.village || "Unknown"
            const country = data.address.country || ""
            setLocation(`${city}, ${country}`)
            setLocationError(false)
          } catch {
            setLocation(`${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`)
          }
        },
        () => {
          setLocationError(true)
          setLocation("Location unavailable")
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    } else {
      setLocationError(true)
      setLocation("Location not supported")
    }
  }, [])

  // === Close dropdown on outside click ===
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // === Cleanup debounce timer ===
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [])

  // === Fetch search results ===
  const fetchSearchResults = async (query: string) => {
    if (!query.trim()) {
      setShowResults(false)
      setSearchResults([])
      setTopSelling([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE || "https://rootoportal.onrender.com/api"}/get-products_search.php?search=${encodeURIComponent(query)}`
      )

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data: ApiResponse = await response.json()

      if (data.success) {
        setSearchResults(data.searchResults || [])
        setTopSelling(data.topSelling || [])
        setShowResults(true)
      } else {
        setSearchResults([])
        setTopSelling([])
        setShowResults(true)
      }
    } catch (err) {
      console.error("Search error:", err)
      setSearchResults([])
      setTopSelling([])
      setShowResults(true)
    } finally {
      setIsSearching(false)
    }
  }

  // === Debounced search input ===
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    if (debounceTimer.current) clearTimeout(debounceTimer.current)

    if (!query.trim()) {
      setShowResults(false)
      setSearchResults([])
      setTopSelling([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    setShowResults(true)

    debounceTimer.current = setTimeout(() => {
      fetchSearchResults(query)
    }, 300)
  }

  // === Show results on focus if query exists ===
  const handleSearchFocus = () => {
    if (searchQuery.trim() && (searchResults.length > 0 || topSelling.length > 0)) {
      setShowResults(true)
    }
  }

  // === Product click handler (now navigates) ===
  const handleProductClick = (product: Product) => {
    setShowResults(false)
    // Navigate to product page (replace with your routing)
    window.location.href = `/product/${product.id}`
  }

  // === Clear search ===
  const clearSearch = () => {
    setSearchQuery("")
    setShowResults(false)
    setSearchResults([])
    setTopSelling([])
    setIsSearching(false)
  }

  return (
    <div className="w-full bg-white shadow-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row gap-3 items-center">

        {/* Location */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${locationError ? "text-red-600 bg-red-50" : "text-gray-700 bg-gray-100"
          }`}>
          <MapPin className={`w-4 h-4 ${locationError ? "text-red-500" : "text-green-600"}`} />
          <span>{location}</span>
        </div>

        {/* Full-Width Search Bar */}
        <div className="flex-1 w-full relative" ref={searchRef}>
          <div className="flex gap-2 bg-gray-50 rounded-xl p-1 shadow-sm border border-gray-200">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search fruits, vegetables, groceries..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                className="w-full pl-10 pr-8 py-2.5 bg-transparent outline-none text-gray-800 placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => fetchSearchResults(searchQuery)}
              disabled={!searchQuery.trim()}
              className="px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition"
            >
              Search
            </button>
          </div>

          {/* Clickable Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
              {isSearching ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                </div>
              ) : (
                <>
                  {/* Search Results */}
                  {searchResults.length > 0 ? (
                    <div className="p-3 border-b">
                      <div className="flex items-center gap-2 mb-2 px-1 text-sm font-semibold text-gray-700">
                        <Search className="w-4 h-4 text-green-600" />
                        Search Results ({searchResults.length})
                      </div>
                      {searchResults.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleProductClick(p)}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-green-50 transition text-left group"
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=80&h=80&fit=crop"
                            }}
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800 group-hover:text-green-600">{p.name}</h4>
                            <p className="text-xs text-gray-500">{p.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">₹{Number(p.price).toFixed(2)}</p>
                            {p.price_per_kg && <p className="text-xs text-gray-500">₹{Number(p.price_per_kg).toFixed(2)}/kg</p>}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : searchQuery.trim() ? (
                    <div className="p-6 text-center text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No products found</p>
                    </div>
                  ) : null}

                  {/* Top Selling */}
                  {topSelling.length > 0 && (
                    <div className="p-3 bg-orange-50">
                      <div className="flex items-center gap-2 mb-2 px-1 text-sm font-semibold text-orange-700">
                        Top Selling
                      </div>
                      {topSelling.map((p, i) => (
                        <button
                          key={p.id}
                          onClick={() => handleProductClick(p)}
                          className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white transition text-left"
                        >
                          <span className="w-6 h-6 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold flex-shrink-0">
                            {i + 1}
                          </span>
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-10 rounded object-cover flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=80&h=80&fit=crop"
                            }}
                          />
                          <div className="flex-1 text-sm">
                            <p className="font-medium">{p.name}</p>
                          </div>
                          <p className="font-bold text-orange-600">₹{Number(p.price).toFixed(2)}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}