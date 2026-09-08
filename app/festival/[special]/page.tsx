"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ShoppingCart, Loader2, AlertCircle, PartyPopper, ArrowRight } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import FestivalHero from "@/components/festival/FestivalHero"
import FestivalSearchBar from "@/components/festival/FestivalSearchBar"
import FestivalProductCard from "@/components/festival/FestivalProductCard"
import {
  getFestival,
  type Festival,
  type FestivalProduct,
} from "@/lib/festivals.api"
import {
  readCart,
  addItem,
  setItemQuantity,
  type CartLine,
} from "@/components/festival/festivalCart"

type ViewState = "loading" | "ok" | "notfound" | "error"

export default function FestivalPage() {
  const params = useParams()
  const rawSpecial = Array.isArray(params?.special) ? params.special[0] : params?.special
  const slug = rawSpecial ? decodeURIComponent(rawSpecial) : ""

  const [view, setView] = useState<ViewState>("loading")
  const [festival, setFestival] = useState<Festival | null>(null)
  const [items, setItems] = useState<FestivalProduct[]>([])
  const [cart, setCart] = useState<Record<number, CartLine>>({})
  const [busyId, setBusyId] = useState<number | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  // ── load festival ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!slug) return
    let alive = true
    setView("loading")
    getFestival(slug).then((res) => {
      if (!alive) return
      if (res.status === "success" && res.festival) {
        setFestival(res.festival)
        setItems(res.items ?? [])
        setView("ok")
      } else if (res.httpStatus === 404) {
        setView("notfound")
      } else {
        setView("error")
      }
    })
    return () => {
      alive = false
    }
  }, [slug])

  // ── sync cart from the EXISTING cart system ────────────────────────────────
  const refreshCart = useCallback(() => {
    readCart().then(setCart)
  }, [])

  useEffect(() => {
    refreshCart()
    window.addEventListener("cart-updated", refreshCart)
    window.addEventListener("guest-cart-updated", refreshCart)
    return () => {
      window.removeEventListener("cart-updated", refreshCart)
      window.removeEventListener("guest-cart-updated", refreshCart)
    }
  }, [refreshCart])

  const flash = (m: string) => {
    setToast(m)
    setTimeout(() => setToast(null), 2500)
  }

  const handleAdd = useCallback(
    async (product: FestivalProduct, unit: string, qty: number) => {
      setBusyId(product.id)
      const r = await addItem(product, unit, qty)
      setBusyId(null)
      flash(r.ok ? "Added to cart" : r.message || "Could not add to cart")
      refreshCart()
    },
    [refreshCart]
  )

  const handleSetQty = useCallback(
    async (product: FestivalProduct, unit: string, qty: number) => {
      // optimistic
      setCart((prev) => {
        const next = { ...prev }
        if (qty <= 0) delete next[product.id]
        else next[product.id] = { productId: product.id, unit, quantity: qty }
        return next
      })
      await setItemQuantity(product, unit, qty)
      refreshCart()
    },
    [refreshCart]
  )

  const cartCount = Object.keys(cart).length

  // ── render states ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {view === "loading" && (
        <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-4 py-6">
          <div className="h-28 sm:h-36 bg-gray-100 rounded-xl animate-pulse mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-[0_1px_6px_rgba(0,0,0,0.09)] overflow-hidden">
                <div className="w-full aspect-square bg-gray-200 animate-pulse" />
                <div className="p-2 space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
                  <div className="h-7 bg-gray-200 rounded animate-pulse mt-2" />
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {view === "notfound" && (
        <main className="flex-1 grid place-items-center px-4 py-20 text-center">
          <div>
            <PartyPopper className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900">Festival not found</h1>
            <p className="text-gray-500 mt-2">
              This festival isn&apos;t available right now.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-lg"
            >
              Browse all products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </main>
      )}

      {view === "error" && (
        <main className="flex-1 grid place-items-center px-4 py-20">
          <div className="max-w-md bg-red-50 border-2 border-red-200 rounded-xl p-6 flex gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-900">Unable to load this festival</h3>
              <p className="text-red-700 text-sm mt-1">
                Please check your connection and try again.
              </p>
              <button
                onClick={() => location.reload()}
                className="mt-3 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg"
              >
                Retry
              </button>
            </div>
          </div>
        </main>
      )}

      {view === "ok" && festival && (
        <main className="flex-1 bg-gray-50/60">
          <FestivalHero festival={festival} />
          <FestivalSearchBar themeColor={festival.theme_color || undefined} />

          <section className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900">
                  No products yet
                </h3>
                <p className="text-gray-500 mt-2 text-sm">
                  Products for {festival.name} will be added soon.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-end justify-between gap-3 mb-4 pb-2.5 border-b-2 border-gray-200">
                  <h2 className="text-base sm:text-lg font-black text-gray-900">
                    {festival.name} Specials
                  </h2>
                  <span className="text-xs sm:text-sm font-bold text-gray-500 whitespace-nowrap">
                    {items.length} {items.length === 1 ? "product" : "products"}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3 pb-24">
                  {items.map((p) => (
                    <FestivalProductCard
                      key={p.id}
                      product={p}
                      line={cart[p.id] ?? null}
                      busy={busyId === p.id}
                      onAdd={(unit, qty) => handleAdd(p, unit, qty)}
                      onSetQty={(unit, qty) => handleSetQty(p, unit, qty)}
                    />
                  ))}
                </div>
              </>
            )}
          </section>
        </main>
      )}

      {/* sticky cart bar — links into the EXISTING cart page */}
      {cartCount > 0 && (
        <Link
          href="/cart"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-green-600 hover:bg-green-700 text-white font-extrabold text-sm px-6 py-3.5 rounded-full shadow-2xl shadow-green-900/30 flex items-center gap-2.5 active:scale-95 transition"
        >
          <ShoppingCart className="w-4 h-4" strokeWidth={2.5} />
          View cart ({cartCount}) <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </Link>
      )}

      {toast && (
        <div className="fixed top-20 right-4 z-[10000] bg-gray-900 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      <Footer />
    </div>
  )
}
