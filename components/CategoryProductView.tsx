"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, Heart, Check, Loader2 } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost/vfs_portal/vfs-admin/api"

interface Product {
  id: number
  name: string
  price: number
  price_per_kg: number
  image: string
  category: string
  description: string
  stock: number
}

export default function CategoryProductView() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set())
  const [loadingItem, setLoadingItem] = useState<number | null>(null)
  const [addedItems, setAddedItems] = useState<Set<number>>(new Set())

  // Unique categories
  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))]

  // Filtered products
  const filteredProducts = selectedCategory === "All"
    ? products
    : products.filter(p => p.category === selectedCategory)

  // Fetch products + wishlist once
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, wishRes] = await Promise.all([
          fetch(`${API_BASE}/get-products.php`),
          fetch(`${API_BASE}/wishlist.php`)
        ])

        const [prodData, wishData] = await Promise.all([prodRes.json(), wishRes.json()])

        if (prodData.status === "success") setProducts(prodData.data)
        if (wishData.status === "success") {
          setWishlistIds(new Set(wishData.data.map((i: any) => Number(i.id))))
        }
      } catch (err) {
        console.error("Fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Listen to wishlist updates (from header, etc.)
  useEffect(() => {
    const handleUpdate = () => {
      fetch(`${API_BASE}/wishlist.php`)
        .then(r => r.json())
        .then(data => {
          if (data.status === "success") {
            setWishlistIds(new Set(data.data.map((i: any) => Number(i.id))))
          }
        })
        .catch(console.error)
    }

    window.addEventListener("wishlist-updated", handleUpdate)
    return () => window.removeEventListener("wishlist-updated", handleUpdate)
  }, [])

  // Add to Cart
  const addToCart = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLoadingItem(product.id)

    try {
      const res = await fetch(`${API_BASE}/cart.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product.id, quantity: 0.25 })
      })
      const data = await res.json()

      if (data.status === "success") {
        setAddedItems(prev => new Set(prev).add(product.id))
        setTimeout(() => {
          setAddedItems(prev => { const s = new Set(prev); s.delete(product.id); return s })
        }, 1500)

        window.dispatchEvent(new CustomEvent("celebrate-action", {
          detail: { action: "cart-add", product }
        }))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingItem(null)
    }
  }

  // Toggle Wishlist
  const toggleWishlist = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLoadingItem(product.id)
    const isWishlisted = wishlistIds.has(product.id)

    try {
      const method = isWishlisted ? "DELETE" : "POST"
      const url = isWishlisted
        ? `${API_BASE}/wishlist.php?product_id=${product.id}`
        : `${API_BASE}/wishlist.php`

      const res = await fetch(url, {
        method,
        headers: isWishlisted ? {} : { "Content-Type": "application/json" },
        body: !isWishlisted ? JSON.stringify({ product_id: product.id }) : undefined
      })
      const data = await res.json()

      if (data.status === "success" || data.status === "info") {
        setWishlistIds(prev => {
          const set = new Set(prev)
          isWishlisted ? set.delete(product.id) : set.add(product.id)
          return set
        })

        window.dispatchEvent(new CustomEvent("celebrate-action", {
          detail: {
            action: isWishlisted ? "wishlist-remove" : "wishlist-add",
            product
          }
        }))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingItem(null)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Fresh Products</h2>
        <p className="text-sm text-gray-600 mt-1">{filteredProducts.length} items</p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
        {categories.map(cat => {
          const count = cat === "All" ? products.length : products.filter(p => p.category === cat).length
          const isActive = selectedCategory === cat

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${isActive
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {cat} ({count})
            </button>
          )
        })}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredProducts.map(product => {
          const isWishlisted = wishlistIds.has(product.id)
          const isAdded = addedItems.has(product.id)
          const isLoading = loadingItem === product.id

          return (
            <a
              key={product.id}
              href={`/product-details/${encodeURIComponent(product.name)}`}
              className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="aspect-square relative bg-gray-50">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.stock < 20 && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    Low
                  </span>
                )}
                <button
                  onClick={e => toggleWishlist(product, e)}
                  disabled={isLoading}
                  className={`absolute top-2 right-2 p-1.5 rounded-full transition-all ${isWishlisted ? "bg-red-500 text-white" : "bg-white/80 text-gray-600"
                    }`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
                </button>
              </div>

              {/* Content */}
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-green-600 font-bold text-sm">₹{product.price_per_kg}</span>
                    <span className="text-xs text-gray-500">/kg</span>
                  </div>
                  <button
                    onClick={e => addToCart(product, e)}
                    disabled={isLoading || product.stock === 0}
                    className={`p-1.5 rounded-lg transition-all ${isAdded
                        ? "bg-green-600 text-white"
                        : "bg-green-500 text-white hover:bg-green-600"
                      } disabled:opacity-50`}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isAdded ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <ShoppingCart className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </a>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">No products</div>
          <p className="text-gray-500">Try another category</p>
        </div>
      )}

      {/* Hide scrollbar */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}