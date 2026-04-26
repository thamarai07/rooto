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
import ForgotPasswordModal from "@/components/auth/ForgotPasswordModal"

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

// ─── Guest storage helpers (read-only, mirrors guestStorage.ts shape) ─────────
function readGuestWishlist(): WishlistItem[] {
  try {
    const raw = localStorage.getItem("guest_wishlist")
    if (!raw) return []
    return (JSON.parse(raw) as any[]).map(i => ({
      id:    String(i.id),
      name:  i.name,
      price: i.price,
      image: i.image,
      category: i.category,
    }))
  } catch { return [] }
}

function readGuestCart(): CartItem[] {
  try {
    const raw = localStorage.getItem("guest_cart")
    if (!raw) return []
    return (JSON.parse(raw) as any[]).map(i => ({
      id:       String(i.id),
      name:     i.name,
      price:    i.price,
      image:    i.image,
      quantity: i.quantity ?? 0.25,
      subtotal: i.subtotal ?? i.price * (i.quantity ?? 0.25),
    }))
  } catch { return [] }
}

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

  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup" | "forgot">("login")

  const wishlistRef = useRef<HTMLDivElement>(null)
  const cartRef     = useRef<HTMLDivElement>(null)
  const profileRef  = useRef<HTMLDivElement>(null)

  const pathname = usePathname()
  const { user, loading, logout: authLogout, setUser } = useAuth()

  /* ---------- Logo ---------- */
  useEffect(() => {
    fetch(`${API_BASE}/get_logo.php`)
      .then(r => r.json())
      .then(json => {
        if (json.status === "success") {
          setLogoUrl(json.logo_url)
          setLogoName(json.logo_name || "FreshMart")
        }
      })
      .catch(console.error)
  }, [])

  /* ---------- Guest counts + items sync ---------- */
  useEffect(() => {
    const syncGuest = () => {
      if (user) {
        setGuestCartCount(0)
        setGuestWishlistCount(0)
        return
      }
      const cart     = readGuestCart()
      const wishlist = readGuestWishlist()
      setGuestCartCount(wishlist.length)      // kept for badge
      setGuestWishlistCount(wishlist.length)

      // ✅ KEY CHANGE: also push items into state so dropdowns show them
      setCartItems(cart)
      setWishlistItems(wishlist)
      setGuestCartCount(cart.length)
    }

    syncGuest()
    window.addEventListener("guest-cart-updated",     syncGuest)
    window.addEventListener("guest-wishlist-updated", syncGuest)
    return () => {
      window.removeEventListener("guest-cart-updated",     syncGuest)
      window.removeEventListener("guest-wishlist-updated", syncGuest)
    }
  }, [user])

  const displayWishlistCount = user ? wishlistCount : guestWishlistCount
  const displayCartCount     = user ? cartCount     : guestCartCount

  /* ---------- Logged-in: count refresh ---------- */
  const refreshCounts = useCallback(async () => {
    if (!user?.id) return
    try {
      const [wRes, cRes] = await Promise.all([
        fetch(`${API_BASE}/get_wishlist_count.php?user_id=${user.id}`),
        fetch(`${API_BASE}/get_cart_count.php?user_id=${user.id}`),
      ])
      const [w, c] = await Promise.all([wRes.json(), cRes.json()])
      if (w.status === "success") setWishlistCount(w.count)
      if (c.status === "success") setCartCount(c.count)
    } catch (e) { console.error("Error refreshing counts:", e) }
  }, [user?.id])

  useEffect(() => { refreshCounts() }, [pathname, refreshCounts])
  useEffect(() => { refreshCounts() }, [refreshCounts])

  useEffect(() => {
    const onUpdate = () => refreshCounts()
    window.addEventListener("wishlist-updated", onUpdate)
    window.addEventListener("cart-updated",     onUpdate)
    return () => {
      window.removeEventListener("wishlist-updated", onUpdate)
      window.removeEventListener("cart-updated",     onUpdate)
    }
  }, [refreshCounts])

  /* ---------- Logged-in: fetch full item lists ---------- */
  const fetchWishlist = useCallback(async () => {
    // ✅ Guest: read from localStorage, no API call needed
    if (!user?.id) {
      setWishlistItems(readGuestWishlist())
      return
    }
    try {
      const res  = await fetch(`${API_BASE}/wishlist.php?user_id=${user.id}`)
      const json = await res.json()
      if (json.status === "success") setWishlistItems(json.data)
    } catch (e) { console.error(e) }
  }, [user?.id])

  const fetchCart = useCallback(async () => {
    // ✅ Guest: read from localStorage, no API call needed
    if (!user?.id) {
      setCartItems(readGuestCart())
      return
    }
    try {
      const res  = await fetch(`${API_BASE}/cart.php?user_id=${user.id}`)
      const json = await res.json()
      if (json.status === "success") setCartItems(json.data)
    } catch (e) { console.error(e) }
  }, [user?.id])

  /* ---------- Logged-in: mutations ---------- */
  const deleteWishlist = useCallback(async (id: string) => {
    setDeletingId(id)
    try {
      if (!user?.id) {
        // Guest: remove from localStorage
        const updated = readGuestWishlist().filter(i => i.id !== id)
        localStorage.setItem("guest_wishlist", JSON.stringify(updated))
        setWishlistItems(updated)
        setGuestWishlistCount(updated.length)
        window.dispatchEvent(new Event("guest-wishlist-updated"))
        return
      }
      const res  = await fetch(`${API_BASE}/wishlist.php?product_id=${id}&user_id=${user.id}`, { method: "DELETE" })
      const json = await res.json()
      if (json.status === "success") {
        await fetchWishlist()
        window.dispatchEvent(new Event("wishlist-updated"))
      }
    } catch (e) { console.error(e) }
    finally { setDeletingId(null) }
  }, [user?.id, fetchWishlist])

  const deleteCart = useCallback(async (id: string) => {
    setDeletingId(id)
    try {
      if (!user?.id) {
        // Guest: remove from localStorage
        const updated = readGuestCart().filter(i => i.id !== id)
        localStorage.setItem("guest_cart", JSON.stringify(updated))
        setCartItems(updated)
        setGuestCartCount(updated.length)
        window.dispatchEvent(new Event("guest-cart-updated"))
        return
      }
      const res  = await fetch(`${API_BASE}/cart.php?product_id=${id}&user_id=${user.id}`, { method: "DELETE" })
      const json = await res.json()
      if (json.status === "success") {
        await fetchCart()
        window.dispatchEvent(new Event("cart-updated"))
      }
    } catch (e) { console.error(e) }
    finally { setDeletingId(null) }
  }, [user?.id, fetchCart])

  const addToCartFromWishlist = useCallback(async (item: WishlistItem) => {
    setAddingToCart(item.id)
    try {
      if (!user?.id) {
        // Guest: move from wishlist → cart in localStorage
        const cart    = readGuestCart()
        const exists  = cart.find(c => c.id === item.id)
        const updated = exists
          ? cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1, subtotal: (c.quantity + 1) * c.price } : c)
          : [...cart, { id: item.id, name: item.name, price: item.price, image: item.image, quantity: 0.25, subtotal: item.price * 0.25 }]
        localStorage.setItem("guest_cart", JSON.stringify(updated))
        window.dispatchEvent(new Event("guest-cart-updated"))
        await deleteWishlist(item.id)
        return
      }
      const res  = await fetch(`${API_BASE}/cart.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: item.id, quantity: 1, user_id: user.id }),
      })
      const json = await res.json()
      if (json.status === "success") {
        await deleteWishlist(item.id)
        window.dispatchEvent(new Event("cart-updated"))
      }
    } catch (e) { console.error(e) }
    finally { setAddingToCart(null) }
  }, [user?.id, deleteWishlist])

  const updateCartQuantity = useCallback(async (id: string, newQty: number) => {
    if (newQty < 0.25) return
    if (!user?.id) {
      // Guest: update quantity in localStorage
      const updated = readGuestCart().map(i =>
        i.id === id ? { ...i, quantity: newQty, subtotal: newQty * i.price } : i
      )
      localStorage.setItem("guest_cart", JSON.stringify(updated))
      setCartItems(updated)
      window.dispatchEvent(new Event("guest-cart-updated"))
      return
    }
    try {
      const res  = await fetch(`${API_BASE}/cart.php`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: id, quantity: newQty, user_id: user.id }),
      })
      const json = await res.json()
      if (json.status === "success") {
        await fetchCart()
        window.dispatchEvent(new Event("cart-updated"))
      }
    } catch (e) { console.error(e) }
  }, [user?.id, fetchCart])

  /* ---------- Auth ---------- */
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
    setUser({ ...userData, id: Number(userData.id) })
    setShowAuth(false)
    window.dispatchEvent(new Event("user-updated"))
  }, [])

  /* ---------- Outside click ---------- */
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('.mobile-profile-panel') ||
          target.closest('.mobile-wishlist-panel') ||
          target.closest('.mobile-cart-panel')) return

      if (showWishlist && wishlistRef.current && !wishlistRef.current.contains(target)) setShowWishlist(false)
      if (showCart    && cartRef.current     && !cartRef.current.contains(target))     setShowCart(false)
      if (showProfile && profileRef.current  && !profileRef.current.contains(target))  setShowProfile(false)
    }
    document.addEventListener("mousedown",  handler)
    document.addEventListener("touchstart", handler, { passive: false })
    return () => {
      document.removeEventListener("mousedown",  handler)
      document.removeEventListener("touchstart", handler)
    }
  }, [showWishlist, showCart, showProfile])

  /* ---------- Toggle helpers ---------- */
  const toggleWishlist = useCallback(() => {
    setShowWishlist(v => {
      if (!v) fetchWishlist()   // fetch/read on open
      return !v
    })
    setShowCart(false)
    setShowProfile(false)
  }, [fetchWishlist])

  const toggleCart = useCallback(() => {
    setShowCart(v => {
      if (!v) fetchCart()       // fetch/read on open
      return !v
    })
    setShowWishlist(false)
    setShowProfile(false)
  }, [fetchCart])

  const toggleProfile = useCallback(() => {
    setShowProfile(v => !v)
    setShowWishlist(false)
    setShowCart(false)
  }, [])

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.subtotal || item.price * item.quantity), 0)

  /* ---------- Render ---------- */
  return (
    <>
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-10 w-10 rounded object-cover" />
            ) : (
              <div className="h-10 w-10 bg-green-600 rounded flex items-center justify-center text-white font-bold">F</div>
            )}
            <span className="font-semibold text-xl text-gray-900">{logoName}</span>
          </Link>

          {/* Desktop icons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Wishlist */}
            <div className="relative z-[200]" ref={wishlistRef}>
              <button onClick={toggleWishlist} className="relative p-2 hover:bg-gray-100 rounded-lg transition">
                <Heart className="w-6 h-6 text-gray-700" />
                {displayWishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {displayWishlistCount}
                  </span>
                )}
              </button>
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
              <button onClick={toggleCart} className="relative p-2 hover:bg-gray-100 rounded-lg transition">
                <ShoppingCart className="w-6 h-6 text-gray-700" />
                {displayCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {displayCartCount}
                  </span>
                )}
              </button>
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

            {/* Profile */}
            <div className="relative z-[200]" ref={profileRef}>
              {user ? (
                <>
                  <button onClick={toggleProfile} className="relative p-2 hover:bg-gray-100 rounded-lg transition flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  </button>
                  {showProfile && <ProfileDropdown user={user} onLogout={handleLogout} onClose={() => setShowProfile(false)} />}
                </>
              ) : (
                <button
                  onClick={() => { setAuthMode("login"); setShowAuth(true) }}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium transition"
                >
                  Login
                </button>
              )}
            </div>
          </div>

          {/* Mobile icons */}
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
              <button onClick={() => { setAuthMode("login"); setShowAuth(true) }} className="p-2">
                <User className="w-6 h-6 text-gray-700" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Panels */}
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
          <MobileProfilePanel user={user} onClose={() => setShowProfile(false)} onLogout={handleLogout} />
        </div>
      )}

      {/* Auth Modal */}
      <Dialog open={showAuth} onOpenChange={(open) => { setShowAuth(open); if (!open) setAuthMode("login") }}>
        <DialogContent className="sm:max-w-md p-0">
          <DialogHeader><DialogTitle className="sr-only">Authentication</DialogTitle></DialogHeader>
          <div className="p-6">
            {authMode === "login"  && <LoginModal  onSuccess={handleAuthSuccess} onSwitchToSignup={() => setAuthMode("signup")} onForgotPassword={() => setAuthMode("forgot")} />}
            {authMode === "signup" && <SignupModal onSuccess={handleAuthSuccess} onSwitchToLogin={() => setAuthMode("login")} />}
            {authMode === "forgot" && <ForgotPasswordModal onBack={() => setAuthMode("login")} />}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

/* ─── ProfileDropdown ──────────────────────────────────────────────────────── */
function ProfileDropdown({ user, onLogout, onClose }: { user: UserData; onLogout: () => void; onClose: () => void }) {
  return (
    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-[200] overflow-hidden">
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
      <div className="p-2">
        {[
          { href: "/orders",           icon: <Package  className="w-4 h-4 text-blue-600"  />, bg: "bg-blue-50   group-hover:bg-blue-100",   label: "My Orders"        },
          { href: "/addresses",        icon: <MapPin   className="w-4 h-4 text-orange-600"/>, bg: "bg-orange-50 group-hover:bg-orange-100", label: "Saved Addresses"  },
          { href: "/profile/settings", icon: <Settings className="w-4 h-4 text-gray-600"  />, bg: "bg-gray-100  group-hover:bg-gray-200",   label: "Account Settings" },
        ].map(({ href, icon, bg, label }) => (
          <Link key={href} href={href} onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition group">
            <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center transition`}>{icon}</div>
            <span className="text-sm font-medium text-gray-700">{label}</span>
          </Link>
        ))}
      </div>
      <div className="p-2 border-t border-gray-100">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 rounded-lg transition group">
          <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition">
            <LogOut className="w-4 h-4 text-red-600" />
          </div>
          <span className="text-sm font-medium text-red-600">Logout</span>
        </button>
      </div>
    </div>
  )
}

/* ─── MobileProfilePanel ───────────────────────────────────────────────────── */
function MobileProfilePanel({ user, onClose, onLogout }: { user: UserData; onClose: () => void; onLogout: () => void }) {
  const go = (url: string) => { onClose(); setTimeout(() => { window.location.href = url }, 150) }
  return (
    <div className="mobile-profile-panel md:hidden fixed inset-0 z-[500] bg-white flex flex-col" style={{ touchAction: 'auto' }}>
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-lg text-gray-900">My Profile</h3>
        <button onClick={(e) => { e.stopPropagation(); onClose() }} className="p-2 hover:bg-gray-100 rounded-lg">
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
          {user.phone && <p className="text-gray-600">📱 {user.phone}</p>}
        </div>
        <div className="p-4 space-y-2">
          {[
            { url: '/orders',           icon: <Package  className="w-6 h-6 text-gray-600 pointer-events-none"/>, label: 'My Orders'        },
            { url: '/addresses',        icon: <MapPin   className="w-6 h-6 text-gray-600 pointer-events-none"/>, label: 'Saved Addresses'  },
            { url: '/profile/settings', icon: <Settings className="w-6 h-6 text-gray-600 pointer-events-none"/>, label: 'Account Settings' },
          ].map(({ url, icon, label }) => (
            <button
              key={url}
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); go(url) }}
              className="w-full flex items-center gap-3 px-4 py-4 bg-white hover:bg-gray-50 active:bg-gray-100 rounded-lg transition border border-gray-200 cursor-pointer"
              style={{ touchAction: 'manipulation' }}
            >
              {icon}
              <span className="font-medium text-gray-700 text-lg pointer-events-none">{label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="p-4 border-t border-gray-200">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onLogout(); onClose() }}
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

/* ─── WishlistDropdown ─────────────────────────────────────────────────────── */
function WishlistDropdown({ items, onDelete, onAddToCart, deletingId, addingToCart }: {
  items: WishlistItem[]
  onDelete: (id: string) => void
  onAddToCart: (item: WishlistItem) => void
  deletingId: string | null
  addingToCart: string | null
}) {
  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-[200] overflow-hidden" style={{ maxHeight: '420px' }}>
      <div className="px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 flex items-center">
        <Heart className="w-4 h-4 text-white fill-white mr-2" />
        <h3 className="font-semibold text-white text-sm">Wishlist ({items.length})</h3>
      </div>
      {items.length > 0 ? (
        <>
          <div className="overflow-y-auto" style={{ maxHeight: '280px' }}>
            {items.map((item) => (
              <div key={item.id} className="p-3 border-b border-gray-50 hover:bg-gray-50/50 transition">
                <div className="flex gap-3">
                  <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                    onError={(e) => { e.currentTarget.src = "https://placehold.co/56x56/e5e7eb/6b7280?text=No+Image" }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm line-clamp-1">{item.name}</p>
                    <p className="text-base font-bold text-gray-900 mt-0.5">₹{item.price.toFixed(2)}</p>
                    <div className="flex gap-1.5 mt-2">
                      <button
                        onClick={() => onAddToCart(item)}
                        disabled={addingToCart === item.id}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-1.5 px-2 rounded-md font-medium disabled:opacity-50 flex items-center justify-center gap-1 transition"
                      >
                        {addingToCart === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><ShoppingBag className="w-3 h-3" /> Add</>}
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-md disabled:opacity-50 transition"
                      >
                        {deletingId === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 bg-gray-50 border-t border-gray-100">
            <Link href="/wishlist" className="block w-full bg-gray-900 hover:bg-gray-800 text-white text-center py-2.5 rounded-lg text-sm font-medium transition">
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

/* ─── CartDropdown ─────────────────────────────────────────────────────────── */
function CartDropdown({ items, total, onDelete, onUpdateQty, deletingId }: {
  items: CartItem[]
  total: number
  onDelete: (id: string) => void
  onUpdateQty: (id: string, qty: number) => void
  deletingId: string | null
}) {
  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-[200] overflow-hidden" style={{ maxHeight: '480px' }}>
      <div className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-white" />
          <h3 className="font-semibold text-white text-sm">Cart ({items.length} items)</h3>
        </div>
        <span className="text-white/90 text-xs font-medium">₹{total.toFixed(2)}</span>
      </div>
      {items.length > 0 ? (
        <>
          <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
            {items.map((item) => (
              <div key={item.id} className="p-3 border-b border-gray-50 hover:bg-gray-50/50 transition">
                <div className="flex gap-2.5">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                    onError={(e) => { e.currentTarget.src = "https://placehold.co/48x48/e5e7eb/6b7280?text=No+Image" }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-gray-800 text-sm line-clamp-1">{item.name}</p>
                      <button
                        onClick={() => onDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition flex-shrink-0"
                      >
                        {deletingId === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">₹{item.price.toFixed(2)}/kg</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                        <button onClick={() => onUpdateQty(item.id, item.quantity - 0.25)} className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 transition text-gray-600">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-12 text-center text-xs font-semibold text-gray-800 bg-gray-50">{item.quantity} kg</span>
                        <button onClick={() => onUpdateQty(item.id, item.quantity + 0.25)} className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 transition text-gray-600">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-green-600">₹{(item.subtotal || item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 bg-gray-50 border-t border-gray-100">
            <div className="flex justify-between items-center mb-3 px-1">
              <span className="text-sm text-gray-600">Subtotal:</span>
              <span className="text-lg font-bold text-gray-900">₹{total.toFixed(2)}</span>
            </div>
            <div className="flex gap-2">
              <Link href="/cart" className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-center py-2.5 rounded-lg text-sm font-medium transition">View Cart</Link>
              <Link href="/cart" className="flex-1 bg-green-600 hover:bg-green-700 text-white text-center py-2.5 rounded-lg text-sm font-medium transition">Checkout</Link>
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

/* ─── MobileWishlistPanel ──────────────────────────────────────────────────── */
function MobileWishlistPanel({ items, onClose, onDelete, onAddToCart, deletingId, addingToCart }: {
  items: WishlistItem[]; onClose: () => void; onDelete: (id: string) => void
  onAddToCart: (item: WishlistItem) => void; deletingId: string | null; addingToCart: string | null
}) {
  return (
    <div className="mobile-wishlist-panel md:hidden fixed inset-0 z-[500] bg-white flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-lg text-gray-900">Wishlist ({items.length})</h3>
        <button onClick={onClose} className="p-2"><X className="w-6 h-6 text-gray-600" /></button>
      </div>
      {items.length > 0 ? (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex gap-3 mb-3">
                  <img src={item.image} alt={item.name} className="w-24 h-24 rounded object-cover flex-shrink-0"
                    onError={(e) => { e.currentTarget.src = "https://placehold.co/96x96/e5e7eb/6b7280?text=No+Image" }} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-xl font-semibold text-gray-900 mt-2">₹{item.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onAddToCart(item)} disabled={addingToCart === item.id}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                    {addingToCart === item.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShoppingBag className="w-5 h-5" /> Add to Cart</>}
                  </button>
                  <button onClick={() => onDelete(item.id)} disabled={deletingId === item.id}
                    className="p-3 bg-red-50 text-red-600 rounded-lg disabled:opacity-50">
                    {deletingId === item.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t">
            <Link href="/wishlist" onClick={onClose} className="block w-full bg-gray-900 text-white text-center py-3 rounded-lg font-medium">
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

/* ─── MobileCartPanel ──────────────────────────────────────────────────────── */
function MobileCartPanel({ items, total, onClose, onDelete, onUpdateQty, deletingId }: {
  items: CartItem[]; total: number; onClose: () => void
  onDelete: (id: string) => void; onUpdateQty: (id: string, qty: number) => void; deletingId: string | null
}) {
  return (
    <div className="mobile-cart-panel md:hidden fixed inset-0 z-[500] bg-white flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-lg text-gray-900">Shopping Cart ({items.length})</h3>
        <button onClick={onClose} className="p-2"><X className="w-6 h-6 text-gray-600" /></button>
      </div>
      {items.length > 0 ? (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex gap-3 mb-3">
                  <img src={item.image} alt={item.name} className="w-24 h-24 rounded object-cover flex-shrink-0"
                    onError={(e) => { e.currentTarget.src = "https://placehold.co/96x96/e5e7eb/6b7280?text=No+Image" }} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600 mt-1">₹{item.price.toFixed(2)} per kg</p>
                    <p className="text-xl font-semibold text-gray-900 mt-2">₹{(item.subtotal || item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => onUpdateQty(item.id, item.quantity - 0.25)} className="p-2 bg-gray-100 rounded-lg"><Minus className="w-5 h-5" /></button>
                    <span className="w-16 text-center font-medium text-lg">{item.quantity} kg</span>
                    <button onClick={() => onUpdateQty(item.id, item.quantity + 0.25)} className="p-2 bg-gray-100 rounded-lg"><Plus className="w-5 h-5" /></button>
                  </div>
                  <button onClick={() => onDelete(item.id)} disabled={deletingId === item.id}
                    className="p-3 bg-red-50 text-red-600 rounded-lg disabled:opacity-50">
                    {deletingId === item.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
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
            <Link href="/cart" onClick={onClose} className="block w-full bg-green-600 text-white text-center py-3 rounded-lg font-medium">Proceed to Checkout</Link>
            <Link href="/cart" onClick={onClose} className="block w-full bg-gray-900 text-white text-center py-3 rounded-lg font-medium">View Cart</Link>
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