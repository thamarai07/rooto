"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import { usePathname, useRouter } from "next/navigation"
import { Search, X, Loader2, Package, TrendingUp } from "lucide-react"
import { API_BASE } from "@/lib/config"

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

const CLOSE_ANIMATION_MS = 200
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=80&h=80&fit=crop"

const fixImageUrl = (url: string): string => {
  if (!url) return ""
  return url.replace(/^https?:\/\/localhost(:\d+)?\/vfs_portal/,
    "https://seashell-skunk-617240.hostingersite.com")
}

// Search icon for the header. Clicking it opens a full-width search panel that
// slides down from the top over a blurred backdrop.
export default function HeaderSearch({ iconClassName = "w-6 h-6" }: { iconClassName?: string }) {
  const router = useRouter()
  const pathname = usePathname()

  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [topSelling, setTopSelling] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const closeTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => setMounted(true), [])

  // === Fetch results (an empty query returns just the top-selling list) ===
  const fetchSearchResults = useCallback(async (query: string) => {
    setIsSearching(true)
    try {
      const response = await fetch(`${API_BASE}/get-products_search.php?search=${encodeURIComponent(query.trim())}`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data: ApiResponse = await response.json()
      setSearchResults(data.success ? data.searchResults || [] : [])
      if (data.success && data.topSelling) setTopSelling(data.topSelling)
    } catch (err) {
      console.error("Search error:", err)
      setSearchResults([])
    } finally {
      setIsSearching(false)
      if (query.trim()) setHasSearched(true)
    }
  }, [])

  const openSearch = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setClosing(false)
    setOpen(true)
    if (topSelling.length === 0) fetchSearchResults("")
  }

  const closeSearch = useCallback(() => {
    setClosing(true)
    closeTimer.current = setTimeout(() => {
      setOpen(false)
      setClosing(false)
    }, CLOSE_ANIMATION_MS)
  }, [])

  // === Focus input, lock page scroll, close on Escape ===
  useEffect(() => {
    if (!open) return
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 50)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeSearch() }
    window.addEventListener("keydown", onKey)
    return () => {
      clearTimeout(focusTimer)
      document.body.style.overflow = prevOverflow
      window.removeEventListener("keydown", onKey)
    }
  }, [open, closeSearch])

  // === Close when the route changes ===
  useEffect(() => {
    setOpen(false)
    setClosing(false)
  }, [pathname])

  // === Cleanup timers ===
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  }, [])

  // === Debounced search input ===
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)

    if (!query.trim()) {
      setSearchResults([])
      setHasSearched(false)
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    debounceTimer.current = setTimeout(() => fetchSearchResults(query), 300)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    fetchSearchResults(searchQuery)
  }

  const handleProductClick = (product: Product) => {
    closeSearch()
    router.push(`/product/${product.id}`)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setHasSearched(false)
    setIsSearching(false)
    inputRef.current?.focus()
  }

  const hasQuery = searchQuery.trim().length > 0

  const overlay = (
    <div className="fixed inset-0 z-[1000]" role="dialog" aria-modal="true" aria-label="Search products">
      {/* Backdrop */}
      <div
        onClick={closeSearch}
        className={`absolute inset-0 bg-gray-900/40 backdrop-blur-sm duration-200 ${closing ? "animate-out fade-out-0 fill-mode-forwards" : "animate-in fade-in-0"}`}
      />

      {/* Panel */}
      <div
        className={`relative bg-white rounded-b-3xl shadow-2xl ${closing
          ? "animate-out fade-out-0 slide-out-to-top-8 duration-200 fill-mode-forwards"
          : "animate-in fade-in-0 slide-in-from-top-8 zoom-in-95 duration-300 ease-out"}`}
      >
        <div className="max-w-3xl mx-auto px-3 sm:px-6 pt-3 sm:pt-5 pb-4 sm:pb-6">
          {/* Input row */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 sm:gap-3">
            <div className="group relative flex-1 flex items-center bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-green-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(34,197,94,0.15)] transition-all duration-300">
              <Search className="absolute left-3 sm:left-4 w-5 h-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
              <input
                ref={inputRef}
                autoFocus
                type="text"
                placeholder="Search fresh fruits…"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 sm:pl-12 pr-10 py-3 sm:py-3.5 bg-transparent outline-none text-base text-gray-800 placeholder:text-gray-400"
              />
              {isSearching ? (
                <Loader2 className="absolute right-3 w-5 h-5 text-green-600 animate-spin" />
              ) : hasQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="absolute right-2.5 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition animate-in zoom-in-50 duration-150"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={closeSearch}
              aria-label="Close search"
              className="p-2.5 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 hover:rotate-90 transition-all duration-300"
            >
              <X className="w-6 h-6" />
            </button>
          </form>

          {/* Results */}
          <div className="mt-3 sm:mt-4 max-h-[65vh] overflow-y-auto overscroll-contain">
            {hasQuery && !isSearching && hasSearched && (
              searchResults.length > 0 ? (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1.5 px-1 text-sm font-semibold text-gray-700">
                    <Search className="w-4 h-4 text-green-600" />
                    Search Results ({searchResults.length})
                  </div>
                  {searchResults.map((p, i) => (
                    <button
                      key={p.id}
                      onClick={() => handleProductClick(p)}
                      style={{ animationDelay: `${i * 40}ms` }}
                      className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-green-50 transition text-left group animate-in fade-in-0 slide-in-from-bottom-2 duration-300 fill-mode-both"
                    >
                      <img
                        src={fixImageUrl(p.image)}
                        alt={p.name}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
                        onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 group-hover:text-green-600 truncate">{p.name}</h4>
                        <p className="text-xs text-gray-500">{p.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">₹{Number(p.price).toFixed(2)}</p>
                        {p.price_per_kg && <p className="text-xs text-gray-500">₹{Number(p.price_per_kg).toFixed(2)}/kg</p>}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-gray-500 animate-in fade-in-0 zoom-in-95 duration-300">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No products found for “{searchQuery.trim()}”</p>
                </div>
              )
            )}

            {/* Top Selling */}
            {topSelling.length > 0 && (
              <div className="p-3 bg-orange-50 rounded-2xl animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 mb-1.5 px-1 text-sm font-semibold text-orange-700">
                  <TrendingUp className="w-4 h-4" />
                  Top Selling
                </div>
                {topSelling.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => handleProductClick(p)}
                    style={{ animationDelay: `${i * 40}ms` }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white transition text-left animate-in fade-in-0 slide-in-from-bottom-2 duration-300 fill-mode-both"
                  >
                    <span className="w-6 h-6 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <img
                      src={fixImageUrl(p.image)}
                      alt={p.name}
                      className="w-10 h-10 rounded object-cover flex-shrink-0"
                      onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE }}
                    />
                    <div className="flex-1 min-w-0 text-sm">
                      <p className="font-medium truncate">{p.name}</p>
                    </div>
                    <p className="font-bold text-orange-600">₹{Number(p.price).toFixed(2)}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <button
        onClick={openSearch}
        aria-label="Search"
        className="relative p-2.5 hover:bg-gray-100 active:bg-gray-100 rounded-full transition group"
      >
        <Search className={`${iconClassName} text-gray-700 group-hover:text-green-600 group-hover:scale-110 transition-transform duration-200`} />
      </button>
      {open && mounted && createPortal(overlay, document.body)}
    </>
  )
}
