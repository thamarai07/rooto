"use client"

import { useEffect, useRef, useState } from "react"
import { Search, X, Loader2, Package, Sparkles } from "lucide-react"

// Festival-styled live search. Uses the SAME endpoint + debounced behaviour as
// the homepage search bar (components/banner.tsx) — just a compact, centered,
// theme-coloured shell. Isolated: does not touch the homepage component.

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://seashell-skunk-617240.hostingersite.com/vfs-admin/api"

interface SP {
  id: string | number
  name: string
  image: string
  price: string | number
  price_per_kg?: string | number
  category?: string
  stock: number
}
interface ApiResponse {
  success: boolean
  searchResults?: SP[]
  topSelling?: SP[]
}

const fixImageUrl = (url: string): string => {
  if (!url) return ""
  return url.replace(
    /^https?:\/\/localhost(:\d+)?\/vfs_portal/,
    "https://seashell-skunk-617240.hostingersite.com"
  )
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "")

export default function FestivalSearchBar({
  themeColor = "#c2410c",
}: {
  themeColor?: string
}) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SP[]>([])
  const [topSelling, setTopSelling] = useState<SP[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  useEffect(
    () => () => {
      if (debounce.current) clearTimeout(debounce.current)
    },
    []
  )

  const runSearch = async (q: string) => {
    if (!q.trim()) {
      setOpen(false)
      setResults([])
      setTopSelling([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(
        `${API_BASE}/get-products_search.php?search=${encodeURIComponent(q)}`
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: ApiResponse = await res.json()
      setResults(data.searchResults || [])
      setTopSelling(data.topSelling || [])
      setOpen(true)
    } catch {
      setResults([])
      setTopSelling([])
      setOpen(true)
    } finally {
      setLoading(false)
    }
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setQuery(q)
    if (debounce.current) clearTimeout(debounce.current)
    if (!q.trim()) {
      setOpen(false)
      setResults([])
      setTopSelling([])
      setLoading(false)
      return
    }
    setLoading(true)
    setOpen(true)
    debounce.current = setTimeout(() => runSearch(q), 300)
  }

  const clear = () => {
    setQuery("")
    setOpen(false)
    setResults([])
    setTopSelling([])
    setLoading(false)
  }

  const go = (p: SP) => {
    setOpen(false)
    window.location.href = `/product/${slugify(p.name)}`
  }

  return (
    <div className="w-full flex justify-center px-3 sm:px-4 pt-3">
      <div className="w-full max-w-xl relative" ref={rootRef}>
        <div
          className="flex items-center gap-1.5 bg-white rounded-full pl-4 pr-1.5 py-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.10)]"
          style={{ border: `2px solid ${themeColor}33` }}
        >
          <Sparkles
            className="w-4 h-4 flex-shrink-0"
            style={{ color: themeColor }}
            aria-hidden="true"
          />
          <input
            type="text"
            value={query}
            onChange={onChange}
            onFocus={() => {
              if (query.trim() && (results.length || topSelling.length)) setOpen(true)
            }}
            placeholder="Search festival products…"
            className="flex-1 min-w-0 bg-transparent outline-none text-sm sm:text-[15px] text-gray-800 placeholder:text-gray-400"
          />
          {query && (
            <button
              onClick={clear}
              aria-label="Clear search"
              className="p-1 text-gray-400 hover:text-gray-600 transition flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => runSearch(query)}
            disabled={!query.trim()}
            aria-label="Search"
            className="flex-shrink-0 w-9 h-9 grid place-items-center rounded-full text-white transition disabled:opacity-40"
            style={{ background: themeColor }}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" strokeWidth={2.5} />
            )}
          </button>
        </div>

        {open && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[70vh] overflow-y-auto z-50">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2
                  className="w-7 h-7 animate-spin"
                  style={{ color: themeColor }}
                />
              </div>
            ) : (
              <>
                {results.length > 0 ? (
                  <div className="p-2">
                    <div className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide">
                      <Search className="w-3.5 h-3.5" style={{ color: themeColor }} />
                      Results ({results.length})
                    </div>
                    {results.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => go(p)}
                        className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition text-left"
                      >
                        <img
                          src={fixImageUrl(p.image)}
                          alt={p.name}
                          className="w-11 h-11 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://placehold.co/80x80/e5e7eb/6b7280?text=%20"
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-gray-900 truncate">
                            {p.name}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">
                            {p.category || "Product"}
                          </p>
                        </div>
                        <p className="font-black text-sm text-gray-900 flex-shrink-0">
                          ₹{Number(p.price_per_kg || p.price).toFixed(0)}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : query.trim() ? (
                  <div className="p-6 text-center text-gray-500">
                    <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-medium">No products found</p>
                  </div>
                ) : null}

                {topSelling.length > 0 && (
                  <div className="p-2 border-t border-gray-100 bg-orange-50/50">
                    <div className="px-2 py-1.5 text-xs font-bold text-orange-700 uppercase tracking-wide">
                      Top selling
                    </div>
                    {topSelling.map((p, i) => (
                      <button
                        key={p.id}
                        onClick={() => go(p)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-white transition text-left"
                      >
                        <span className="w-5 h-5 bg-orange-500 text-white text-[10px] rounded-full grid place-items-center font-bold flex-shrink-0">
                          {i + 1}
                        </span>
                        <img
                          src={fixImageUrl(p.image)}
                          alt={p.name}
                          className="w-9 h-9 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://placehold.co/80x80/e5e7eb/6b7280?text=%20"
                          }}
                        />
                        <p className="flex-1 min-w-0 text-sm font-medium text-gray-800 truncate">
                          {p.name}
                        </p>
                        <p className="font-bold text-sm text-orange-600 flex-shrink-0">
                          ₹{Number(p.price_per_kg || p.price).toFixed(0)}
                        </p>
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
  )
}
