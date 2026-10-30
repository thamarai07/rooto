"use client"

import { useState } from "react"
import Link from "next/link"
import { ShoppingCart, TrendingUp, Star, ArrowRight, Heart, Leaf, Truck, Wallet, Check, Plus, Loader2 } from "lucide-react"
import { FREE_SHIPPING_THRESHOLD } from "@/lib/pricing"

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

interface EmptyCartProps {
  demandProducts: Product[]
  onAddToCart: (product: Product) => void | Promise<void>
}

// The search/top-selling API hard-codes a localhost image base — rewrite for live.
const fixImg = (url?: string): string =>
  (url || "").replace(/^https?:\/\/localhost(:\d+)?\/vfs_portal/i, "https://seashell-skunk-617240.hostingersite.com")
const PLACEHOLDER = "https://placehold.co/300x300/e5e7eb/6b7280?text=No+Image"

// Fruits floating around the cart illustration: [emoji, position classes, delay]
const FLOATING_FRUITS: [string, string, string][] = [
  ["🍎", "top-2 left-6 sm:left-10 text-3xl sm:text-4xl", "0s"],
  ["🍊", "top-10 right-4 sm:right-10 text-2xl sm:text-3xl", "0.6s"],
  ["🍇", "bottom-4 left-2 sm:left-6 text-2xl sm:text-3xl", "1.2s"],
  ["🥭", "bottom-0 right-8 sm:right-14 text-3xl sm:text-4xl", "1.8s"],
  ["🍌", "top-1/2 -left-1 sm:left-0 text-xl sm:text-2xl", "2.4s"],
  ["🍉", "top-1/3 -right-1 sm:right-0 text-xl sm:text-2xl", "3s"],
]

const PERKS = [
  { icon: Leaf, title: "Farm fresh", text: "Hand-picked daily" },
  { icon: Truck, title: "Free delivery", text: `On orders above ₹${FREE_SHIPPING_THRESHOLD}` },
  { icon: Wallet, title: "Cash on delivery", text: "Pay when it arrives" },
]

export default function EmptyCart({ demandProducts, onAddToCart }: EmptyCartProps) {
  const [addingId, setAddingId] = useState<number | null>(null)
  const [addedIds, setAddedIds] = useState<number[]>([])

  const handleAdd = async (product: Product) => {
    setAddingId(product.id)
    try {
      await onAddToCart({ ...product, image: fixImg(product.image) })
      setAddedIds((ids) => [...ids, product.id])
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="space-y-10 sm:space-y-14">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-3xl bg-white border border-green-100 shadow-xl shadow-green-900/5 animate-in fade-in-0 zoom-in-95 duration-500">
        {/* Decorative background blobs */}
        <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-green-200/40 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-28 -right-20 w-80 h-80 rounded-full bg-emerald-200/40 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute top-10 right-1/3 w-40 h-40 rounded-full bg-orange-100/60 blur-3xl" />

        <div className="relative grid md:grid-cols-2 items-center gap-6 md:gap-10 px-5 py-10 sm:px-10 sm:py-14 lg:px-16">
          {/* Illustration */}
          <div className="relative mx-auto w-64 h-56 sm:w-80 sm:h-64 md:order-2">
            {FLOATING_FRUITS.map(([emoji, pos, delay]) => (
              <span
                key={emoji}
                aria-hidden
                className={`absolute ${pos} rooto-float select-none drop-shadow-md`}
                style={{ animationDelay: delay }}
              >
                {emoji}
              </span>
            ))}

            <div className="absolute inset-0 flex items-center justify-center">
              <span aria-hidden className="absolute w-32 h-32 sm:w-40 sm:h-40 rounded-full border-2 border-green-300 rooto-ring" />
              <span aria-hidden className="absolute w-32 h-32 sm:w-40 sm:h-40 rounded-full border-2 border-emerald-300 rooto-ring" style={{ animationDelay: "1.2s" }} />
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-2xl shadow-green-600/30 flex items-center justify-center">
                <ShoppingCart className="w-14 h-14 sm:w-20 sm:h-20 text-white rooto-bob" strokeWidth={1.75} />
              </div>
            </div>
          </div>

          {/* Copy & actions */}
          <div className="text-center md:text-left md:order-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs sm:text-sm font-semibold text-green-700 animate-in fade-in-0 slide-in-from-bottom-3 duration-500 fill-mode-both" style={{ animationDelay: "100ms" }}>
              <Leaf className="w-3.5 h-3.5" /> Fresh stock just arrived
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 animate-in fade-in-0 slide-in-from-bottom-3 duration-500 fill-mode-both" style={{ animationDelay: "200ms" }}>
              Your cart is{" "}
              <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">feeling empty</span>
            </h2>
            <p className="mt-3 text-base sm:text-lg text-gray-600 max-w-md mx-auto md:mx-0 animate-in fade-in-0 slide-in-from-bottom-3 duration-500 fill-mode-both" style={{ animationDelay: "300ms" }}>
              Juicy, hand-picked fruits are just a tap away. Fill it up and we'll bring them to your door.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row sm:flex-wrap gap-3 justify-center md:justify-start animate-in fade-in-0 slide-in-from-bottom-3 duration-500 fill-mode-both" style={{ animationDelay: "400ms" }}>
              <Link
                href="/products"
                className="group relative overflow-hidden whitespace-nowrap inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 px-7 py-3.5 text-base sm:text-lg font-semibold text-white shadow-lg shadow-green-600/30 transition-all hover:shadow-xl hover:shadow-green-600/40 hover:-translate-y-0.5 active:translate-y-0"
              >
                <span aria-hidden className="absolute inset-y-0 left-0 w-1/3 bg-white/25 rooto-shine" />
                Start Shopping
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/wishlist"
                className="whitespace-nowrap inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-gray-200 bg-white px-6 py-3.5 text-base font-semibold text-gray-700 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <Heart className="w-5 h-5" />
                View Wishlist
              </Link>
            </div>
          </div>
        </div>

        {/* Perks */}
        <div className="relative grid grid-cols-1 sm:grid-cols-3 border-t border-green-100 bg-green-50/50">
          {PERKS.map(({ icon: Icon, title, text }, i) => (
            <div
              key={title}
              className="flex items-center gap-3 px-5 py-4 sm:justify-center border-green-100 [&:not(:last-child)]:border-b sm:[&:not(:last-child)]:border-b-0 sm:[&:not(:last-child)]:border-r animate-in fade-in-0 slide-in-from-bottom-2 duration-500 fill-mode-both"
              style={{ animationDelay: `${500 + i * 100}ms` }}
            >
              <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                <Icon className="w-5 h-5 text-green-600" />
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-bold text-gray-800">{title}</span>
                <span className="block text-xs text-gray-500">{text}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Currently in demand ── */}
      {demandProducts.length > 0 && (
        <section>
          <div className="flex items-end justify-between gap-3 mb-5 animate-in fade-in-0 slide-in-from-bottom-3 duration-500 fill-mode-both" style={{ animationDelay: "600ms" }}>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-500" />
              </span>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Currently in Demand</h2>
                <p className="text-xs sm:text-sm text-gray-500">What everyone's adding right now</p>
              </div>
            </div>
            <Link href="/products" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-green-600 hover:text-green-700 group">
              View all <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {demandProducts.slice(0, 4).map((product, i) => {
              const price = Number(product.price_per_kg || product.price || 0)
              const isAdding = addingId === product.id
              const isAdded = addedIds.includes(product.id)
              return (
                <div
                  key={product.id}
                  className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-900/10 hover:border-green-200 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 fill-mode-both"
                  style={{ animationDelay: `${700 + i * 100}ms` }}
                >
                  <Link href={`/product/${product.id}`} className="relative block aspect-square overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50">
                    <img
                      src={fixImg(product.image)}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => { e.currentTarget.src = PLACEHOLDER }}
                    />
                    {(product.total_sold ?? 0) > 50 && (
                      <span className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-0.5 rounded-full text-[11px] font-bold shadow flex items-center gap-1">
                        <Star className="w-3 h-3 fill-white" /> Hot
                      </span>
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col p-3 sm:p-4">
                    <span className="self-start text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-semibold">{product.category}</span>
                    <Link href={`/product/${product.id}`} className="mt-1.5 font-bold text-sm sm:text-base text-gray-800 leading-snug line-clamp-2 group-hover:text-green-600 transition-colors">
                      {product.name}
                    </Link>
                    <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                      <p className="leading-none">
                        <span className="text-base sm:text-xl font-bold text-gray-900">₹{price.toFixed(0)}</span>
                        <span className="text-xs text-gray-500">/kg</span>
                      </p>
                      <button
                        onClick={() => handleAdd(product)}
                        disabled={isAdding}
                        aria-label={`Add ${product.name} to cart`}
                        className={`flex-shrink-0 inline-flex items-center gap-1 rounded-xl px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all active:scale-95 ${isAdded
                          ? "bg-green-100 text-green-700"
                          : "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md shadow-green-600/20 hover:shadow-lg"}`}
                      >
                        {isAdding ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isAdded ? (
                          <><Check className="w-4 h-4 animate-in zoom-in-50 duration-200" /> Added</>
                        ) : (
                          <><Plus className="w-4 h-4" /> Add</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
