"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import LoginModal from "@/components/auth/LoginModal"
import SignupModal from "@/components/auth/SignupModal"
import DeliveryModal from "@/components/delivery/DeliveryModal"
import CheckoutSuccessView from "@/components/delivery/CheckoutSuccessView"
import OrderSummary from "@/components/delivery/OrderSummary"
import OrderNotes from "@/components/delivery/OrderNotes"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { UserData } from "@/components/types"

import CelebrationPopup from "@/components/CelebrationPopup"
import { CartItemSkeleton, OrderSummarySkeleton } from "@/components/skeleto/CartItemSkeleton"
import EmptyCart from "@/components/empty/EmptyCart"
import OrderSummarySidebar from "@/components/order/OrderSummarySidebar"
import OrderSuccessModal from "@/components/order/OrderSuccessModal"

// Custom hooks
import { useCartData } from "@/hooks/Usecartdata"
import { useCheckout } from "@/hooks/Usecheckout"
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://rootoportal.onrender.com/api"


export default function CartPage() {
  // User state
  const [user, setUser] = useState<UserData | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")

  // Celebration state
  const [celebration, setCelebration] = useState({ show: false, action: "", product: null })

  // Custom hooks
  const {
    cartItems,
    setCartItems,
    demandProducts,
    isLoading,
    isUpdating,
    updateQuantity,
    removeItem,
    addToCart
  } = useCartData()

  const {
    showDeliveryModal,
    setShowDeliveryModal,
    deliveryView,
    setDeliveryView,
    savedAddress,
    showCheckoutSuccess,
    setShowCheckoutSuccess,
    orderNotes,
    setOrderNotes,
    isSubmittingOrder,
    showOrderSuccess,
    setShowOrderSuccess,
    successOrderData,
    setSuccessOrderData,
    handleAddressComplete,
    handleCloseDeliveryModal,
    handleDeliveryModalAddressSelected,
    handlePlaceOrder
  } = useCheckout()

  // Load user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) setUser(JSON.parse(savedUser))
  }, [])

  // Handle celebration events
  useEffect(() => {
    const handleCelebration = (e: any) => {
      setCelebration({ show: true, action: e.detail.action, product: e.detail.product })
      setTimeout(() => setCelebration({ show: false, action: "", product: null }), 3000)
    }
    window.addEventListener("celebrate-action", handleCelebration)
    return () => window.removeEventListener("celebrate-action", handleCelebration)
  }, [])

  const handleProceedToCheckout = () => {
    if (!user) {
      setShowAuth(true)
      setAuthMode("login")
    } else {
      setShowDeliveryModal(true)
      setDeliveryView('saved')
    }
  }

  const clearCart = async (orderId?: number) => {
    console.log("🧹 [CLEAR CART] Function called!")
    console.log("   User ID:", user?.id)
    console.log("   Order ID:", orderId)

    try {
      const requestBody = {
        customerId: user?.id,
        orderId: orderId,
      }

      console.log("📤 [CLEAR CART] Sending request:", requestBody)

      const response = await fetch(`${API_BASE}/clear_cart.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      console.log("📥 [CLEAR CART] API Response:", result);

      if (result.success) {
        console.log("✅ [CLEAR CART] Success!")
        console.log("   Marked items:", result.data?.markedItems || 0)

        setCartItems([]);
        window.dispatchEvent(new Event("cart-updated"));

        console.log("✅ [CLEAR CART] Local cart cleared and event dispatched")
      } else {
        console.error("❌ [CLEAR CART] Failed:", result.message)
      }
    } catch (error) {
      console.error("❌ [CLEAR CART] Error:", error);
    }
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0)
  const tax = subtotal * 0.08
  const shipping = subtotal > 500 ? 0 : 50
  const total = subtotal + tax + shipping

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />

      <CelebrationPopup show={celebration.show} action={celebration.action} product={celebration.product} />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-6 font-semibold">
              <ArrowLeft className="w-5 h-5" /> Continue Shopping
            </Link>
            <h1 className="text-4xl font-bold text-gray-800">Shopping Cart</h1>
            {!isLoading && (
              <p className="text-gray-600 mt-2">
                {cartItems.length > 0
                  ? `${cartItems.length} item${cartItems.length > 1 ? 's' : ''} in your cart`
                  : 'Your cart is empty'}
              </p>
            )}
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <CartItemSkeleton />
                <CartItemSkeleton />
                <CartItemSkeleton />
              </div>
              <div><OrderSummarySkeleton /></div>
            </div>
          ) : cartItems.length === 0 ? (
            /* Empty Cart */
            <EmptyCart demandProducts={demandProducts} onAddToCart={addToCart} />
          ) : (
            /* Cart with Items */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Order Items */}
                <OrderSummary
                  items={cartItems}
                  isUpdating={isUpdating}
                  onQuantityChange={updateQuantity}
                  onRemoveItem={removeItem}
                  compact={false}
                />

                {/* Order Notes */}
                <OrderNotes onSave={(notes) => setOrderNotes(notes)} />
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <OrderSummarySidebar
                  subtotal={subtotal}
                  tax={tax}
                  shipping={shipping}
                  total={total}
                  onProceedToCheckout={handleProceedToCheckout}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Auth Modal */}
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
                const userData = JSON.parse(localStorage.getItem("user")!)
                setUser(userData)
                setShowDeliveryModal(true)
              }}
              onSwitchToSignup={() => setAuthMode("signup")}
            />
          ) : (
            <SignupModal
              onSuccess={() => {
                setShowAuth(false)
                const userData = JSON.parse(localStorage.getItem("user")!)
                setUser(userData)
                setShowDeliveryModal(true)
              }}
              onSwitchToLogin={() => setAuthMode("login")}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delivery Modal */}
      {showDeliveryModal && user && (
        <DeliveryModal
          userData={user}
          currentView={deliveryView}
          onViewChange={setDeliveryView}
          onAddressComplete={(address) => handleAddressComplete(address, user)}
          savedAddress={savedAddress}
          onClose={handleCloseDeliveryModal}
          onAddressSelected={handleDeliveryModalAddressSelected}
        />
      )}

      {/* Checkout Success View */}
      {showCheckoutSuccess && savedAddress && (
        <CheckoutSuccessView
          items={cartItems}
          address={savedAddress}
          isUpdating={isUpdating}
          onQuantityChange={updateQuantity}
          onRemoveItem={removeItem}
          onChangeAddress={() => {
            setShowCheckoutSuccess(false)
            setShowDeliveryModal(true)
          }}
          onPlaceOrder={(paymentMethod, orderData) => {
            console.log("📞 [CART PAGE] onPlaceOrder called")
            console.log("   paymentMethod:", paymentMethod)
            console.log("   orderData:", orderData)
            console.log("   orderData.clearCart exists?", typeof orderData?.clearCart, orderData?.clearCart)

            return handlePlaceOrder(paymentMethod, user, cartItems, () => setCartItems([]), orderData)
          }}
          onClose={() => setShowCheckoutSuccess(false)}
          isSubmitting={isSubmittingOrder}
          clearCart={clearCart}
        />
      )}

      {/* Order Success Modal */}
      {showOrderSuccess && successOrderData && (
        <OrderSuccessModal
          orderNumber={successOrderData.orderNumber}
          totalAmount={successOrderData.totalAmount}
          onClose={() => {
            setShowOrderSuccess(false)
            setSuccessOrderData(null)
          }}
        />
      )}

      <Footer />
    </div>
  )
}