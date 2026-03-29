"use client"

import { useEffect, useState } from "react"
import { Heart, ShoppingCart, Star, AlertCircle, Loader2, X, Plus, Minus, Trash2, User, LogIn, ShoppingBag, ArrowRight, Package } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import LoginModal from "@/components/auth/LoginModal"
import SignupModal from "@/components/auth/SignupModal"
import DeliveryModal from "@/components/delivery/DeliveryModal"
import CheckoutSuccessView from "@/components/delivery/CheckoutSuccessView"
import OrderSummary from "@/components/delivery/OrderSummary"
import OrderNotes from "@/components/delivery/OrderNotes"
import { UserData, SavedAddress } from "@/components/types"
import {
  getGuestCart,
  getGuestWishlist,
  addToGuestCart,
  toggleGuestWishlist,
  updateGuestCartQty,    // ✅ NEW
  removeFromGuestCart,   // ✅ NEW
} from "@/lib/guestStorage"
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://rootoportal.onrender.com/api"

const getUserId = (): number | null => {
  try {
    const user = localStorage.getItem("auth_user")
    return user ? JSON.parse(user).id : null
  } catch { return null }
}


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

const truncateWords = (text: string, wordLimit: number = 10): string => {
  const words = text.split(' ')
  if (words.length <= wordLimit) return text
  return words.slice(0, wordLimit).join(' ') + '...'
}
// Toast Notification Component
function Toast({ show, message, type }: ToastState) {
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
}

// Cart Drawer Component - Matches Header Style
// Cart Drawer Component - COMPACT & IMPROVED VERSION
function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  isLoggedIn = false,
  onCheckoutClick,
  onLoginClick
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
  const total = cartItems.reduce((sum, item) => sum + (item.subtotal || item.price * item.quantity), 0)

  const handleRemove = async (id: string) => {
    setDeletingId(Number(id))
    await onRemoveItem(Number(id))
    setDeletingId(null)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 z-[9997] ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-[9998] transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header - Compact */}
        <div className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-white" />
            <h3 className="font-semibold text-white">Cart ({cartItems.length})</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Cart Items */}
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
                Continue Shopping
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {cartItems.map((item) => (
                <div
                  key={item.cart_id}
                  data-product-id={item.id}
                  className="bg-gray-50 rounded-xl p-3 hover:bg-gray-100/80 transition"
                >
                  <div className="flex gap-3">
                    {/* Image */}
                    <Link href={`/product/${encodeURIComponent(item.slug || item.name)}`} onClick={onClose}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-gray-200 hover:opacity-80 transition"
                        onError={(e) => {
                          e.currentTarget.src = "https://placehold.co/80x80/e5e7eb/6b7280?text=No+Image"
                        }}
                      />
                    </Link>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Name & Delete */}
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/product/${encodeURIComponent(item.slug || item.name)}`}
                          onClick={onClose}
                          className="font-medium text-gray-900 hover:text-green-600 text-sm line-clamp-1 transition"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => handleRemove(item.id.toString())}
                          disabled={deletingId === item.id}
                          className="p-1 hover:bg-red-100 text-gray-400 hover:text-red-500 rounded-md transition flex-shrink-0"
                        >
                          {deletingId === item.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Price per kg */}
                      <p className="text-xs text-gray-500 mt-0.5">₹{item.price.toFixed(2)}/kg</p>

                      {/* Quantity & Subtotal Row */}
                      <div className="flex items-center justify-between mt-2">
                        {/* Compact Quantity Controls */}
                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                          <button
                            onClick={() => onUpdateQuantity(item.id, Math.max(0.25, item.quantity - 0.25))}
                            className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition text-gray-600"
                            disabled={deletingId === item.id}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-14 text-center text-xs font-semibold text-gray-800 bg-gray-50 py-1">
                            {item.quantity.toFixed(2)} kg
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 0.25)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition text-gray-600"
                            disabled={deletingId === item.id}
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
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex-shrink-0 space-y-3">
            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Subtotal:</span>
              <span className="text-xl font-bold text-gray-900">₹{total.toFixed(2)}</span>
            </div>

            {isLoggedIn ? (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onClose();
                    onCheckoutClick();
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </button>
                <Link href="/cart" onClick={onClose}>
                  <button className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-xl font-medium transition">
                    View Full Cart
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Login Required Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-blue-900 font-medium text-sm">Login to checkout</p>
                    <p className="text-blue-700 text-xs">Sign in to complete your order</p>
                  </div>
                </div>

                {/* Login/Signup Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onLoginClick('login');
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-medium transition flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onLoginClick('signup');
                    }}
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
}

// Product Card Component
function ProductCard({ product, wishlistIds, onWishlistToggle, onAddToCart, loading }: {
  product: Product
  wishlistIds: Set<number>
  onWishlistToggle: (id: number) => void
  onAddToCart: (product: Product) => void
  loading: number | null
}) {
  const isWishlisted = wishlistIds.has(product.id)
  const isLoading = loading === product.id
  const isLowStock = product.stock < 20

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 hover:border-gray-200">
      <Link href={`/product/${encodeURIComponent(product.slug)}`}>
        <div className="relative lg:h-48 bg-gray-100 overflow-hidden"> {/* Slightly reduced height for denser grid */}
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.src = "https://placehold.co/300x300/e5e7eb/6b7280?text=No+Image"
            }}
          />


          <div className="absolute top-3 right-3 bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
            {product.category}
          </div>

          <button
            onClick={(e) => {
              e.preventDefault()
              onWishlistToggle(product.id)
            }}
            disabled={isLoading}
            className={`absolute bottom-3 right-3 p-2 rounded-full shadow-lg transition-all duration-200 ${isWishlisted
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-white text-gray-700 hover:bg-gray-100 hover:text-red-500'
              } hover:scale-110`}
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>
      </Link>

      <div className="p-4 lg:h-auto h-34">
        <Link href={`/product/${encodeURIComponent(product.slug)}`}>
          <h3 className="font-bold text-base text-gray-900 mb-1 line-clamp-2 hover:text-green-600 transition-colors min-h-[2rem]"> {/* Adjusted for density */}
            {product.name}
          </h3>
        </Link>

        <p className="lg:text-[10px] lg:block hidden text-gray-600 mb-3 min-h-[2rem]">
          {truncateWords(product.description || 'Fresh and organic product', 10)}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-md font-bold text-green-600">₹{product.price_per_kg}</span> {/* Slightly smaller text */}
            <span className="text-sm text-gray-500">/kg</span>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            disabled={isLoading || product.stock === 0}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
            Add
          </button>
        </div>


      </div>
    </div>
  )
}

// Main Product Grid Component
export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([])
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set())
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [loading, setLoading] = useState(true)
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

  // 🔴 ADD THIS: Handle checkout trigger from cart drawer
  const handleCheckoutClick = () => {
    if (!user) {
      setShowAuth(true);
      setAuthMode("login");
    } else {
      setShowDeliveryModal(true);
      setDeliveryView('saved');
    }
  }

  useEffect(() => {
    const savedUser = localStorage.getItem("auth_user")  // ← auth_user not user
    if (savedUser) {
      setUser(JSON.parse(savedUser))
      setIsLoggedIn(true)
    }
  }, [])

  // 🔴 ADD THIS useEffect
  useEffect(() => {
    const handleCheckoutTrigger = () => {
      if (!user) {
        setShowAuth(true);
        setAuthMode("login");
      } else {
        setShowDeliveryModal(true);
        setDeliveryView('saved');
      }
    };

    window.addEventListener('start-checkout-from-cart', handleCheckoutTrigger);
    return () => window.removeEventListener('start-checkout-from-cart', handleCheckoutTrigger);
  }, [user]);

  const handleAddressComplete = async (address: any) => {
    setSavedAddress(address)
    setDeliveryView('success')

    // If it's a newly created address, save it
    if (!address.id) {
      try {
        const response = await fetch(`${API_BASE}/save_address.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId: user?.id,
            name: address.name,
            phoneNumber: address.phoneNumber,
            email: address.email,
            flatNo: address.flatNo,
            landmark: address.landmark || '',
            fullAddress: address.fullAddress,
            label: address.label,
            coordinates: address.coordinates,
            isDefault: false
          }),
        })

        const result = await response.json()

        if (!result.success) {
          console.error('Error saving address:', result.message)
        }
      } catch (error) {
        console.error("Error saving address:", error)
      }
    }
  }


  const handleCloseDeliveryModal = () => {
    setShowDeliveryModal(false)
    setDeliveryView('saved')
    setSavedAddress(null)
  }

  const handleDeliveryModalAddressSelected = () => {
    setShowDeliveryModal(false)
    setShowCheckoutSuccess(true)
  }

  const handlePlaceOrder = async (paymentMethod: 'cod' | 'online' = 'cod', orderData?: any) => {


    setIsSubmittingOrder(true)
    try {
      // 🔥 Use orderData if provided, otherwise calculate
      const subtotal = orderData?.subtotal || cartItems.reduce((sum, item) => sum + (item.subtotal || item.price * item.quantity), 0)
      const tax = orderData?.tax || subtotal * 0.08
      const shipping = orderData?.shipping || (subtotal > 500 ? 0 : 50)
      const total = orderData?.total || (subtotal + tax + shipping)


      const requestBody = {
        customerId: user?.id,
        items: cartItems,
        address: savedAddress,
        notes: orderNotes,
        total: total,  // 🔥 Now uses the correct total!
        paymentMethod: paymentMethod
      }

      console.log("📤 [PRODUCT-GRID] Sending to API:", requestBody)

      const response = await fetch(`${API_BASE}/create_order.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      const result = await response.json()
      console.log("📥 [PRODUCT-GRID] API Response:", result)
      if (result.success) {
        console.log("✅ [PRODUCT-GRID] Order placed successfully!")

        // 🔥 ADD THIS BLOCK TO CLEAR CART
        console.log("🔍 [PRODUCT-GRID] Checking for clearCart function...")
        if (orderData?.clearCart) {
          console.log("🧹 [PRODUCT-GRID] Calling clearCart function...")
          try {
            await orderData.clearCart(result.data?.orderId || result.data?.id || result.data?.order_id)
            console.log("✅ [PRODUCT-GRID] Cart cleared successfully!")
          } catch (clearError) {
            console.error("❌ [PRODUCT-GRID] Error clearing cart:", clearError)
          }
        } else {
          console.warn("⚠️ [PRODUCT-GRID] No clearCart function found in orderData")
        }
        // 🔥 END OF NEW BLOCK

        setCartItems([])
        setShowCheckoutSuccess(false)
        setIsCartOpen(false)
        showToast('Order placed successfully!', 'success')
        window.dispatchEvent(new Event("order-placed"))
        window.dispatchEvent(new Event("cart-updated"))
      } else {
        console.error("❌ [PRODUCT-GRID] Order failed:", result.message)
        alert(result.message || 'Failed to place order')
      }
    } catch (error) {
      console.error("❌ [PRODUCT-GRID] Error:", error)
      alert('Failed to place order. Please try again.')
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  const updateQuantityInCheckout = async (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) return handleRemoveFromCart(productId)

    const updatedItems = cartItems.map(item =>
      Number(item.id) === productId ? {
        ...item,
        quantity: newQuantity,
        subtotal: newQuantity * item.price
      } : item
    )
    setCartItems(updatedItems)
    setIsUpdating(productId)

    try {
      await fetch(`${API_BASE}/cart.php`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, quantity: newQuantity, user_id: getUserId() }),
      })
      window.dispatchEvent(new Event("cart-updated"))
    } catch (error) {
      console.error("Error updating quantity:", error)
    } finally {
      setIsUpdating(null)
    }
  }

  const removeItemInCheckout = async (productId: number) => {
    const updatedItems = cartItems.filter(item => Number(item.id) !== productId)
    setCartItems(updatedItems)
    setIsUpdating(productId)

    try {
      await fetch(`${API_BASE}/cart.php?product_id=${productId}`, { method: "DELETE" })
      window.dispatchEvent(new Event("cart-updated"))
      showToast('Item removed from cart', 'info')
    } catch (error) {
      console.error("Error removing item:", error)
    } finally {
      setIsUpdating(null)
    }
  }

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = getUserId()
        if (!userId) {
          const productsRes = await fetch(`${API_BASE}/get-product.php?limit=12`)
          const productsData = await productsRes.json()
          if (productsData.status === 'success') setProducts(productsData.items)
        
          // ✅ ADD: Guest cart + wishlist from localStorage
          const guestCart = getGuestCart()
          const guestWishlist = getGuestWishlist()
          setCartItems(guestCart.map(i => ({ ...i, cart_id: i.id })))
          setWishlistIds(new Set(guestWishlist.map(i => i.id)))
        
          setLoading(false)
          return
        }

        const [productsRes, wishlistRes, cartRes] = await Promise.all([
          fetch(`${API_BASE}/get-product.php?limit=12`),
          fetch(`${API_BASE}/wishlist.php?user_id=${userId}`),
          fetch(`${API_BASE}/cart.php?user_id=${userId}`)
        ])

        const productsData = await productsRes.json()
        const wishlistData = await wishlistRes.json()
        const cartData = await cartRes.json()

        if (productsData.status === 'success' && productsData.items) {
          setProducts(productsData.items)
        }

        if (wishlistData.status === 'success' && wishlistData.data) {
          const ids: any = new Set(wishlistData.data.map((item: any) => Number(item.id)))
          setWishlistIds(ids)
        }

        if (cartData.status === 'success') {
          setCartItems(cartData.data || cartData.items || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        showToast('Failed to load products', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Listen to cart updates from header
  useEffect(() => {
    let lastHighlightedId: string | null = null
  
    const handleCartUpdate = (e: any) => {
      lastHighlightedId = e.detail?.highlightedProductId
        ? Number(e.detail.highlightedProductId).toString()
        : null
  
      const fetchAndSortCart = async () => {
        const userId = getUserId()
  
        // ✅ CHANGED: Guest users — localStorage படி
        if (!userId) {
          const items = getGuestCart().map(i => ({ ...i, cart_id: i.id }))
          setCartItems(items)
          return
        }
  
        // Logged-in users — உன் existing API code (தொடாத)
        try {
          const res = await fetch(`${API_BASE}/cart.php?user_id=${userId}`)
          const data = await res.json()
  
          if (data.status === 'success') {
            let items = data.data || data.items || []
            const now = new Date().toISOString()
  
            const updatedItems = items.map((item: any) => {
              if (item.id === lastHighlightedId) {
                return { ...item, last_added_at: now }
              }
              return {
                ...item,
                last_added_at: item.last_added_at || new Date(Date.now() - 100000000).toISOString()
              }
            })
  
            updatedItems.sort((a: any, b: any) =>
              new Date(b.last_added_at).getTime() - new Date(a.last_added_at).getTime()
            )
  
            setCartItems(updatedItems)
  
            if (lastHighlightedId && isCartOpen) {
              setTimeout(() => {
                const el = document.querySelector(`[data-product-id="${lastHighlightedId}"]`)
                  || document.getElementById(`cart-item-${lastHighlightedId}`)
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                el?.classList.add('ring-2', 'ring-green-500', 'ring-offset-2', 'bg-green-50')
                setTimeout(() => {
                  el?.classList.remove('ring-2', 'ring-green-500', 'ring-offset-2', 'bg-green-50')
                }, 2000)
              }, 150)
            }
          }
        } catch (error) {
          console.error('Error updating cart:', error)
        }
      }
  
      fetchAndSortCart()
    }
  
    // ✅ ADD: Guest cart listener
    const handleGuestCartUpdate = () => {
      const items = getGuestCart().map(i => ({ ...i, cart_id: i.id }))
      setCartItems(items)
    }
  
    handleCartUpdate({})
    window.addEventListener('cart-updated', handleCartUpdate)
    window.addEventListener('guest-cart-updated', handleGuestCartUpdate)  // ✅ NEW
  
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate)
      window.removeEventListener('guest-cart-updated', handleGuestCartUpdate)  // ✅ NEW
    }
  }, [isCartOpen])

  // Listen to wishlist updates from header
  useEffect(() => {
    const handleWishlistUpdate = async () => {
      const userId = getUserId()
      if (!userId) return
      try {
        const res = await fetch(`${API_BASE}/wishlist.php?user_id=${userId}`)
        const data = await res.json()
        if (data.status === 'success' && data.data) {
          const ids: any = new Set(data.data.map((item: any) => Number(item.id)))
          setWishlistIds(ids)
        }
      } catch (error) {
        console.error('Error updating wishlist:', error)
      }
    }

    window.addEventListener('wishlist-updated', handleWishlistUpdate)
    return () => window.removeEventListener('wishlist-updated', handleWishlistUpdate)
  }, [])

  const handleWishlistToggle = async (productId: number) => {
    const userId = getUserId()
    if (!userId) {
      // ✅ Guest: localStorage-ல save பண்ணு, login கேக்காத
      const product = products.find(p => p.id === productId)
      if (!product) return
  
      setActionLoading(productId)
      const result = toggleGuestWishlist({
        id: product.id,
        name: product.name,
        price: product.price_per_kg,
        image: product.image,
        category: product.category,
        slug: product.slug,
      })
      setWishlistIds(prev => {
        const next = new Set(prev)
        result === "added" ? next.add(productId) : next.delete(productId)
        return next
      })
      showToast(result === "added" ? "Added to wishlist!" : "Removed from wishlist",
                result === "added" ? "success" : "info")
      window.dispatchEvent(new Event("guest-wishlist-updated"))
      setActionLoading(null)
      return   // ← இங்க return, API call போகாது
    }
  

    setActionLoading(productId)
    const isWishlisted = wishlistIds.has(productId)

    try {
      if (isWishlisted) {
        const res = await fetch(
          `${API_BASE}/wishlist.php?product_id=${productId}&user_id=${getUserId()}`,
          { method: 'DELETE', credentials: 'include' }
        )

        const data = await res.json()

        if (data.status === 'success') {
          setWishlistIds(prev => {
            const newSet = new Set(prev)
            newSet.delete(productId)
            return newSet
          })
          showToast('Removed from wishlist', 'info')
          window.dispatchEvent(new Event('wishlist-updated'))
        }
      } else {
        const res = await fetch(`${API_BASE}/wishlist.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: productId, user_id: getUserId() })
        })
        const data = await res.json()

        if (data.status === 'success' || data.status === 'info') {
          setWishlistIds(prev => new Set(prev).add(productId))
          showToast('Added to wishlist!', 'success')
          window.dispatchEvent(new Event('wishlist-updated'))
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error)
      showToast('Failed to update wishlist', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const clearCart = async (orderId?: number) => {


    try {
      const requestBody = {
        customerId: user?.id,
        orderId: orderId,
      }

      console.log("📤 [PRODUCT-GRID] Sending clear cart request:", requestBody)

      const response = await fetch(`${API_BASE}/clear_cart.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      console.log("📥 [PRODUCT-GRID] Clear cart response:", result);

      if (result.success) {
        console.log("✅ [PRODUCT-GRID] Cart cleared!")
        setCartItems([]);
        window.dispatchEvent(new Event("cart-updated"));
      } else {
        console.error("❌ [PRODUCT-GRID] Failed to clear cart:", result.message)
      }
    } catch (error) {
      console.error("❌ [PRODUCT-GRID] Error clearing cart:", error);
    }
  };


  const handleAddToCart = async (product: Product) => {
    setActionLoading(product.id)

    try {
      const userId = getUserId()
      
    if (!userId) {
      // ✅ Guest: localStorage-ல save பண்ணு
      addToGuestCart({
        id: product.id,
        name: product.name,
        price: product.price_per_kg,
        image: product.image,
        category: product.category,
        stock: product.stock,
        slug: product.slug,
      })
      setCartItems(getGuestCart().map(i => ({ ...i, cart_id: i.id })))
      showToast('Added to cart!', 'success')
      window.dispatchEvent(new CustomEvent('guest-cart-updated', {
        detail: { highlightedProductId: product.id.toString() }
      }))
      setIsCartOpen(true)
      setActionLoading(null)
      return   // ← இங்க return, API call போகாது
    }

      const res = await fetch(`${API_BASE}/cart.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 0.25,
          user_id: userId
        })
      })

      const data = await res.json()

      if (data.status === 'success') {
        showToast('Added to cart!', 'success')

        // THIS IS THE KEY: Tell everyone which product was just added
        window.dispatchEvent(new CustomEvent('cart-updated', {
          detail: { highlightedProductId: product.id.toString() }
        }))

        setIsCartOpen(true) // Open drawer
      } else {
        showToast(data.message || 'Failed to add to cart', 'error')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      showToast('Failed to add to cart', 'error')
    } finally {
      setActionLoading(null)
    }
  }
  const handleUpdateQuantity = async (productId: number, quantity: number) => {
    if (quantity < 0.25) {
      handleRemoveFromCart(productId)
      return
    }
  
    const userId = getUserId()
  
    // ✅ Guest
    if (!userId) {
      updateGuestCartQty(productId, quantity)
      return
    }
  
    // Logged-in — existing code same
    try {
      const res = await fetch(`${API_BASE}/cart.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity, user_id: userId })
      })
      const data = await res.json()
      if (data.status === 'success') {
        window.dispatchEvent(new Event('cart-updated'))
      }
    } catch (error) {
      showToast('Failed to update quantity', 'error')
    }
  }
  
  const handleRemoveFromCart = async (productId: number) => {
    const userId = getUserId()
  
    // ✅ Guest
    if (!userId) {
      removeFromGuestCart(productId)
      return
    }
  
    // Logged-in — existing code same
    try {
      const res = await fetch(`${API_BASE}/cart.php?product_id=${productId}&user_id=${userId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.status === 'success') {
        showToast('Item removed from cart', 'info')
        window.dispatchEvent(new Event('cart-updated'))
      }
    } catch (error) {
      showToast('Failed to remove item', 'error')
    }
  }




  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="h-10 bg-gray-200 rounded w-64 mb-3 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"> {/* Adjusted gap and cols for 6-card layout */}
          {[...Array(12)].map((_, i) => (
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
              <div className="h-48 bg-gray-200 animate-pulse"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-7 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse mt-2"></div>
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
        onLoginClick={(mode) => {  // 🔥 ADD THIS NEW PROP
          setAuthMode(mode);
          setShowAuth(true);
        }}
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
                setShowAuth(false);
                const userData = JSON.parse(localStorage.getItem("auth_user")!);
                setUser(userData);
                setIsLoggedIn(true);
                setShowDeliveryModal(true);
              }}
              onSwitchToSignup={() => setAuthMode("signup")}
            />
          ) : (
            <SignupModal
              onSuccess={() => {
                setShowAuth(false);
                const userData = JSON.parse(localStorage.getItem("auth_user")!);
                setUser(userData);
                setIsLoggedIn(true);
                setShowDeliveryModal(true);
              }}
              onSwitchToLogin={() => setAuthMode("login")}
            />
          )}
        </DialogContent>
      </Dialog>

      {showDeliveryModal && user && (
        <DeliveryModal
          userData={user}
          currentView={deliveryView}
          onViewChange={setDeliveryView}
          onAddressComplete={handleAddressComplete}
          savedAddress={savedAddress}
          onClose={handleCloseDeliveryModal}
          onAddressSelected={handleDeliveryModalAddressSelected}
        />
      )}

      {showCheckoutSuccess && savedAddress && (
        <CheckoutSuccessView
          items={cartItems}
          address={savedAddress}
          isUpdating={isUpdating}
          onQuantityChange={updateQuantityInCheckout}
          onRemoveItem={removeItemInCheckout}
          onChangeAddress={() => {
            setShowCheckoutSuccess(false)
            setShowDeliveryModal(true)
          }}
          onPlaceOrder={handlePlaceOrder}
          onClose={() => setShowCheckoutSuccess(false)}
          isSubmitting={isSubmittingOrder}
          clearCart={clearCart}
        />
      )}


      <div className="mb-8 text-center md:text-left"> {/* Added subtle centering for business polish */}
        <h2 className="text-3xl md:text-3xl font-bold text-gray-900 mb-2 inline-block border-b-2 border-green-600 pb-2"> {/* Added underline for emphasis */}
          Fresh & Healthy Choices
        </h2>
        <p className="text-gray-600 text-lg"> {/* Slightly larger text for readability */}
          Showing {products.length} carefully selected products for a healthier lifestyle
        </p>
      </div>


      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"> {/* Changed to 6 columns on lg, reduced gap for density */}
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            wishlistIds={wishlistIds}
            onWishlistToggle={handleWishlistToggle}
            onAddToCart={handleAddToCart}
            loading={actionLoading}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </section>
  )
}