"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { Heart, ShoppingCart, X, Loader2, Trash2, Plus, Minus, ShoppingBag, User, LogOut, Package, MapPin, Settings } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import LoginModal from "@/components/auth/LoginModal"
import SignupModal from "@/components/auth/SignupModal"
import { UserData } from "./types"
import { usePathname } from "next/navigation"
import { useAuth } from '@/hooks/useAuth'

interface WishlistItem {
  id: string
  name: string
  price: number
  image: string
  category?: string
}
interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  subtotal?: number
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://seashell-skunk-617240.hostingersite.com/vfs-admin/api"


export default function Header() {
  /* ---------- State ---------- */
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoName, setLogoName] = useState("FreshMart")

  const [wishlistCount, setWishlistCount] = useState(0)
  const [cartCount, setCartCount] = useState(0)

  const [guestCartCount, setGuestCartCount] = useState(0)
  const [guestWishlistCount, setGuestWishlistCount] = useState(0)

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  const [showWishlist, setShowWishlist] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)

  // Auth state
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")

  const wishlistRef = useRef<HTMLDivElement>(null)
  const cartRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const pathname = usePathname()

  /* ---------- Load logo ---------- */
  useEffect(() => {
    const loadLogo = async () => {

      try {
        const res = await fetch(`${API_BASE}/get_logo.php`)
        const json = await res.json()
        if (json.status === "success") {
          setLogoUrl(json.logo_url)
          setLogoName(json.logo_name || "FreshMart")
        }
      } catch (e) {
        console.error(e)
      }
    }
    loadLogo()
  }, [])


  const { user, loading, logout: authLogout, setUser } = useAuth()

  // ✅ ADD THIS ENTIRE BLOCK — Guest count sync
  useEffect(() => {
    const syncGuestCounts = () => {
      if (!user) {  // Guest மட்டும்
        try {
          const cart = JSON.parse(localStorage.getItem("guest_cart") || "[]")
          const wishlist = JSON.parse(localStorage.getItem("guest_wishlist") || "[]")
          setGuestCartCount(cart.length)
          setGuestWishlistCount(wishlist.length)
        } catch {
          setGuestCartCount(0)
          setGuestWishlistCount(0)
        }
      } else {
        // Logged-in ஆனா guest counts reset
        setGuestCartCount(0)
        setGuestWishlistCount(0)
      }
    }

    syncGuestCounts() // mount-ல run

    window.addEventListener("guest-cart-updated", syncGuestCounts)
    window.addEventListener("guest-wishlist-updated", syncGuestCounts)

    return () => {
      window.removeEventListener("guest-cart-updated", syncGuestCounts)
      window.removeEventListener("guest-wishlist-updated", syncGuestCounts)
    }
  }, [user])

  const displayWishlistCount = user ? wishlistCount : guestWishlistCount
  const displayCartCount = user ? cartCount : guestCartCount

  /* ---------- 🔥 FIXED: Removed pathname dependency ---------- */
  const refreshCounts = useCallback(async () => {
    try {
      if (!user?.id) return          // ← if no user, don't fetch
      const userId = user.id;

      console.log("🔄 Refreshing counts for user:", userId);

      const [wRes, cRes] = await Promise.all([
        fetch(`${API_BASE}/get_wishlist_count.php?user_id=${userId}`),
        fetch(`${API_BASE}/get_cart_count.php?user_id=${userId}`),
      ])

      const w = await wRes.json()
      const c = await cRes.json()

      console.log("📊 Counts - Wishlist:", w.count, "Cart:", c.count);

      if (w.status === "success") setWishlistCount(w.count)
      if (c.status === "success") setCartCount(c.count)
    } catch (e) {
      console.error("❌ Error refreshing counts:", e)
    }
  }, [user?.id])  // 🔥 REMOVED pathname dependency

  // 🔥 FIXED: Refresh on pathname change with separate effect
  useEffect(() => {
    console.log("🔄 Pathname changed, refreshing counts...", pathname);
    refreshCounts()
  }, [pathname, refreshCounts])

  // 🔥 Refresh counts when user.id changes
  useEffect(() => {
    refreshCounts()
  }, [refreshCounts])

  // 🔥 Listen for cart/wishlist updates
  useEffect(() => {
    const onUpdate = () => {
      console.log("🔔 Cart/Wishlist updated - refreshing counts")
      refreshCounts()
    }

    window.addEventListener("wishlist-updated", onUpdate)
    window.addEventListener("cart-updated", onUpdate)

    return () => {
      window.removeEventListener("wishlist-updated", onUpdate)
      window.removeEventListener("cart-updated", onUpdate)
    }
  }, [refreshCounts])

  /* ---------- 🔥 OPTIMIZED: Memoized fetch functions ---------- */
  const fetchWishlist = useCallback(async () => {
    try {
      if (!user?.id) return          // ← if no user, don't fetch
      const userId = user.id;
      const res = await fetch(`${API_BASE}/wishlist.php?user_id=${userId}`)
      const json = await res.json()
      if (json.status === "success") setWishlistItems(json.data)
    } catch (e) {
      console.error(e)
    }
  }, [user?.id])

  const fetchCart = useCallback(async () => {
    try {
      if (!user?.id) return          // ← if no user, don't fetch
      const userId = user.id;
      const res = await fetch(`${API_BASE}/cart.php?user_id=${userId}`)
      const json = await res.json()
      if (json.status === "success") setCartItems(json.data)
    } catch (e) {
      console.error(e)
    }
  }, [user?.id])

  /* ---------- 🔥 OPTIMIZED: Memoized business functions ---------- */
  const deleteWishlist = useCallback(async (id: string) => {
    setDeletingId(id)
    try {
      if (!user?.id) return          // ← if no user, don't fetch
      const userId = user.id;
      const res = await fetch(`${API_BASE}/wishlist.php?product_id=${id}&user_id=${userId}`, { method: "DELETE" })
      const json = await res.json()
      if (json.status === "success") {
        await fetchWishlist()
        window.dispatchEvent(new Event("wishlist-updated"))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setDeletingId(null)
    }
  }, [user?.id, fetchWishlist])

  const deleteCart = useCallback(async (id: string) => {
    setDeletingId(id)
    try {
      if (!user?.id) return          // ← if no user, don't fetch
      const userId = user.id;
      const res = await fetch(`${API_BASE}/cart.php?product_id=${id}&user_id=${userId}`, { method: "DELETE" })
      const json = await res.json()
      if (json.status === "success") {
        await fetchCart()
        window.dispatchEvent(new Event("cart-updated"))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setDeletingId(null)
    }
  }, [user?.id, fetchCart])

  const addToCartFromWishlist = useCallback(async (item: WishlistItem) => {
    setAddingToCart(item.id)
    try {
      if (!user?.id) return          // ← if no user, don't fetch
      const userId = user.id;
      const res = await fetch(`${API_BASE}/cart.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: item.id,
          quantity: 1,
          user_id: userId
        }),
      })
      const json = await res.json()
      if (json.status === "success") {
        await deleteWishlist(item.id)
        window.dispatchEvent(new Event("cart-updated"))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setAddingToCart(null)
    }
  }, [user?.id, deleteWishlist])

  const updateCartQuantity = useCallback(async (id: string, newQty: number) => {
    if (newQty < 1) return
    try {
      if (!user?.id) return          // ← if no user, don't fetch
      const userId = user.id;
      const res = await fetch(`${API_BASE}/cart.php`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: id,
          quantity: newQty,
          user_id: userId
        }),
      })
      const json = await res.json()
      if (json.status === "success") {
        await fetchCart()
        window.dispatchEvent(new Event("cart-updated"))
      }
    } catch (e) {
      console.error(e)
    }
  }, [user?.id, fetchCart])

  /* ---------- Auth Functions ---------- */
  const handleLogout = useCallback(async () => {
    await authLogout()
    setUser(null)
    setShowProfile(false)
    setCartCount(0)
    setWishlistCount(0)
    window.dispatchEvent(new Event("user-updated"))
    window.location.href = "/"
  }, [])

  const handleAuthSuccess = useCallback((userData: UserData) => {
    setUser({
      ...userData,
      id: Number(userData.id)   // ← cast to number
    })
    setShowAuth(false)
    window.dispatchEvent(new Event("user-updated"))
  }, [])

  /* ---------- Close on outside click ---------- */

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      console.log("🔶 [CLICK OUTSIDE] Event detected:", e.type)
      console.log("🔶 [CLICK OUTSIDE] Target:", e.target)

      // Check if target has the mobile panel class or is inside it
      const target = e.target as HTMLElement
      const isMobilePanel = target.closest('.mobile-profile-panel') ||
        target.closest('.mobile-wishlist-panel') ||
        target.closest('.mobile-cart-panel')

      if (isMobilePanel) {
        console.log("🔶 [CLICK OUTSIDE] Click is inside mobile panel - ignoring")
        return
      }

      if (showWishlist && wishlistRef.current && !wishlistRef.current.contains(e.target as Node)) {
        console.log("🔶 [CLICK OUTSIDE] Closing wishlist")
        setShowWishlist(false)
      }
      if (showCart && cartRef.current && !cartRef.current.contains(e.target as Node)) {
        console.log("🔶 [CLICK OUTSIDE] Closing cart")
        setShowCart(false)
      }
      if (showProfile && profileRef.current && !profileRef.current.contains(e.target as Node)) {
        console.log("🔶 [CLICK OUTSIDE] Closing profile")
        setShowProfile(false)
      }
    }

    // Add both mouse and touch events for mobile
    document.addEventListener("mousedown", handler)
    document.addEventListener("touchstart", handler, { passive: false })

    return () => {
      document.removeEventListener("mousedown", handler)
      document.removeEventListener("touchstart", handler)
    }
  }, [showWishlist, showCart, showProfile])
  /* ---------- UI helpers ---------- */
  const toggleWishlist = useCallback(() => {
    setShowWishlist((v) => {
      const newValue = !v
      if (newValue) fetchWishlist()
      return newValue
    })
    setShowCart(false)
    setShowProfile(false)
  }, [fetchWishlist])

  const toggleCart = useCallback(() => {
    setShowCart((v) => {
      const newValue = !v
      if (newValue) fetchCart()
      return newValue
    })
    setShowWishlist(false)
    setShowProfile(false)
  }, [fetchCart])

  const toggleProfile = useCallback(() => {
    setShowProfile((v) => !v)
    setShowWishlist(false)
    setShowCart(false)
  }, [])

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.subtotal || item.price * item.quantity), 0)

  return (
    <>
      {/* ---------- Sticky Header ---------- */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-10 w-10 rounded object-cover" />
            ) : (
              <div className="h-10 w-10 bg-green-600 rounded flex items-center justify-center text-white font-bold">
                F
              </div>
            )}
            <span className="font-semibold text-xl text-gray-900">{logoName}</span>
          </Link>

          {/* ICONS – Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {/* Wishlist */}
            <div className="relative z-[200]" ref={wishlistRef}>
              <button
                onClick={toggleWishlist}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <Heart className="w-6 h-6 text-gray-700" />
                {displayWishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {displayWishlistCount}
                  </span>
                )}
              </button>

              {/* Wishlist Dropdown */}
              {showWishlist && (
                <WishlistDropdown
                  items={wishlistItems}
                  onDelete={deleteWishlist}
                  onAddToCart={addToCartFromWishlist}
                  deletingId={deletingId}
                  addingToCart={addingToCart}
                />
              )}
            </div>

            {/* Cart */}
            <div className="relative z-[200]" ref={cartRef}>
              <button
                onClick={toggleCart}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ShoppingCart className="w-6 h-6 text-gray-700" />
                {displayCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {displayCartCount}
                  </span>
                )}
              </button>

              {/* Cart Dropdown */}
              {showCart && (
                <CartDropdown
                  items={cartItems}
                  total={cartTotal}
                  onDelete={deleteCart}
                  onUpdateQty={updateCartQuantity}
                  deletingId={deletingId}
                />
              )}
            </div>

            {/* Profile / Auth */}
            <div className="relative z-[200]" ref={profileRef}>
              {user ? (
                <>
                  <button
                    onClick={toggleProfile}
                    className="relative p-2 hover:bg-gray-100 rounded-lg transition flex items-center gap-2"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  {showProfile && (
                    <ProfileDropdown
                      user={user}
                      onLogout={handleLogout}
                      onClose={() => setShowProfile(false)}
                    />
                  )}
                </>
              ) : (
                <button
                  onClick={() => {
                    setAuthMode("login")
                    setShowAuth(true)
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium transition"
                >
                  Login
                </button>
              )}
            </div>
          </div>

          {/* MOBILE ICONS */}
          <div className="flex md:hidden items-center gap-3">
            <button onClick={toggleWishlist} className="relative p-2">
              <Heart className="w-6 h-6 text-gray-700" />
              {displayWishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {displayWishlistCount}
                </span>
              )}
            </button>
            <button onClick={toggleCart} className="relative p-2">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {displayCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {displayCartCount}
                </span>
              )}
            </button>

            {user ? (
              <button onClick={toggleProfile} className="relative p-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
              </button>
            ) : (
              <button
                onClick={() => {
                  console.log("🟣 [MOBILE] Login button clicked")
                  setAuthMode("login")
                  setShowAuth(true)
                }}
                className="p-2"
              >
                <User className="w-6 h-6 text-gray-700" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ---------- Mobile Panels ---------- */}
      {showWishlist && (
        <MobileWishlistPanel
          items={wishlistItems}
          onClose={() => setShowWishlist(false)}
          onDelete={deleteWishlist}
          onAddToCart={addToCartFromWishlist}
          deletingId={deletingId}
          addingToCart={addingToCart}
        />
      )}

      {showCart && (
        <MobileCartPanel
          items={cartItems}
          total={cartTotal}
          onClose={() => setShowCart(false)}
          onDelete={deleteCart}
          onUpdateQty={updateCartQuantity}
          deletingId={deletingId}
        />
      )}

      {showProfile && user && (
        <div className="md:hidden">
          <MobileProfilePanel
            user={user}
            onClose={() => {
              console.log("🟣 [MOBILE PANEL] onClose called")
              setShowProfile(false)
            }}
            onLogout={handleLogout}
          />
        </div>
      )}

      {/* ---------- Auth Modal ---------- */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="sm:max-w-md p-0">
          <DialogHeader>
            <DialogTitle className="sr-only">Authentication</DialogTitle>   {/* ← Add this */}
          </DialogHeader>
          <div className="p-6">
            {authMode === "login" ? (
              <LoginModal
                onSuccess={handleAuthSuccess}
                onSwitchToSignup={() => setAuthMode("signup")}
              />
            ) : (
              <SignupModal
                onSuccess={handleAuthSuccess}
                onSwitchToLogin={() => setAuthMode("login")}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

/* ---------- Profile Dropdown (Desktop) ---------- */
function ProfileDropdown({
  user,
  onLogout,
  onClose,
}: {
  user: UserData
  onLogout: () => void
  onClose: () => void
}) {
  return (
    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-[200] overflow-hidden">
      {/* User Info Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white font-bold text-xl border-2 border-white/30">
            {user.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate">{user.name}</h3>
            <p className="text-xs text-green-100 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-2">
        <Link
          href="/orders"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition group"
        >
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition">
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">My Orders</span>
        </Link>

        <Link
          href="/addresses"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition group"
        >
          <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center group-hover:bg-orange-100 transition">
            <MapPin className="w-4 h-4 text-orange-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">Saved Addresses</span>
        </Link>

        <Link
          href="/profile/settings"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition group"
        >
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition">
            <Settings className="w-4 h-4 text-gray-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">Account Settings</span>
        </Link>
      </div>

      {/* Logout Button */}
      <div className="p-2 border-t border-gray-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 rounded-lg transition group"
        >
          <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition">
            <LogOut className="w-4 h-4 text-red-600" />
          </div>
          <span className="text-sm font-medium text-red-600">Logout</span>
        </button>
      </div>
    </div>
  )
}

/* ---------- Mobile Profile Panel ---------- */
function MobileProfilePanel({
  user,
  onClose,
  onLogout,
}: {
  user: UserData
  onClose: () => void
  onLogout: () => void
}) {
  const handleNavigation = (url: string) => {
    console.log("🔵 [MOBILE PROFILE] Navigation clicked:", url)
    console.log("🔵 [MOBILE PROFILE] User data:", user)
    console.log("🔵 [MOBILE PROFILE] Closing panel...")

    onClose()

    console.log("🔵 [MOBILE PROFILE] Panel closed, navigating in 150ms...")

    setTimeout(() => {
      console.log("🔵 [MOBILE PROFILE] Executing navigation to:", url)
      window.location.href = url
    }, 150)
  }

  console.log("🟢 [MOBILE PROFILE] Component rendered")
  console.log("🟢 [MOBILE PROFILE] User:", user)

  return (
    <div
      className="mobile-profile-panel md:hidden fixed inset-0 z-[500] bg-white flex flex-col"
      style={{ touchAction: 'auto', pointerEvents: 'auto' }}
      onClick={(e) => {
        console.log("🟣 [PANEL] Panel clicked:", e.target)
      }}
    >
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-lg text-gray-900">My Profile</h3>
        <button
          onClick={(e) => {
            console.log("🔴 [MOBILE PROFILE] Close button clicked")
            e.stopPropagation()
            onClose()
          }}
          className="p-2 hover:bg-gray-100 rounded-lg"
          style={{ touchAction: 'auto' }}
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-3xl">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xl text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-600 truncate">{user.email}</p>
            </div>
          </div>
          {user.phone && (
            <p className="text-gray-600">📱 {user.phone}</p>
          )}
        </div>

        <div className="p-4 space-y-2">
          {/* My Orders */}
          <button
            type="button"
            onClick={(e) => {
              console.log("🟡 [MY ORDERS] Button clicked!!!")
              console.log("🟡 [MY ORDERS] Event type:", e.type)
              console.log("🟡 [MY ORDERS] Current target:", e.currentTarget)
              e.preventDefault()
              e.stopPropagation()
              handleNavigation('/orders')
            }}
            className="w-full flex items-center gap-3 px-4 py-4 bg-white hover:bg-gray-50 active:bg-gray-100 rounded-lg transition border border-gray-200 cursor-pointer"
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'rgba(0,0,0,0.1)' }}
          >
            <Package className="w-6 h-6 text-gray-600 pointer-events-none" />
            <span className="font-medium text-gray-700 text-lg pointer-events-none">My Orders</span>
          </button>

          {/* Saved Addresses */}
          <button
            type="button"
            onClick={(e) => {
              console.log("🟡 [ADDRESSES] Button clicked!!!")
              console.log("🟡 [ADDRESSES] Event type:", e.type)
              console.log("🟡 [ADDRESSES] Current target:", e.currentTarget)
              e.preventDefault()
              e.stopPropagation()
              handleNavigation('/addresses')
            }}
            className="w-full flex items-center gap-3 px-4 py-4 bg-white hover:bg-gray-50 active:bg-gray-100 rounded-lg transition border border-gray-200 cursor-pointer"
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'rgba(0,0,0,0.1)' }}
          >
            <MapPin className="w-6 h-6 text-gray-600 pointer-events-none" />
            <span className="font-medium text-gray-700 text-lg pointer-events-none">Saved Addresses</span>
          </button>

          {/* Account Settings */}
          <button
            type="button"
            onClick={(e) => {
              console.log("🟡 [SETTINGS] Button clicked!!!")
              console.log("🟡 [SETTINGS] Event type:", e.type)
              console.log("🟡 [SETTINGS] Current target:", e.currentTarget)
              e.preventDefault()
              e.stopPropagation()
              handleNavigation('/profile/settings')
            }}
            className="w-full flex items-center gap-3 px-4 py-4 bg-white hover:bg-gray-50 active:bg-gray-100 rounded-lg transition border border-gray-200 cursor-pointer"
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'rgba(0,0,0,0.1)' }}
          >
            <Settings className="w-6 h-6 text-gray-600 pointer-events-none" />
            <span className="font-medium text-gray-700 text-lg pointer-events-none">Account Settings</span>
          </button>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        <button
          type="button"
          onClick={(e) => {
            console.log("🔴 [LOGOUT] Button clicked")
            e.stopPropagation()
            onLogout()
            onClose()
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 rounded-lg font-medium text-lg transition"
          style={{ touchAction: 'manipulation' }}
        >
          <LogOut className="w-6 h-6 pointer-events-none" />
          <span className="pointer-events-none">Logout</span>
        </button>
      </div>
    </div>
  )
}

/* ---------- 🔥 IMPROVED: Wishlist Dropdown (Desktop) ---------- */
function WishlistDropdown({
  items,
  onDelete,
  onAddToCart,
  deletingId,
  addingToCart,
}: {
  items: WishlistItem[]
  onDelete: (id: string) => void
  onAddToCart: (item: WishlistItem) => void
  deletingId: string | null
  addingToCart: string | null
}) {
  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-[200] overflow-hidden" style={{ maxHeight: '420px' }}>
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-white fill-white" />
          <h3 className="font-semibold text-white text-sm">Wishlist ({items.length})</h3>
        </div>
      </div>

      {items.length > 0 ? (
        <>
          {/* Items List */}
          <div className="overflow-y-auto" style={{ maxHeight: '280px' }}>
            {items.map((item) => (
              <div key={item.id} className="p-3 border-b border-gray-50 hover:bg-gray-50/50 transition">
                <div className="flex gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`product-details/${encodeURIComponent(item.name)}`}
                      className="font-medium text-gray-800 hover:text-green-600 text-sm line-clamp-1 transition"
                    >
                      {item.name}
                    </Link>
                    <p className="text-base font-bold text-gray-900 mt-0.5">₹{item.price.toFixed(2)}</p>

                    <div className="flex gap-1.5 mt-2">
                      <button
                        onClick={() => onAddToCart(item)}
                        disabled={addingToCart === item.id}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-1.5 px-2 rounded-md font-medium disabled:opacity-50 flex items-center justify-center gap-1 transition"
                      >
                        {addingToCart === item.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <ShoppingBag className="w-3 h-3" />
                            Add
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-md disabled:opacity-50 transition"
                      >
                        {deletingId === item.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-3 bg-gray-50 border-t border-gray-100">
            <Link
              href="/wishlist"
              className="block w-full bg-gray-900 hover:bg-gray-800 text-white text-center py-2.5 rounded-lg text-sm font-medium transition"
            >
              View All Items
            </Link>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 px-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-3">
            <Heart className="w-8 h-8 text-red-300" />
          </div>
          <p className="text-gray-500 font-medium text-sm">Your wishlist is empty</p>
          <p className="text-gray-400 text-xs mt-1">Save items you love!</p>
        </div>
      )}
    </div>
  )
}

/* ---------- 🔥 IMPROVED: Cart Dropdown (Desktop) - COMPACT VERSION ---------- */
function CartDropdown({
  items,
  total,
  onDelete,
  onUpdateQty,
  deletingId,
}: {
  items: CartItem[]
  total: number
  onDelete: (id: string) => void
  onUpdateQty: (id: string, qty: number) => void
  deletingId: string | null
}) {
  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-[200] overflow-hidden" style={{ maxHeight: '480px' }}>
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-white" />
          <h3 className="font-semibold text-white text-sm">Cart ({items.length} items)</h3>
        </div>
        <span className="text-white/90 text-xs font-medium">₹{total.toFixed(2)}</span>
      </div>

      {items.length > 0 ? (
        <>
          {/* Items List - Compact */}
          <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
            {items.map((item) => (
              <div key={item.id} className="p-3 border-b border-gray-50 hover:bg-gray-50/50 transition">
                <div className="flex gap-2.5">
                  {/* Image */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Name & Delete */}
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/product-details/${encodeURIComponent(item.name)}`}
                        className="font-medium text-gray-800 hover:text-green-600 text-sm line-clamp-1 transition"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => onDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition flex-shrink-0"
                      >
                        {deletingId === item.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <X className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Price per unit */}
                    <p className="text-xs text-gray-500 mt-0.5">₹{item.price.toFixed(2)}/kg</p>

                    {/* Quantity & Total */}
                    <div className="flex items-center justify-between mt-1.5">
                      {/* Quantity Controls - Compact */}
                      <div className="flex items-center gap-0 border border-gray-200 rounded-md overflow-hidden">
                        <button
                          onClick={() => onUpdateQty(item.id, item.quantity - 0.25)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 transition text-gray-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-12 text-center text-xs font-semibold text-gray-800 bg-gray-50">
                          {item.quantity} kg
                        </span>
                        <button
                          onClick={() => onUpdateQty(item.id, item.quantity + 0.25)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 transition text-gray-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <span className="text-sm font-bold text-green-600">
                        ₹{(item.subtotal || item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-3 bg-gray-50 border-t border-gray-100">
            {/* Total */}
            <div className="flex justify-between items-center mb-3 px-1">
              <span className="text-sm text-gray-600">Subtotal:</span>
              <span className="text-lg font-bold text-gray-900">₹{total.toFixed(2)}</span>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <Link
                href="/cart"
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-center py-2.5 rounded-lg text-sm font-medium transition"
              >
                View Cart
              </Link>
              <Link
                href="/cart"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-center py-2.5 rounded-lg text-sm font-medium transition"
              >
                Checkout
              </Link>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 px-4">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-3">
            <ShoppingCart className="w-8 h-8 text-green-300" />
          </div>
          <p className="text-gray-500 font-medium text-sm">Your cart is empty</p>
          <p className="text-gray-400 text-xs mt-1">Add fresh products to get started!</p>
        </div>
      )}
    </div>
  )
}

/* ---------- Mobile Wishlist Panel ---------- */
function MobileWishlistPanel({
  items,
  onClose,
  onDelete,
  onAddToCart,
  deletingId,
  addingToCart,
}: {
  items: WishlistItem[]
  onClose: () => void
  onDelete: (id: string) => void
  onAddToCart: (item: WishlistItem) => void
  deletingId: string | null
  addingToCart: string | null
}) {
  return (
    <div className="md:hidden fixed inset-0 z-[500] bg-white flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-lg text-gray-900">Wishlist ({items.length})</h3>
        <button onClick={onClose} className="p-2">
          <X className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {items.length > 0 ? (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex gap-3 mb-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 rounded object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <Link
                      href={`/product-details/${encodeURIComponent(item.name)}`}
                      className="font-medium text-gray-900"
                      onClick={onClose}
                    >
                      {item.name}
                    </Link>
                    <p className="text-xl font-semibold text-gray-900 mt-2">₹{item.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onAddToCart(item)}
                    disabled={addingToCart === item.id}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {addingToCart === item.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5" />
                        Add to Cart
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="p-3 bg-red-50 text-red-600 rounded-lg disabled:opacity-50"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t">
            <Link
              href="/wishlist"
              className="block w-full bg-gray-900 text-white text-center py-3 rounded-lg font-medium"
              onClick={onClose}
            >
              View All Items
            </Link>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <Heart className="w-20 h-20 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium text-lg">Your wishlist is empty</p>
        </div>
      )}
    </div>
  )
}

/* ---------- Mobile Cart Panel ---------- */
function MobileCartPanel({
  items,
  total,
  onClose,
  onDelete,
  onUpdateQty,
  deletingId,
}: {
  items: CartItem[]
  total: number
  onClose: () => void
  onDelete: (id: string) => void
  onUpdateQty: (id: string, qty: number) => void
  deletingId: string | null
}) {
  return (
    <div className="md:hidden fixed inset-0 z-[500] bg-white flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-lg text-gray-900">Shopping Cart ({items.length})</h3>
        <button onClick={onClose} className="p-2">
          <X className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {items.length > 0 ? (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex gap-3 mb-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 rounded object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <Link
                      href={`/product-details/${encodeURIComponent(item.name)}`}
                      className="font-medium text-gray-900"
                      onClick={onClose}
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">₹{item.price.toFixed(2)} per kg</p>
                    <p className="text-xl font-semibold text-gray-900 mt-2">
                      ₹{(item.subtotal || item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onUpdateQty(item.id, item.quantity - 0.25)}
                      className="p-2 bg-gray-100 rounded-lg"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="w-16 text-center font-medium text-lg">{item.quantity} kg</span>
                    <button
                      onClick={() => onUpdateQty(item.id, item.quantity + 0.25)}
                      className="p-2 bg-gray-100 rounded-lg"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    onClick={() => onDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="p-3 bg-red-50 text-red-600 rounded-lg disabled:opacity-50"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-gray-50 border-t space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900 text-lg">Total:</span>
              <span className="text-2xl font-bold text-gray-900">₹{total.toFixed(2)}</span>
            </div>
            <Link
              href="/cart"
              className="block w-full bg-green-600 text-white text-center py-3 rounded-lg font-medium"
              onClick={onClose}
            >
              Proceed to Checkout
            </Link>
            <Link
              href="/cart"
              className="block w-full bg-gray-900 text-white text-center py-3 rounded-lg font-medium"
              onClick={onClose}
            >
              View Cart
            </Link>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <ShoppingCart className="w-20 h-20 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium text-lg">Your cart is empty</p>
        </div>
      )}
    </div>
  )
}