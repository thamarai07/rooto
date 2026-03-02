"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Heart, ShoppingCart, Star, Plus, Check } from "lucide-react"

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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost/vfs_portal/vfs-admin/api"

export default function ProductCard({ product }: { product: Product }) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [loading, setLoading] = useState(false)

  // Check if in wishlist on mount
  useEffect(() => {
    checkWishlistStatus()
  }, [product.id])

  const checkWishlistStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/wishlist.php`)
      const data = await res.json()
      if (data.status === "success") {
        const inWishlist = data.data.some((item: any) => item.id === product.id)
        setIsWishlisted(inWishlist)
      }
    } catch (error) {
      console.error("Error checking wishlist:", error)
    }
  }

  // Toggle Wishlist
  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)

    try {
      if (isWishlisted) {
        // Remove from wishlist
        const res = await fetch(`${API_BASE}/wishlist.php?product_id=${product.id}`, {
          method: "DELETE"
        })
        const data = await res.json()

        // Inside toggleWishlist → after success
        if (data.status === "success") {
          setIsWishlisted(false)

          // OLD: window.dispatchEvent(new Event("wishlist-updated"))
          // NEW: Celebration Popup Trigger
          window.dispatchEvent(
            new CustomEvent("celebrate-action", {
              detail: {
                action: "wishlist-remove",
                product: {
                  id: product.id,
                  name: product.name,
                  price: product.price_per_kg,
                  image: product.image
                }
              }
            })
          )
        }
      } else {
        // Add to wishlist
        const res = await fetch(`${API_BASE}/wishlist.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: product.id })
        })
        const data = await res.json()

        // Inside else (add to wishlist)
        if (data.status === "success" || data.status === "info") {
          setIsWishlisted(true)

          // OLD: window.dispatchEvent(new Event("wishlist-updated"))
          // NEW: Celebration Popup Trigger
          window.dispatchEvent(
            new CustomEvent("celebrate-action", {
              detail: {
                action: "wishlist-add",
                product: {
                  id: product.id,
                  name: product.name,
                  price: product.price_per_kg,
                  image: product.image
                }
              }
            })
          )
        }
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error)
    } finally {
      setLoading(false)
    }
  }

  // Add to Cart
  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/cart.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 0.25 // Default 250g
        })
      })

      const data = await res.json()

      // Inside addToCart → after success
      if (data.status === "success") {
        setAddedToCart(true)

        // OLD: window.dispatchEvent(new Event("cart-updated"))
        // NEW: Celebration Popup Trigger
        window.dispatchEvent(
          new CustomEvent("celebrate-action", {
            detail: {
              action: "cart-add",
              product: {
                id: product.id,
                name: product.name,
                price: product.price_per_kg,
                image: product.image
              }
            }
          })
        )

        setTimeout(() => setAddedToCart(false), 2000)
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Link href={`/product-details/${encodeURIComponent(product.name)}`}>
      <div
        className={`group relative cursor-pointer rounded-2xl overflow-hidden bg-white border-2 transition-all duration-300 ${isHovered
            ? "border-green-400 shadow-2xl -translate-y-2"
            : "border-gray-200 shadow-lg hover:shadow-xl"
          }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-green-50 to-lime-100">
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? "scale-125 rotate-3" : "scale-100"
              }`}
          />

          {/* Wishlist Button */}
          <button
            onClick={toggleWishlist}
            disabled={loading}
            className={`absolute top-3 right-3 p-3 rounded-full backdrop-blur-md transition-all duration-300 ${isWishlisted
                ? "bg-red-500 scale-110 shadow-xl"
                : "bg-white/90 hover:bg-white hover:scale-110"
              }`}
          >
            <Heart
              className={`w-5 h-5 transition-all ${isWishlisted ? "fill-white text-white animate-pulse" : "text-gray-700"
                }`}
            />
          </button>

          {/* Category Badge */}
          <div className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">
            {product.category}
          </div>

          {/* Stock Badge */}
          {product.stock < 20 && (
            <div className="absolute bottom-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              Low Stock!
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-bold text-xl mb-2 text-gray-900 group-hover:text-green-600 transition line-clamp-2 leading-tight">
            {product.name}
          </h3>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 font-medium">(4.5)</span>
          </div>

          {/* Price and Add to Cart */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-3xl font-black text-green-600">
                ₹{product.price_per_kg}
              </span>
              <span className="text-sm text-gray-500 font-medium ml-1">/kg</span>
            </div>

            <button
              onClick={addToCart}
              disabled={loading || product.stock === 0}
              className={`relative px-5 py-3 rounded-full font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${addedToCart
                  ? "bg-green-600 text-white scale-110"
                  : "bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600 hover:scale-110 hover:shadow-xl"
                }`}
            >
              {addedToCart ? (
                <Check className="w-5 h-5" />
              ) : (
                <ShoppingCart className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Quick Add Button (on hover) */}
          <div className={`mt-3 overflow-hidden transition-all duration-300 ${isHovered ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
            }`}>
            <button
              onClick={(e) => {
                e.preventDefault()
                window.location.href = `/product-details?item=${encodeURIComponent(product.name)}`
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Quick View
            </button>
          </div>
        </div>

        {/* Hover Glow Effect */}
        <div className={`absolute inset-0 bg-gradient-to-t from-green-500/10 to-transparent pointer-events-none transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"
          }`} />
      </div>
    </Link>
  )
}