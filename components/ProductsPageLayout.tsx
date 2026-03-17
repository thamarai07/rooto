"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin, Search, X, Loader2, Package, Flame, Star, ShoppingCart, SlidersHorizontal } from "lucide-react"

interface Product {
  id: string | number
  name: string
  image: string
  price: string | number
  price_per_kg?: string | number
  stock: number
  category?: string
}

export default function ProductsPageLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<string>("Detecting location...")
  const [locationError, setLocationError] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [topSelling, setTopSelling] = useState<Product[]>([])
  const [showResults, setShowResults] = useState<boolean>(false)
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Get user location
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
          } catch (error) {
            setLocation(`${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`)
          }
        },
        (error) => {
          setLocationError(true)
          setLocation("Location unavailable")
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    } else {
      setLocationError(true)
      setLocation("Location not supported")
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [])

  // Fetch search results
  const fetchSearchResults = async (query: any) => {
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setSearchResults(data.searchResults || [])
        setTopSelling(data.topSelling || [])
        setShowResults(true)
      } else {
        setSearchResults([])
        setTopSelling([])
        setShowResults(true)
      }
    } catch (error) {
      console.error("Search error:", error)
      setSearchResults([])
      setTopSelling([])
      setShowResults(true)
    } finally {
      setIsSearching(false)
    }
  }

  // Handle search with debounce
  const handleSearchChange = (e: any) => {
    const query = e.target.value
    setSearchQuery(query)

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

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

  // Handle input focus
  const handleSearchFocus = () => {
    if (searchQuery.trim() && (searchResults.length > 0 || topSelling.length > 0)) {
      setShowResults(true)
    }
  }

  // Handle product selection
  const handleProductClick = (product: any) => {
    setSearchQuery(product.name)
    setShowResults(false)
    window.location.href = `/product-details/${encodeURIComponent(product.name)}`
  }

  // Clear search
  const clearSearch = () => {
    setSearchQuery("")
    setShowResults(false)
    setSearchResults([])
    setTopSelling([])
    setIsSearching(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Top Bar with Location and Search */}
      <div className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Location Display */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${locationError
              ? "bg-red-50 border-red-200"
              : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
              }`}>
              <MapPin className={`w-5 h-5 ${locationError ? "text-red-500" : "text-green-600"} animate-pulse`} />
              <span className={`font-medium text-sm ${locationError ? "text-red-700" : "text-gray-700"}`}>
                {location}
              </span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 w-full md:w-auto relative" ref={searchRef}>
              <div className="relative group">
                <div className="flex gap-2 bg-gray-50 p-2 rounded-xl border-2 border-gray-200 focus-within:border-green-400 focus-within:bg-white transition-all">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      placeholder="Search for fruits, vegetables..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onFocus={handleSearchFocus}
                      className="w-full pl-11 pr-10 py-2.5 text-gray-800 placeholder:text-gray-400 bg-transparent outline-none font-medium"
                    />
                    {searchQuery && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => fetchSearchResults(searchQuery)}
                    disabled={!searchQuery.trim()}
                    className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Live Search Results Dropdown */}
              {showResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-green-100 max-h-[500px] overflow-y-auto z-50">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
                    </div>
                  ) : (
                    <>
                      {/* Search Results */}
                      {searchResults.length > 0 ? (
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-3 px-2">
                            <Search className="w-4 h-4 text-green-600" />
                            <h3 className="font-bold text-gray-800">Search Results</h3>
                            <span className="ml-auto bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-sm font-semibold">
                              {searchResults.length}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {searchResults.map((product) => (
                              <button
                                key={product.id}
                                onClick={() => handleProductClick(product)}
                                className="w-full p-3 rounded-xl hover:bg-green-50 transition-all flex items-center gap-3 group border border-transparent hover:border-green-200"
                              >
                                {/* Product Image */}
                                <div className="w-16 h-16 rounded-lg overflow-hidden ring-2 ring-green-200 group-hover:ring-green-400 transition-all flex-shrink-0">
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                    onError={(e: any) => {
                                      e.target.src = "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=100&h=100&fit=crop"
                                    }}
                                  />
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 text-left">
                                  <h4 className="font-bold text-gray-800 group-hover:text-green-600 transition">
                                    {product.name}
                                  </h4>
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    {product.category && (
                                      <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
                                        {product.category}
                                      </span>
                                    )}
                                    <span>{product.stock} in stock</span>
                                  </div>
                                </div>

                                {/* Price */}
                                <div className="text-right">
                                  <span className="text-xl font-bold text-green-600">
                                    ₹{parseFloat(String(product.price)).toFixed(2)}
                                  </span>
                                  {product.price_per_kg && (
                                    <span className="block text-xs text-gray-500">
                                      ₹{parseFloat(String(product.price_per_kg)).toFixed(2)}/kg
                                    </span>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : searchQuery.trim() !== "" ? (
                        <div className="p-8 text-center">
                          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <h3 className="text-lg font-bold text-gray-600 mb-1">No results found</h3>
                          <p className="text-gray-500 text-sm">Try different keywords</p>
                        </div>
                      ) : null}

                      {/* Top Selling Products */}
                      {topSelling.length > 0 && (
                        <div className="border-t-2 border-gray-100 bg-orange-50 p-4">
                          <div className="flex items-center gap-2 mb-3 px-2">
                            <Flame className="w-4 h-4 text-orange-600" />
                            <h3 className="font-bold text-gray-800">Top Selling</h3>
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 ml-auto" />
                          </div>
                          <div className="space-y-2">
                            {topSelling.map((product, idx) => (
                              <button
                                key={product.id}
                                onClick={() => handleProductClick(product)}
                                className="w-full p-2.5 rounded-xl hover:bg-white transition-all flex items-center gap-3 group border border-orange-100 hover:border-orange-300"
                              >
                                <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                  {idx + 1}
                                </div>
                                <div className="w-12 h-12 rounded-lg overflow-hidden ring-2 ring-orange-200 flex-shrink-0">
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    onError={(e: any) => {
                                      e.target.src = "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=100&h=100&fit=crop"
                                    }}
                                  />
                                </div>
                                <div className="flex-1 text-left">
                                  <h4 className="font-semibold text-sm text-gray-800 group-hover:text-orange-600 transition">
                                    {product.name}
                                  </h4>
                                </div>
                                <span className="text-lg font-bold text-orange-600">
                                  ₹{parseFloat(String(product.price)).toFixed(2)}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}