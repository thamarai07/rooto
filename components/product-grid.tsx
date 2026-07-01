"use client"

import { useEffect, useState, useCallback, useRef, memo } from "react"
import dynamic from "next/dynamic"
import { Heart, ShoppingCart, Star, Loader2, X, Plus, Minus, Trash2, User, LogIn, ArrowRight, Package } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { UserData, SavedAddress } from "@/components/types"

// These only render after a user interaction (login / checkout), so keep them
// OUT of the initial bundle — they were forcing the whole checkout/auth flow to
// download before the product cards could even hydrate.
const LoginModal = dynamic(() => import("@/components/auth/LoginModal"), { ssr: false })
const SignupModal = dynamic(() => import("@/components/auth/SignupModal"), { ssr: false })
const DeliveryModal = dynamic(() => import("@/components/delivery/DeliveryModal"), { ssr: false })
const CheckoutSuccessView = dynamic(() => import("@/components/delivery/CheckoutSuccessView"), { ssr: false })
import {
  getGuestCart,
  getGuestWishlist,
  addToGuestCart,
  toggleGuestWishlist,
  updateGuestCartQty,
  removeFromGuestCart,
} from "@/lib/guestStorage"
import { authHeaders } from "@/lib/auth"
import { useAuth } from "@/hooks/useAuth"
import { cartTotals, unitPrice, lineSubtotal } from "@/lib/pricing"
import OutOfStockModal from "@/components/OutOfStockModal"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://seashell-skunk-617240.hostingersite.com/vfs-admin/api"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getUserId = (): number | null => {
  try {
    const user = localStorage.getItem("auth_user")
    return user ? JSON.parse(user).id : null
  } catch { return null }
}

// The cart drawer auto-opens only on desktop. On mobile the in-card stepper is
// enough — popping a drawer on every tap is jarring on small screens.
const isDesktop = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches

// The API returns numeric fields as strings ("0.25") — coerce so quantity math
// (e.g. quantity + 0.25) adds instead of concatenating, and .toFixed() is safe.
const normalizeCartItem = (i: any): CartItem => {
  const price = Number(i.price) || 0
  const quantity = Number(i.quantity) || 0
  return {
    ...i,
    price,
    quantity,
    stock: Number(i.stock) || 0,
    subtotal: i.subtotal != null ? Number(i.subtotal) || price * quantity : price * quantity,
  }
}

const truncateWords = (text: string, wordLimit = 10): string => {
  const words = text.split(' ')
  return words.length <= wordLimit ? text : words.slice(0, wordLimit).join(' ') + '...'
}

// Simple debounce util
function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: number
  name: string
  price: number
  price_per_kg: number
  image: string
  category: string
  description: string
  stock: number
  slug: string
  final_price?: number
  discount_percent?: number
}

interface CartItem {
  cart_id: number
  id: number
  name: string
  price: number
  image: string
  category?: string
  stock: number
  quantity: number
  subtotal: number
  slug?: string
}

interface ToastState {
  show: boolean
  message: string
  type: 'success' | 'error' | 'info'
}

// ─── Toast ────────────────────────────────────────────────────────────────────

const Toast = memo(function Toast({ show, message, type }: ToastState) {
  if (!show) return null
  const bgColor = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'
  const dotColor = type === 'success' ? 'bg-green-200' : type === 'error' ? 'bg-red-200' : 'bg-blue-200'
  return (
    <div className="fixed top-20 right-4 z-[10000] animate-slideIn">
      <div className={`${bgColor} px-6 py-3 rounded-lg shadow-xl text-white font-medium flex items-center gap-2`}>
        <div className={`w-2 h-2 rounded-full ${dotColor} animate-pulse`} />
        <span>{message}</span>
      </div>
    </div>
  )
})

// ─── Cart Drawer ──────────────────────────────────────────────────────────────

const CartDrawer = memo(function CartDrawer({
  isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem,
  isLoggedIn, onCheckoutClick, onLoginClick
}: {
  isOpen: boolean
  onClose: () => void
  cartItems: CartItem[]
  onUpdateQuantity: (id: number, qty: number) => void
  onRemoveItem: (id: number) => void
  isLoggedIn: boolean
  onCheckoutClick: () => void
  onLoginClick: (mode: 'login' | 'signup') => void
}) {
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const total = cartItems.reduce((sum, item) => sum + (Number(item.subtotal) || Number(item.price) * Number(item.quantity) || 0), 0)

  const handleRemove = useCallback(async (id: number) => {
    setDeletingId(id)
    await onRemoveItem(id)
    setDeletingId(null)
  }, [onRemoveItem])

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9997]"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-[9998] flex flex-col translate-x-0">
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-white" />
            <h3 className="font-semibold text-white">Cart ({cartItems.length})</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Your cart is empty</h3>
              <p className="text-gray-500 text-sm mb-5">Add some fresh products to get started!</p>
              <button
                onClick={onClose}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2 text-sm"
              >
                Continue Shopping <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {cartItems.map((item) => {
                const q = Number(item.quantity) || 0
                const price = Number(item.price) || 0
                const stock = Number(item.stock) || 0
                const atLimit = q + 0.25 > stock
                return (
                <div key={item.cart_id} data-product-id={item.id} className="bg-gray-50 rounded-xl p-3 hover:bg-gray-100/80 transition">
                  <div className="flex gap-3">
                    <Link href={`/product/${encodeURIComponent(item.slug || item.name)}`} onClick={onClose}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-gray-200 hover:opacity-80 transition"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = "https://placehold.co/80x80/e5e7eb/6b7280?text=No+Image" }}
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/product/${encodeURIComponent(item.slug || item.name)}`}
                          onClick={onClose}
                          className="font-medium text-gray-900 hover:text-green-600 text-sm line-clamp-1 transition"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => handleRemove(item.id)}
                          disabled={deletingId === item.id}
                          className="p-1 hover:bg-red-100 text-gray-400 hover:text-red-500 rounded-md transition flex-shrink-0"
                        >
                          {deletingId === item.id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">₹{price.toFixed(2)}/kg</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                          <button
                            onClick={() => onUpdateQuantity(item.id, Math.max(0.25, q - 0.25))}
                            disabled={deletingId === item.id}
                            className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition text-gray-600"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-14 text-center text-xs font-semibold text-gray-800 bg-gray-50 py-1">
                            {q.toFixed(2)} kg
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, q + 0.25)}
                            disabled={deletingId === item.id || atLimit}
                            title={atLimit ? `Only ${stock} kg available` : undefined}
                            className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition text-gray-600"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-green-600">
                          ₹{(Number(item.subtotal) || price * q).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex-shrink-0 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Subtotal:</span>
              <span className="text-xl font-bold text-gray-900">₹{total.toFixed(2)}</span>
            </div>
            {isLoggedIn ? (
              <div className="space-y-2">
                <button
                  onClick={() => { onClose(); onCheckoutClick() }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>
                <Link href="/cart" onClick={onClose}>
                  <button className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-xl font-medium transition">
                    View Full Cart
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-blue-900 font-medium text-sm">Login to checkout</p>
                    <p className="text-blue-700 text-xs">Sign in to complete your order</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { onClose(); onLoginClick('login') }}
                    className="bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-medium transition flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" /> Login
                  </button>
                  <button
                    onClick={() => { onClose(); onLoginClick('signup') }}
                    className="border-2 border-green-600 text-green-600 hover:bg-green-50 py-2.5 rounded-xl font-medium transition"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
})

// ─── Product Card ─────────────────────────────────────────────────────────────
// memo prevents re-render unless product/wishlist/loading actually change

const ProductCard = memo(function ProductCard({
  product,
  isWishlisted,
  onWishlistToggle,
  onAddToCart,
  onUpdateQuantity,
  quantity,
  isLoading,
  priority = false
}: {
  product: Product
  isWishlisted: boolean
  onWishlistToggle: (id: number) => void
  onAddToCart: (product: Product) => void
  onUpdateQuantity: (id: number, qty: number) => void
  quantity: number
  isLoading: boolean
  priority?: boolean
}) {
  // Coerce — the API can send quantity as a string ("0.25"), which would make
  // `quantity + 0.25` concatenate instead of add. Always work with a number.
  const qty = Number(quantity) || 0
  const stock = Number(product.stock) || 0
  const unit = Number(product.price_per_kg) || 0
  const atStockLimit = qty + 0.25 > stock // next +0.25 would exceed available stock
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow duration-200 flex flex-col h-full">

      {/* IMAGE + overlapping ADD */}
      <div className="relative">
        <Link href={`/product/${encodeURIComponent(product.slug)}`} className="block">
          <div className="relative w-full aspect-square bg-gray-50 rounded-2xl overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              onError={(e) => {
                e.currentTarget.src =
                  "https://placehold.co/300x300/e5e7eb/6b7280?text=No+Image"
              }}
            />
            {stock === 0 && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <span className="text-[10px] font-bold text-gray-600 bg-white px-2 py-0.5 rounded-full shadow">Out of stock</span>
              </div>
            )}
          </div>
        </Link>

        {/* WISHLIST */}
        <button
          onClick={(e) => { e.preventDefault(); onWishlistToggle(product.id) }}
          aria-label="Wishlist"
          className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-white/90 backdrop-blur shadow-sm active:scale-90 transition"
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
        </button>

        {/* ADD → turns into a − qty + stepper once the item is in the cart */}
        {qty > 0 ? (
          <div className="absolute -bottom-3 right-2 flex items-center bg-green-600 text-white rounded-lg shadow-md overflow-hidden">
            <button
              onClick={() => onUpdateQuantity(product.id, qty - 0.25)}
              aria-label="Decrease quantity"
              className="w-7 h-8 grid place-items-center active:bg-green-700 transition"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-0.5 min-w-[34px] text-center leading-none">
              <span className="block text-[11px] font-bold">{Number(qty.toFixed(2))}</span>
              <span className="block text-[8px] font-medium opacity-90 -mt-0.5">kg</span>
            </span>
            <button
              onClick={() => onUpdateQuantity(product.id, qty + 0.25)}
              disabled={atStockLimit}
              title={atStockLimit ? `Only ${stock} kg available` : undefined}
              aria-label="Increase quantity"
              className="w-7 h-8 grid place-items-center active:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onAddToCart(product)}
            disabled={isLoading || stock === 0}
            aria-label="Add to cart"
            className="absolute -bottom-3 right-2 flex items-center gap-0.5 bg-white border border-green-600 text-green-700 hover:bg-green-50 font-bold text-xs px-2.5 py-1.5 rounded-lg shadow-sm disabled:opacity-50 active:scale-95 transition"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Plus className="w-3.5 h-3.5" /> ADD</>}
          </button>
        )}
      </div>

      {/* CONTENT — image · name · price */}
      <div className="flex flex-col flex-1 px-2.5 pt-4 pb-2.5">
        <Link href={`/product/${encodeURIComponent(product.slug)}`}>
          <h3 className="text-[13px] font-semibold text-gray-800 leading-snug line-clamp-2 min-h-[2.4rem]">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto pt-1.5">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-extrabold text-gray-900">₹{product.price_per_kg}</span>
            <span className="text-[10px] text-gray-400 font-medium">/kg</span>
          </div>
          {qty > 0 && (
            <div className="mt-1.5 flex items-center justify-between rounded-lg bg-green-50 px-2 py-1">
              <span className="text-[10px] font-medium text-green-700">{Number(qty.toFixed(2))} kg</span>
              <span className="text-[11px] font-extrabold text-green-700">₹{(unit * qty).toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
},
  (prev, next) =>
    prev.isWishlisted === next.isWishlisted &&
    prev.isLoading === next.isLoading &&
    prev.quantity === next.quantity &&
    prev.product.id === next.product.id &&
    prev.product.stock === next.product.stock
)

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProductGrid({ initialProducts = [] }: { initialProducts?: Product[] }) {
  const hasInitialProducts = initialProducts.length > 0
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set())
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  // If the server already supplied products, skip the skeleton entirely.
  const [loading, setLoading] = useState(!hasInitialProducts)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' })
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [showDeliveryModal, setShowDeliveryModal] = useState(false)
  const [deliveryView, setDeliveryView] = useState<'saved' | 'map' | 'form' | 'success'>('saved')
  const [savedAddress, setSavedAddress] = useState<SavedAddress | null>(null)
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false)
  const [orderNotes, setOrderNotes] = useState("")
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [isUpdating, setIsUpdating] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("All")

  // Ref to avoid stale closure in event handlers
  const isCartOpenRef = useRef(isCartOpen)
  isCartOpenRef.current = isCartOpen

  // ─── Toast helper ────────────────────────────────────────────────────────────
  // const toastTimer = useRef<ReturnType<typeof setTimeout>>(0)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success') => {

      if (toastTimer.current) {
        clearTimeout(toastTimer.current)
      }

      setToast({ show: true, message, type })

      toastTimer.current = setTimeout(() => {
        setToast({ show: false, message: '', type: 'success' })
      }, 3000)

    },
    []
  )

  // When WE change a quantity, our optimistic value is authoritative — skip the
  // one self-triggered re-fetch so a (possibly stale) server read can't revert it.
  const skipSelfRefetch = useRef(false)

  // ─── Debounced quantity update (avoids API spam on rapid clicks) ──────────────
  const debouncedUpdateQty = useRef(
    debounce(async (productId: number, quantity: number, userId: number) => {
      try {
        await fetch(`${API_BASE}/cart.php`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({ product_id: productId, quantity })
        })
        skipSelfRefetch.current = true
        window.dispatchEvent(new Event('cart-updated'))
      } catch {
        // silent — optimistic update already applied
      }
    }, 400)
  ).current

  // ─── Auth: mirror the GLOBAL auth context so login state is never stale ───────
  // Previously this read localStorage once on mount, so logging in elsewhere
  // (e.g. the header) left this component thinking the user was still a guest —
  // which made the cart drawer show Login/Signup to logged-in users.
  const { user: authUser } = useAuth()
  useEffect(() => {
    setUser(authUser ?? null)
    setIsLoggedIn(!!authUser)
  }, [authUser])

  // ─── Out-of-stock guard (block + re-check at checkout) ───────────────────────
  const [showOOS, setShowOOS] = useState(false)
  const outOfStockItems = cartItems.filter(i => Number(i.stock) <= 0)

  // ─── Checkout trigger (from cart page) ───────────────────────────────────────
  const handleCheckoutClick = useCallback(() => {
    if (!user) { setShowAuth(true); setAuthMode("login"); return }
    if (cartItems.some(i => Number(i.stock) <= 0)) { setShowOOS(true); return }
    setShowDeliveryModal(true); setDeliveryView('saved')
  }, [user, cartItems])

  const handleRemoveOOSAndContinue = useCallback(async () => {
    for (const it of cartItems.filter(i => Number(i.stock) <= 0)) {
      await handleRemoveFromCart(Number(it.id))
    }
    setShowOOS(false)
    setShowDeliveryModal(true); setDeliveryView('saved')
  }, [cartItems]) // eslint-disable-line

  useEffect(() => {
    const handler = () => handleCheckoutClick()
    window.addEventListener('start-checkout-from-cart', handler)
    return () => window.removeEventListener('start-checkout-from-cart', handler)
  }, [handleCheckoutClick])

  // ─── Initial data fetch — products + wishlist + cart in ONE Promise.all ───────
  useEffect(() => {
    const fetchData = async () => {
      const userId = getUserId()
      try {
        if (!userId) {
          // Guest: products already came from the server (unless that failed),
          // so only fetch them as a fallback. Cart/wishlist come from localStorage.
          if (!hasInitialProducts) {
            const res = await fetch(`${API_BASE}/get-product.php?limit=12`)
            const data = await res.json()
            if (data.status === 'success') setProducts(data.items)
          }

          setCartItems(getGuestCart().map(i => ({ ...i, cart_id: i.id })))
          setWishlistIds(new Set(getGuestWishlist().map(i => i.id)))
        } else {
          // Logged-in: always need wishlist + cart; only fetch products if the
          // server didn't already provide them.
          const productsPromise = hasInitialProducts
            ? Promise.resolve(null)
            : fetch(`${API_BASE}/get-product.php?limit=12`).then(r => r.json())

          const [productsData, wishlistData, cartData] = await Promise.all([
            productsPromise,
            fetch(`${API_BASE}/wishlist.php`, { headers: authHeaders() }).then(r => r.json()),
            fetch(`${API_BASE}/cart.php`, { headers: authHeaders() }).then(r => r.json())
          ])

          if (productsData && productsData.status === 'success') setProducts(productsData.items)
          if (wishlistData.status === 'success' && wishlistData.data)
            setWishlistIds(new Set(wishlistData.data.map((i: any) => Number(i.id))))
          if (cartData.status === 'success')
            setCartItems((cartData.data || cartData.items || []).map(normalizeCartItem))
        }
      } catch {
        if (!hasInitialProducts) showToast('Failed to load products', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, []) // eslint-disable-line

  // ─── Cart update listener — only re-fetches when drawer is OPEN ──────────────
  useEffect(() => {
    const handleCartUpdate = async (e?: any) => {
      const highlightedId = e?.detail?.highlightedProductId
        ? Number(e.detail.highlightedProductId).toString()
        : null

      const userId = getUserId()
      if (!userId) {
        setCartItems(getGuestCart().map(i => ({ ...i, cart_id: i.id })))
        return
      }

      // Our own +/- just saved — trust the optimistic value, don't re-fetch/clobber it.
      if (skipSelfRefetch.current) { skipSelfRefetch.current = false; return }

      // Only hit the API if the drawer is open OR on the initial load
      // When drawer is closed, skip the fetch — data will refresh when it opens
      try {
        const res = await fetch(`${API_BASE}/cart.php`, { headers: authHeaders() })
        const data = await res.json()
        if (data.status !== 'success') return

        const items: CartItem[] = (data.data || data.items || []).map(normalizeCartItem)

        // Sort: most recently added item first
        if (highlightedId) {
          const now = Date.now()
          items.sort((a: any, b: any) => {
            if (String(a.id) === highlightedId) return -1
            if (String(b.id) === highlightedId) return 1
            return 0
          })
        }

        setCartItems(items)

        // Scroll & highlight the just-added item
        if (highlightedId && isCartOpenRef.current) {
          setTimeout(() => {
            const el = document.querySelector(`[data-product-id="${highlightedId}"]`)
            if (!el) return
            el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            el.classList.add('ring-2', 'ring-green-500', 'ring-offset-2', 'bg-green-50')
            setTimeout(() => el.classList.remove('ring-2', 'ring-green-500', 'ring-offset-2', 'bg-green-50'), 2000)
          }, 150)
        }
      } catch { /* silent */ }
    }

    const handleGuestCartUpdate = () =>
      setCartItems(getGuestCart().map(i => ({ ...i, cart_id: i.id })))

    handleCartUpdate() // initial load
    window.addEventListener('cart-updated', handleCartUpdate)
    window.addEventListener('guest-cart-updated', handleGuestCartUpdate)
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate)
      window.removeEventListener('guest-cart-updated', handleGuestCartUpdate)
    }
  }, []) // intentionally no deps — uses ref for isCartOpen

  // ─── Wishlist update listener ────────────────────────────────────────────────
  useEffect(() => {
    const handleWishlistUpdate = async () => {
      const userId = getUserId()
      if (!userId) return
      try {
        const res = await fetch(`${API_BASE}/wishlist.php`, { headers: authHeaders() })
        const data = await res.json()
        if (data.status === 'success' && data.data)
          setWishlistIds(new Set(data.data.map((i: any) => Number(i.id))))
      } catch { /* silent */ }
    }
    window.addEventListener('wishlist-updated', handleWishlistUpdate)
    return () => window.removeEventListener('wishlist-updated', handleWishlistUpdate)
  }, [])

  // ─── Wishlist toggle ─────────────────────────────────────────────────────────
  const handleWishlistToggle = useCallback(async (productId: number) => {
    const userId = getUserId()
    if (!userId) {
      const product = products.find(p => p.id === productId)
      if (!product) return
      const result = toggleGuestWishlist({
        id: product.id, name: product.name, price: unitPrice(product),
        image: product.image, category: product.category, slug: product.slug,
      })
      setWishlistIds(prev => {
        const next = new Set(prev)
        result === "added" ? next.add(productId) : next.delete(productId)
        return next
      })
      showToast(result === "added" ? "Added to wishlist!" : "Removed from wishlist", result === "added" ? "success" : "info")
      window.dispatchEvent(new Event("guest-wishlist-updated"))
      return
    }

    const isWishlisted = wishlistIds.has(productId)
    // Optimistic update
    setWishlistIds(prev => {
      const next = new Set(prev)
      isWishlisted ? next.delete(productId) : next.add(productId)
      return next
    })

    try {
      if (isWishlisted) {
        const res = await fetch(
          `${API_BASE}/wishlist.php?product_id=${productId}`,
          { method: 'DELETE', headers: authHeaders() }
        )
        const data = await res.json()
        if (data.status === 'success') {
          showToast('Removed from wishlist', 'info')
          window.dispatchEvent(new Event('wishlist-updated'))
        } else {
          // Rollback
          setWishlistIds(prev => { const n = new Set(prev); n.add(productId); return n })
        }
      } else {
        const res = await fetch(`${API_BASE}/wishlist.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({ product_id: productId })
        })
        const data = await res.json()
        if (data.status === 'success' || data.status === 'info') {
          showToast('Added to wishlist!', 'success')
          window.dispatchEvent(new Event('wishlist-updated'))
        } else {
          // Rollback
          setWishlistIds(prev => { const n = new Set(prev); n.delete(productId); return n })
        }
      }
    } catch {
      showToast('Failed to update wishlist', 'error')
      // Rollback
      setWishlistIds(prev => {
        const n = new Set(prev)
        isWishlisted ? n.add(productId) : n.delete(productId)
        return n
      })
    }
  }, [products, wishlistIds, showToast])

  // ─── Add to cart ─────────────────────────────────────────────────────────────
  const handleAddToCart = useCallback(async (product: Product) => {
    setActionLoading(product.id)
    const userId = getUserId()

    if (!userId) {
      addToGuestCart({
        id: product.id, name: product.name, price: unitPrice(product),
        image: product.image, category: product.category, stock: product.stock, slug: product.slug,
      })
      setCartItems(getGuestCart().map(i => ({ ...i, cart_id: i.id })))
      showToast('Added to cart!', 'success')
      window.dispatchEvent(new CustomEvent('guest-cart-updated', { detail: { highlightedProductId: product.id.toString() } }))
      // Drawer intentionally NOT opened on add — users adjust qty from the card. (kept for future use)
      setActionLoading(null)
      return
    }

    try {
      const res = await fetch(`${API_BASE}/cart.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ product_id: product.id, quantity: 0.25 })
      })
      const data = await res.json()
      if (data.status === 'success') {
        showToast('Added to cart!', 'success')
        window.dispatchEvent(new CustomEvent('cart-updated', { detail: { highlightedProductId: product.id.toString() } }))
        // Drawer intentionally NOT opened on add — users adjust qty from the card. (kept for future use)
      } else {
        showToast(data.message || 'Failed to add to cart', 'error')
      }
    } catch {
      showToast('Failed to add to cart', 'error')
    } finally {
      setActionLoading(null)
    }
  }, [showToast])

  // ─── Update quantity — optimistic + debounced API ────────────────────────────
  const handleUpdateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity < 0.25) { handleRemoveFromCart(productId); return }

    const userId = getUserId()
    if (!userId) {
      updateGuestCartQty(productId, quantity)
      setCartItems(getGuestCart().map(i => ({ ...i, cart_id: i.id })))
      return
    }

    // Optimistic UI update — feels instant
    setCartItems(prev => prev.map(item =>
      Number(item.id) === productId
        ? { ...item, quantity, subtotal: lineSubtotal(item.price, quantity) }
        : item
    ))
    debouncedUpdateQty(productId, quantity, userId)
  }, [debouncedUpdateQty]) // eslint-disable-line

  // ─── Remove from cart ────────────────────────────────────────────────────────
  const handleRemoveFromCart = useCallback(async (productId: number) => {
    const userId = getUserId()
    if (!userId) {
      removeFromGuestCart(productId)
      setCartItems(getGuestCart().map(i => ({ ...i, cart_id: i.id })))
      return
    }

    // Optimistic remove
    setCartItems(prev => prev.filter(item => Number(item.id) !== productId))

    try {
      const res = await fetch(`${API_BASE}/cart.php?product_id=${productId}`, { method: 'DELETE', headers: authHeaders() })
      const data = await res.json()
      if (data.status === 'success') {
        showToast('Item removed from cart', 'info')
        window.dispatchEvent(new Event('cart-updated'))
      }
    } catch {
      showToast('Failed to remove item', 'error')
    }
  }, [showToast])

  // ─── Checkout & order helpers (unchanged logic, just cleaned up) ──────────────
  const handleAddressComplete = useCallback(async (address: any) => {
    setSavedAddress(address)
    setDeliveryView('success')
    if (!address.id) {
      try {
        await fetch(`${API_BASE}/save_address.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({
            name: address.name, phoneNumber: address.phoneNumber,
            email: address.email, flatNo: address.flatNo, landmark: address.landmark || '',
            streetAddress: address.streetAddress || '', area: address.area || '',
            city: address.city || '', state: address.state || '',
            pincode: address.pincode || '', country: address.country || 'India',
            fullAddress: address.fullAddress, label: address.label,
            coordinates: address.coordinates, isDefault: false
          }),
        })
      } catch (e) { console.error("Error saving address:", e) }
    }
  }, [user])

  const handleCloseDeliveryModal = useCallback(() => {
    setShowDeliveryModal(false)
    setDeliveryView('saved')
    setSavedAddress(null)
  }, [])

  const clearCart = useCallback(async (orderId?: number) => {
    try {
      const res = await fetch(`${API_BASE}/clear_cart.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ orderId }),
      })
      const result = await res.json()
      if (result.success) {
        setCartItems([])
        window.dispatchEvent(new Event("cart-updated"))
      }
    } catch (e) { console.error("Error clearing cart:", e) }
  }, [user])

  const updateQuantityInCheckout = useCallback(async (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) { handleRemoveFromCart(productId); return }
    setCartItems(prev => prev.map(item =>
      Number(item.id) === productId ? { ...item, quantity: newQuantity, subtotal: lineSubtotal(item.price, newQuantity) } : item
    ))
    try {
      await fetch(`${API_BASE}/cart.php`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ product_id: productId, quantity: newQuantity }),
      })
      window.dispatchEvent(new Event("cart-updated"))
    } catch { /* silent */ }
  }, [handleRemoveFromCart])

  const removeItemInCheckout = useCallback(async (productId: number) => {
    setCartItems(prev => prev.filter(item => Number(item.id) !== productId))
    try {
      await fetch(`${API_BASE}/cart.php?product_id=${productId}`, { method: "DELETE", headers: authHeaders() })
      window.dispatchEvent(new Event("cart-updated"))
      showToast('Item removed from cart', 'info')
    } catch { /* silent */ }
  }, [showToast])

  const handlePlaceOrder = useCallback(async (paymentMethod: 'cod' | 'online' = 'cod', orderData?: any) => {
    setIsSubmittingOrder(true)
    try {
      const t = cartTotals(cartItems)
      const subtotal = orderData?.subtotal ?? t.subtotal
      const tax = orderData?.tax ?? t.tax
      const shipping = orderData?.shipping ?? t.shipping
      const total = orderData?.total ?? t.total

      const res = await fetch(`${API_BASE}/create_order.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ customerId: user?.id, items: cartItems, address: savedAddress, notes: orderNotes, total, paymentMethod }),
      })
      const result = await res.json()

      if (result.success) {
        if (orderData?.clearCart) {
          try { await orderData.clearCart(result.data?.orderId || result.data?.id || result.data?.order_id) }
          catch (e) { console.error("Error clearing cart:", e) }
        }
        setCartItems([])
        setShowCheckoutSuccess(false)
        setIsCartOpen(false)
        showToast('Order placed successfully!', 'success')
        window.dispatchEvent(new Event("order-placed"))
        window.dispatchEvent(new Event("cart-updated"))
      } else {
        alert(result.message || 'Failed to place order')
      }
    } catch {
      alert('Failed to place order. Please try again.')
    } finally {
      setIsSubmittingOrder(false)
    }
  }, [cartItems, savedAddress, orderNotes, user, showToast])

  // ─── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="h-10 bg-gray-200 rounded w-64 mb-3 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
        </div>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
              <div className="w-full aspect-square bg-gray-200 animate-pulse" />
              <div className="px-2.5 pt-4 pb-2.5 space-y-2">
                <div className="h-3 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse mt-1" />
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Products Available</h3>
          <p className="text-gray-500">Check back later for fresh products</p>
        </div>
      </section>
    )
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <Toast {...toast} />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        isLoggedIn={isLoggedIn}
        onCheckoutClick={handleCheckoutClick}
        onLoginClick={(mode) => { setAuthMode(mode); setShowAuth(true) }}
      />

      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="sm:max-w-md p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              {authMode === "login" ? "Login to Continue" : "Create Your Account"}
            </DialogTitle>
          </DialogHeader>
          {authMode === "login" ? (
            <LoginModal
              onSuccess={() => {
                setShowAuth(false)
                const userData = JSON.parse(localStorage.getItem("auth_user")!)
                setUser(userData); setIsLoggedIn(true); setShowDeliveryModal(true)
              }}
              onSwitchToSignup={() => setAuthMode("signup")}
            />
          ) : (
            <SignupModal
              onSuccess={() => {
                setShowAuth(false)
                const userData = JSON.parse(localStorage.getItem("auth_user")!)
                setUser(userData); setIsLoggedIn(true); setShowDeliveryModal(true)
              }}
              onSwitchToLogin={() => setAuthMode("login")}
            />
          )}
        </DialogContent>
      </Dialog>

      {showOOS && (
        <OutOfStockModal
          items={outOfStockItems.map(i => ({ id: i.id, name: i.name, image: i.image }))}
          onRemoveAndContinue={handleRemoveOOSAndContinue}
          onClose={() => setShowOOS(false)}
        />
      )}

      {showDeliveryModal && user && (
        <DeliveryModal
          userData={user}
          currentView={deliveryView}
          onViewChange={setDeliveryView}
          onAddressComplete={handleAddressComplete}
          savedAddress={savedAddress}
          onClose={handleCloseDeliveryModal}
          onAddressSelected={() => { setShowDeliveryModal(false); setShowCheckoutSuccess(true) }}
        />
      )}

      {showCheckoutSuccess && savedAddress && (
        <CheckoutSuccessView
          items={cartItems}
          address={savedAddress}
          isUpdating={isUpdating}
          onQuantityChange={updateQuantityInCheckout}
          onRemoveItem={removeItemInCheckout}
          onChangeAddress={() => { setShowCheckoutSuccess(false); setShowDeliveryModal(true) }}
          onPlaceOrder={handlePlaceOrder}
          onClose={() => setShowCheckoutSuccess(false)}
          isSubmitting={isSubmittingOrder}
          clearCart={clearCart}
        />
      )}

      {/* ── Category filter chips ── */}
      {(() => {
        const uniqueCategories = ["All", ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))]
        const filteredProducts = selectedCategory === "All"
          ? products
          : products.filter(p => p.category === selectedCategory)

        // Emoji map for known categories
        const categoryEmoji: Record<string, string> = {
          All: "🛒",
          Fruits: "🍎",
          Vegetables: "🥦",
          Dairy: "🥛",
          Grains: "🌾",
          Meat: "🥩",
          Seafood: "🐟",
          Bakery: "🍞",
          Beverages: "🧃",
          Snacks: "🍿",
          Herbs: "🌿",
          Spices: "🧂",
          Organic: "🌱",
        }

        return (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4 text-center md:text-left">
                <h2 className="text-3xl font-bold text-gray-900 inline-block border-b-2 border-green-600 pb-2">
                  Fresh &amp; Healthy Choices
                </h2>
              </div>
              <p className="text-gray-500 text-sm mb-4">
                {filteredProducts.length === products.length
                  ? `Showing all ${products.length} products`
                  : `Showing ${filteredProducts.length} of ${products.length} products in "${selectedCategory}"`
                }
              </p>

              {/* Chip scroll row */}
              <div
                className="flex gap-2 overflow-x-auto pb-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {uniqueCategories.map((cat) => {
                  const isActive = selectedCategory === cat
                  const count = cat === "All" ? products.length : products.filter(p => p.category === cat).length
                  const emoji = categoryEmoji[cat] ?? "🏷️"
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 border-2 ${isActive
                        ? "bg-green-600 text-white border-green-600 shadow-md scale-105"
                        : "bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-700 hover:bg-green-50"
                        }`}
                    >
                      <span>{emoji}</span>
                      <span>{cat}</span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${isActive ? "bg-white/30 text-white" : "bg-gray-100 text-gray-500"
                          }`}
                      >
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Product grid */}
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4 text-4xl">
                  {categoryEmoji[selectedCategory] ?? "🏷️"}
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-1">No products in "{selectedCategory}"</h3>
                <p className="text-gray-500 text-sm mb-4">Try a different category</p>
                <button
                  onClick={() => setSelectedCategory("All")}
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full font-medium text-sm transition"
                >
                  View All Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-4">
                {filteredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isWishlisted={wishlistIds.has(product.id)}
                    onWishlistToggle={handleWishlistToggle}
                    onAddToCart={handleAddToCart}
                    onUpdateQuantity={handleUpdateQuantity}
                    quantity={cartItems.find(ci => Number(ci.id) === product.id)?.quantity || 0}
                    isLoading={actionLoading === product.id}
                    priority={index < 6}
                  />
                ))}
              </div>
            )}
          </>
        )
      })()}

      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
      `}</style>
    </section>
  )
}