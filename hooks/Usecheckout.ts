"use client"

import { useState } from "react"
import { UserData, SavedAddress } from "@/components/types"
import { authHeaders } from "@/lib/auth"
import { cartTotals } from "@/lib/pricing"
import { refreshStoreSettings } from "@/lib/api/storeSettings.api"
import { trackPurchase } from "@/lib/fbPixel"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://seashell-skunk-617240.hostingersite.com/vfs-admin/api"


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
  unit?: string
}

export function useCheckout() {
  const [showDeliveryModal, setShowDeliveryModal] = useState(false)
  const [deliveryView, setDeliveryView] = useState<'saved' | 'map' | 'form' | 'success'>('saved')
  const [savedAddress, setSavedAddress] = useState<SavedAddress | null>(null)
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false)
  const [orderNotes, setOrderNotes] = useState("")
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [showOrderSuccess, setShowOrderSuccess] = useState(false)
  const [successOrderData, setSuccessOrderData] = useState<any>(null)

  const handleAddressComplete = async (address: any, user: UserData | null) => {
    setSavedAddress(address)
    setDeliveryView('success')

    // If it's a newly created address, save it — only for logged-in users.
    // Guests have no customerId/auth token to attach a saved address to;
    // their address just flows straight into the order below.
    if (!address.id && user) {
      try {
        const response = await fetch(`${API_BASE}/save_address.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({
            customerId: user?.id,
            name: address.name,
            phoneNumber: address.phoneNumber,
            email: address.email,
            flatNo: address.flatNo,
            streetAddress: address.streetAddress || '',
            area: address.area || '',
            landmark: address.landmark || '',
            city: address.city || '',
            state: address.state || '',
            pincode: address.pincode || '',
            country: address.country || 'India',
            fullAddress: address.fullAddress,
            label: address.label,
            coordinates: address.coordinates,
            phoneVerified: address.phoneVerified ? 1 : 0,
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
  const handlePlaceOrder = async (
    paymentMethod: 'cod' | 'online',
    user: UserData | null,
    cartItems: CartItem[],
    onSuccess?: () => void,
    orderData?: any
  ) => {

    setIsSubmittingOrder(true)

    try {
      if (paymentMethod === 'cod') {
        const t = cartTotals(cartItems)
        const subtotal = orderData?.subtotal || t.subtotal
        const tax = orderData?.tax || t.tax
        const shippingCharge = orderData?.shipping || t.shipping
        const total = orderData?.total || t.total

        // Read the token once so the "guest?" decision below matches exactly
        // what is sent to the server in the Authorization header.
        const headers = authHeaders()
        const isGuest = !headers.Authorization

        const requestBody = {
          // customerId intentionally omitted — backend reads it from JWT Bearer token
          items: cartItems.map(item => {
            const u = String(item.unit || '').toLowerCase()
            return {
              id: item.id,
              name: item.name,
              price: item.price,
              image: item.image,
              category: item.category || '',
              slug: item.slug || '',
              quantity: item.quantity,
              subtotal: item.subtotal,
              // Guests: the server has no saved cart to read the unit from, so a
              // piece line must say so — otherwise it is priced per kg and the
              // order is rejected. Signed-in customers: leave it out; the server
              // reads the unit from their saved cart row (unchanged behaviour).
              ...(isGuest && (u === 'piece' || u === 'pieces') ? { unit: 'piece' } : {}),
            }
          }),
          address: {
            name: savedAddress?.name,
            phoneNumber: savedAddress?.phoneNumber,
            email: savedAddress?.email,
            flatNo: savedAddress?.flatNo,
            streetAddress: savedAddress?.streetAddress || '',
            area: savedAddress?.area || '',
            landmark: savedAddress?.landmark || '',
            city: savedAddress?.city || '',
            state: savedAddress?.state || '',
            pincode: savedAddress?.pincode || '',
            country: savedAddress?.country || 'India',
            fullAddress: savedAddress?.fullAddress,
            label: savedAddress?.label,
            coordinates: savedAddress?.coordinates
          },
          notes: orderNotes,
          total: total,
          paymentMethod: 'cod'
        }



        const response = await fetch(`${API_BASE}/create_order.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify(requestBody),
        })

        const result = await response.json()


        if (result.success) {


          if (orderData?.clearCart) {

            try {
              await orderData.clearCart(result.data?.orderId || result.data?.id)

            } catch (clearError) {
              console.error("❌ [PLACE ORDER] Error clearing cart:", clearError)
            }
          } else {

          }

          setShowCheckoutSuccess(false)

          setSuccessOrderData({
            orderNumber: result.data.orderNumber,
            totalAmount: result.data.totalAmount
          })
          setShowOrderSuccess(true)

          trackPurchase(
            Number(result.data?.totalAmount ?? total) || 0,
            result.data?.orderId ?? result.data?.id ?? result.data?.orderNumber
          )

          window.dispatchEvent(new Event("order-placed"))
          window.dispatchEvent(new Event("cart-updated"))

          if (onSuccess) {

            onSuccess()
          }
        } else {
          console.error("❌ [PLACE ORDER] Order failed:", result.message)
          // If the tax rate changed in the admin panel, show the new totals.
          refreshStoreSettings(true)
          alert(result.message || 'Failed to place order')
        }
      } else {
        alert('Online payment coming soon!')
      }
    } catch (error) {
      console.error("❌ [PLACE ORDER] Error:", error)
      alert('Failed to place order. Please try again.')
    } finally {
      setIsSubmittingOrder(false)

    }
  }
  return {
    showDeliveryModal,
    setShowDeliveryModal,
    deliveryView,
    setDeliveryView,
    savedAddress,
    setSavedAddress,
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
  }
}