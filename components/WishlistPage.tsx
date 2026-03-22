"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Heart, ArrowLeft, ShoppingCart, Loader2, TrendingUp, Star, Check, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"
import Footer from "@/components/footer"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://rootoportal.onrender.com/api"
const getUserId = (): number | null => {
  try {
    const user = localStorage.getItem("auth_user")
    return user ? JSON.parse(user).id : null
  } catch { return null }
}
interface WishlistItem {
  id: number
  name: string
  price_per_kg: number
  image: string
  category?: string
  stock: number
  description?: string
}

interface Product {
  id: number
  name: string
  price: number
  price_per_kg: number
  image: string
  category: string
  stock: number
  description?: string
  total_sold?: number
}

// Celebration Popup Component
function CelebrationPopup({ show, action, product }: any) {
  if (!show) return null

  const messages = {
    "cart-add": "Added to Cart! 🛒",
    "wishlist-add": "Added to Wishlist! ❤️",
    "cart-remove": "Removed from Cart",
    "wishlist-remove": "Removed from Wishlist"
  }

  return (
    <div className="fixed top-24 right-6 z-[100] animate-slideInRight">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-green-200 p-4 min-w-[320px] max-w-[400px]">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-green-300">
            <img src={product?.image} alt={product?.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {action?.includes("cart") && <ShoppingCart className="w-5 h-5 text-green-600" />}
              {action?.includes("wishlist") && <Heart className="w-5 h-5 text-red-500 fill-red-500" />}
              <span className="font-bold text-gray-800">{messages[action as keyof typeof messages]}</span>
            </div>
            <p className="text-sm text-gray-600 font-medium line-clamp-1">{product?.name}</p>
            <p className="text-green-600 font-bold text-sm">₹{product?.price?.toFixed(2)}</p>
          </div>
          <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
        </div>
      </div>
    </div>
  )
}

// Skeleton Components
function WishlistItemSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden animate-pulse">
      <div className="h-56 bg-gray-200"></div>
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
        <div className="h-6 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-24"></div>
          <div className="h-10 bg-gray-200 rounded-full w-10"></div>
        </div>
      </div>
    </div>
  )
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [demandProducts, setDemandProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState<number | null>(null)
  const [celebration, setCelebration] = useState({ show: false, action: "", product: null })

  // Fetch wishlist items from API
  const fetchWishlist = async () => {
    try { const userId = getUserId()
      if (!userId) return   
      const response = await fetch(`${API_BASE}/wishlist.php?user_id=${userId}`, {
        credentials: 'include'
      })
      const data = await response.json()

      if (data.status === "success") {
        setWishlistItems(data.data)

        // Trigger wishlist update event for header
        window.dispatchEvent(new Event("wishlist-updated"))
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error)
    }
  }

  // Fetch on-demand products (trending/top selling)
  const fetchDemandProducts = async () => {
    try {
      const response = await fetch(`${API_BASE}/get-products_search.php?search=`)
      const data = await response.json()

      if (data.success && data.topSelling) {
        setDemandProducts(data.topSelling)
      }
    } catch (error) {
      console.error("Error fetching demand products:", error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([fetchWishlist(), fetchDemandProducts()])
      setIsLoading(false)
    }

    loadData()

    // Listen for celebration events
    const handleCelebration = (e: any) => {
      setCelebration({ show: true, action: e.detail.action, product: e.detail.product })
      setTimeout(() => setCelebration({ show: false, action: "", product: null }), 3000)
    }

    // Listen for wishlist updates from other components
    const handleWishlistUpdate = () => {
      fetchWishlist()
    }

    window.addEventListener("celebrate-action", handleCelebration)
    window.addEventListener("wishlist-updated", handleWishlistUpdate)

    return () => {
      window.removeEventListener("celebrate-action", handleCelebration)
      window.removeEventListener("wishlist-updated", handleWishlistUpdate)
    }
  }, [])

  // Remove item from wishlist
  const removeFromWishlist = async (productId: number) => {
    const itemToRemove = wishlistItems.find(item => item.id === productId)
    const updatedItems = wishlistItems.filter(item => item.id !== productId)
    setWishlistItems(updatedItems)
    setIsUpdating(productId)

    try {
      const response = await fetch(
        `${API_BASE}/wishlist.php?product_id=${productId}&user_id=${getUserId()}`,
        { method: "DELETE", credentials: 'include' }
      )

      const data = await response.json()

      if (data.status === "success") {
        if (itemToRemove) {
          window.dispatchEvent(new CustomEvent("celebrate-action", {
            detail: {
              action: "wishlist-remove",
              product: {
                name: itemToRemove.name,
                price: itemToRemove.price_per_kg,
                image: itemToRemove.image
              }
            }
          }))
        }
        await fetchWishlist()
      } else {
        await fetchWishlist()
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error)
      await fetchWishlist()
    } finally {
      setIsUpdating(null)
    }
  }

  // Add to cart from wishlist
  const addToCart = async (item: WishlistItem) => {
    setIsUpdating(item.id)

    try {
      const response = await fetch(`${API_BASE}/cart.php`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        credentials: 'include', 
        body: JSON.stringify({ product_id: item.id, quantity: 0.25,user_id: getUserId() }),
      })

      const data = await response.json()

      if (data.status === "success") {
        window.dispatchEvent(new CustomEvent("celebrate-action", {
          detail: {
            action: "cart-add",
            product: {
              name: item.name,
              price: item.price_per_kg,
              image: item.image
            }
          }
        }))

        // Optionally remove from wishlist after adding to cart
        // await removeFromWishlist(item.id)
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
    } finally {
      setIsUpdating(null)
    }
  }

  // Move all to cart
  const moveAllToCart = async () => {
    for (const item of wishlistItems) {
      await addToCart(item)
    }
  }

  // Add product to wishlist from demand products
  const addToWishlist = async (product: Product) => {
    try {
      const response = await fetch(`${API_BASE}/wishlist.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ product_id: product.id, user_id: getUserId()    }),
      })

      const data = await response.json()

      if (data.status === "success" || data.status === "info") {
        await fetchWishlist()

        window.dispatchEvent(new CustomEvent("celebrate-action", {
          detail: {
            action: "wishlist-add",
            product: {
              name: product.name,
              price: product.price_per_kg,
              image: product.image
            }
          }
        }))
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-pink-50 via-red-50 to-white">
      <Header />

      {/* Celebration Popup */}
      <CelebrationPopup show={celebration.show} action={celebration.action} product={celebration.product} />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 mb-6 transition font-semibold"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Shopping</span>
            </Link>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white fill-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800">My Wishlist</h1>
            </div>
            {!isLoading && (
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  {wishlistItems.length > 0
                    ? `${wishlistItems.length} item${wishlistItems.length > 1 ? 's' : ''} saved for later`
                    : 'Your wishlist is empty'}
                </p>
                {wishlistItems.length > 0 && (
                  <Button
                    onClick={moveAllToCart}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Move All to Cart
                  </Button>
                )}
              </div>
            )}
          </div>

          {isLoading ? (
            // Skeleton Loading
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <WishlistItemSkeleton key={i} />
              ))}
            </div>
          ) : wishlistItems.length === 0 ? (
            // Empty Wishlist State
            <div>
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center border-2 border-gray-100 mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-12 h-12 text-red-500" />
                </div>
                <h2 className="text-3xl font-bold mb-3 text-gray-800">Your wishlist is empty</h2>
                <p className="text-gray-600 mb-8 text-lg">
                  Save your favorite products here to easily find them later!
                </p>
                <Link href="/">
                  <Button className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all">
                    Explore Products
                  </Button>
                </Link>
              </div>

              {/* Currently in Demand Products */}
              {demandProducts.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-6 h-6 text-orange-500" />
                    <h2 className="text-2xl font-bold text-gray-800">Trending Products</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {demandProducts.slice(0, 4).map((product) => (
                      <div
                        key={product.id}
                        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border-2 border-gray-100 hover:border-red-300 overflow-hidden group"
                      >
                        <div className="relative h-48 bg-gradient-to-br from-red-50 to-pink-50">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          {product.total_sold && product.total_sold > 0 && (
                            <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                              <Star className="w-3 h-3 fill-white" />
                              Hot
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <div className="mb-3">
                            {product.category && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
                                {product.category}
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-red-600 transition line-clamp-2">
                            {product.name}
                          </h3>
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <span className="text-2xl font-bold text-red-600">
                                ₹{product.price_per_kg.toFixed(2)}
                              </span>
                              <span className="text-sm text-gray-500 ml-1">/kg</span>
                            </div>
                          </div>
                          <Button
                            onClick={() => addToWishlist(product)}
                            className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
                          >
                            <Heart className="w-4 h-4 mr-2" />
                            Add to Wishlist
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Wishlist with Items
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {wishlistItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border-2 border-gray-100 hover:border-red-300 overflow-hidden group relative"
                  >
                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      disabled={isUpdating === item.id}
                      className="absolute top-3 right-3 z-10 p-2 bg-white/90 hover:bg-red-500 text-red-500 hover:text-white rounded-full shadow-lg transition-all backdrop-blur-sm"
                    >
                      {isUpdating === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </button>

                    {/* Low Stock Badge */}
                    {item.stock < 20 && (
                      <div className="absolute top-3 left-3 z-10 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        Low Stock
                      </div>
                    )}

                    <Link href={`/product-details/${encodeURIComponent(item.name)}`}>
                      <div className="relative h-56 bg-gradient-to-br from-red-50 to-pink-50">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>

                    <div className="p-5">
                      <div className="mb-3">
                        {item.category && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
                            {item.category}
                          </span>
                        )}
                      </div>

                      <Link href={`/product-details/${encodeURIComponent(item.name)}`}>
                        <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-red-600 transition line-clamp-2 min-h-[3.5rem]">
                          {item.name}
                        </h3>
                      </Link>

                      {item.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mb-3">
                        {item.price_per_kg && <div>
                          <span className="text-2xl font-bold text-red-600">
                            ₹{item.price_per_kg.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500 ml-1">/kg</span>
                        </div>}
                        <span className="text-sm text-gray-500">
                          {item.stock} kg available
                        </span>
                      </div>

                      <Button
                        onClick={() => addToCart(item)}
                        disabled={isUpdating === item.id || item.stock === 0}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {isUpdating === item.id ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <ShoppingCart className="w-4 h-4 mr-2" />
                        )}
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}