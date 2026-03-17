"use client"

import { useState } from "react"
import { UserData, SavedAddress } from "@/components/types"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://rootoportal.onrender.com/api"


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
        const subtotal = orderData?.subtotal || cartItems.reduce((sum, item) => sum + (item.subtotal || item.price * item.quantity), 0)
        const tax = orderData?.tax || subtotal * 0.08
        const shippingCharge = orderData?.shipping || (subtotal > 500 ? 0 : 50)
        const total = orderData?.total || (subtotal + tax + shippingCharge)



        const requestBody = {
          customerId: user?.id,
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            category: item.category || '',
            slug: item.slug || '',
            quantity: item.quantity,
            subtotal: item.subtotal
          })),
          address: {
            name: savedAddress?.name,
            phoneNumber: savedAddress?.phoneNumber,
            email: savedAddress?.email,
            flatNo: savedAddress?.flatNo,
            landmark: savedAddress?.landmark || '',
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
          headers: { "Content-Type": "application/json" },
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

          window.dispatchEvent(new Event("order-placed"))
          window.dispatchEvent(new Event("cart-updated"))

          if (onSuccess) {

            onSuccess()
          }
        } else {
          console.error("❌ [PLACE ORDER] Order failed:", result.message)
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