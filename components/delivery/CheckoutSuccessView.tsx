"use client"

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Check, Edit2, Download, AlertCircle, Truck, Clock, Shield, X, ChevronDown, ChevronUp, Package, CreditCard, FileText, ArrowRight, BadgeCheck, Leaf } from 'lucide-react'
import OrderSummary from './OrderSummary'
import AddressDisplay from './AddressDisplay'
import PaymentMethodSelector, {PaymentMethod} from './PaymentMethodSelector'

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
}

interface SavedAddress {
  id?: number
  name: string
  phoneNumber: string
  email: string
  flatNo: string
  landmark?: string
  fullAddress: string
  label: 'Home' | 'Work' | 'Other'
  coordinates?: { lat: number; lng: number }
  savedAt?: string
  isDefault?: boolean
}

interface CheckoutSuccessViewProps {
  items: CartItem[]
  address: SavedAddress
  isUpdating?: number | null
  onQuantityChange: (productId: number, newQuantity: number) => void
  onRemoveItem: (productId: number) => void
  onChangeAddress: () => void
  onPlaceOrder: (paymentMethod: PaymentMethod, orderData?: any) => void | Promise<void>
  onClose: () => void
  isSubmitting?: boolean
  clearCart?: (orderId?: number) => Promise<void> 
}

export default function CheckoutSuccessView({
  items,
  address,
  isUpdating = null,
  onQuantityChange,
  onRemoveItem,
  onChangeAddress,
  onPlaceOrder,
  onClose,
  isSubmitting = false,
  clearCart
}: CheckoutSuccessViewProps) {
  const [expandedItems, setExpandedItems] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [showPaymentSelector, setShowPaymentSelector] = useState(false)
  const [showImportantInfo, setShowImportantInfo] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Portal mounting
  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
  const tax = subtotal * 0.08
  const shipping = subtotal > 500 ? 0 : 50
  const total = subtotal + tax + shipping

  const handlePlaceOrderClick = () => {
    if (!agreeToTerms) {
      alert('Please agree to the terms and conditions')
      return
    }
    setShowPaymentSelector(true)
  }

  const handlePaymentMethodSelect = async (paymentMethod: PaymentMethod) => {
    setShowPaymentSelector(false)
    
    const calculatedTotal = subtotal + tax + shipping
    
    const orderData = {
      items,
      address,
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      shipping: parseFloat(shipping.toFixed(2)),
      total: parseFloat(calculatedTotal.toFixed(2)),
      paymentMethod,
      clearCart
    }
    
    await onPlaceOrder(paymentMethod, orderData)
  }

  const handleClosePaymentSelector = () => {
    setShowPaymentSelector(false)
  }

  const downloadInvoice = () => {
    const invoiceText = `
=====================================
              ORDER INVOICE
=====================================

DELIVERY ADDRESS:
${address.label}
${address.name}
${address.flatNo}${address.landmark ? `, ${address.landmark}` : ''}
${address.fullAddress}
Phone: ${address.phoneNumber}
Email: ${address.email}

=====================================
ITEMS ORDERED:
=====================================
${items.map(item => `${item.name}
  ${item.quantity} kg × ₹${item.price.toFixed(2)} = ₹${item.subtotal.toFixed(2)}`).join('\n\n')}

=====================================
PRICING BREAKDOWN:
=====================================
Subtotal:          ₹${subtotal.toFixed(2)}
Tax (8%):          ₹${tax.toFixed(2)}
Shipping:          ${shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}
-------------------------------------
TOTAL:             ₹${total.toFixed(2)}
=====================================

Order Date: ${new Date().toLocaleDateString('en-IN')}
Expected Delivery: 1-2 business days
    `.trim()

    const blob = new Blob([invoiceText], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `invoice-${Date.now()}.txt`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const modalContent = (
    <>
      {/* CHECKOUT REVIEW MODAL */}
      <div 
        className="checkout-review-modal fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center"
        style={{ zIndex: 99999 }}
        onClick={onClose}
      >
        <div 
          className="bg-gray-50 w-full sm:max-w-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col rounded-t-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* CLEAN PROFESSIONAL HEADER */}
          <div className="bg-white border-b border-gray-200 px-5 py-4 sm:px-6 sm:py-5 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-green-600 flex items-center justify-center shadow-sm">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Order Review</h2>
                  <p className="text-sm text-gray-500">Verify details before placing order</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors"
                style={{ touchAction: 'manipulation' }}
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
              </button>
            </div>

            {/* Order Summary Bar */}
            <div className="mt-4 flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Items</p>
                  <p className="text-lg font-bold text-gray-900">{items.length}</p>
                </div>
                <div className="h-8 w-px bg-gray-300"></div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Weight</p>
                  <p className="text-lg font-bold text-gray-900">{items.reduce((sum, item) => sum + item.quantity, 0).toFixed(2)} kg</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total</p>
                <p className="text-2xl font-bold text-green-600">₹{total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* SCROLLABLE CONTENT */}
          <div 
            className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 space-y-4"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {/* TRUST INDICATORS - Minimal & Professional */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="bg-white rounded-xl p-3 border border-gray-200 text-center">
                <Truck className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xs font-semibold text-gray-900">1-2 Day Delivery</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-gray-200 text-center">
                <Shield className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-xs font-semibold text-gray-900">Secure Checkout</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-gray-200 text-center">
                <Leaf className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <p className="text-xs font-semibold text-gray-900">Farm Fresh</p>
              </div>
            </div>

            {/* DELIVERY ADDRESS */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                  Delivery Address
                </h3>
                <button
                  onClick={onChangeAddress}
                  className="text-sm font-medium text-green-600 hover:text-green-700 flex items-center gap-1 transition-colors"
                  style={{ touchAction: 'manipulation' }}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Change
                </button>
              </div>
              <div className="p-4">
                <AddressDisplay
                  address={address}
                  onChangeAddress={onChangeAddress}
                  compact={true}
                />
              </div>
            </div>

            {/* ORDER ITEMS */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                  Order Items
                  <span className="text-xs font-normal text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">{items.length} items</span>
                </h3>
                <button
                  onClick={() => setExpandedItems(!expandedItems)}
                  className="text-sm font-medium text-gray-600 hover:text-gray-800 flex items-center gap-1 transition-colors"
                  style={{ touchAction: 'manipulation' }}
                >
                  {expandedItems ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      <span className="hidden sm:inline">Collapse</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      <span className="hidden sm:inline">Expand</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-4">
                <OrderSummary
                  items={items}
                  isUpdating={isUpdating}
                  onQuantityChange={onQuantityChange}
                  onRemoveItem={onRemoveItem}
                  compact={!expandedItems}
                />
              </div>
            </div>

            {/* PRICE BREAKDOWN */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">3</span>
                  Price Summary
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({items.length} items)</span>
                  <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (8% GST)</span>
                  <span className="font-medium text-gray-900">₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Charge</span>
                  {shipping === 0 ? (
                    <span className="font-semibold text-green-600">FREE</span>
                  ) : (
                    <span className="font-medium text-gray-900">₹{shipping.toFixed(2)}</span>
                  )}
                </div>
                {shipping === 0 && (
                  <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                    You saved ₹50 on delivery! Free delivery on orders above ₹500.
                  </p>
                )}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total Amount</span>
                    <span className="text-2xl font-bold text-gray-900">₹{total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 text-right mt-1">Inclusive of all taxes</p>
                </div>
              </div>
            </div>

            {/* IMPORTANT INFORMATION */}
            <div className="bg-amber-50 rounded-xl border border-amber-200 overflow-hidden">
              <button
                onClick={() => setShowImportantInfo(!showImportantInfo)}
                className="w-full px-4 py-3 flex items-center justify-between"
                style={{ touchAction: 'manipulation' }}
              >
                <h4 className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Important Information
                </h4>
                {showImportantInfo ? (
                  <ChevronUp className="w-4 h-4 text-amber-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-amber-600" />
                )}
              </button>

              {showImportantInfo && (
                <div className="px-4 pb-4">
                  <ul className="space-y-2 text-sm text-amber-900">
                    <li className="flex items-start gap-2">
                      <BadgeCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span>All products are hand-picked and quality checked</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span>Delivery between 9 AM - 6 PM on your selected day</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span>100% refund guarantee if not satisfied</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* TERMS & CONDITIONS */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <div className="relative flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                    style={{ touchAction: 'manipulation' }}
                  />
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-900">I agree to the Terms & Conditions</span>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    By placing this order, I confirm the delivery address and products selected. I agree to receive order updates via SMS and email.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* STICKY FOOTER */}
          <div className="bg-white border-t border-gray-200 px-4 sm:px-6 py-4 flex-shrink-0 space-y-3">
            {/* Main CTA */}
            <button
              onClick={handlePlaceOrderClick}
              disabled={!agreeToTerms || isSubmitting}
              className="w-full py-4 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-base rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
              style={{ touchAction: 'manipulation' }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Secondary Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={downloadInvoice}
                className="text-sm font-medium text-gray-600 hover:text-gray-800 flex items-center gap-1.5 transition-colors"
                style={{ touchAction: 'manipulation' }}
              >
                <Download className="w-4 h-4" />
                Download Invoice
              </button>
              
              <button
                onClick={onClose}
                className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                style={{ touchAction: 'manipulation' }}
              >
                Back to Cart
              </button>
            </div>

            {/* Trust Footer */}
            <div className="flex items-center justify-center gap-4 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Shield className="w-3.5 h-3.5 text-green-600" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <BadgeCheck className="w-3.5 h-3.5 text-green-600" />
                <span>Verified Seller</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Truck className="w-3.5 h-3.5 text-green-600" />
                <span>Fast Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PAYMENT METHOD SELECTOR */}
      {showPaymentSelector && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100000 }}>
          <PaymentMethodSelector
            orderTotal={total}
            onPaymentMethodSelect={handlePaymentMethodSelect}
            onClose={handleClosePaymentSelector}
          />
        </div>
      )}
    </>
  )

  // Use Portal to render at document.body level
  if (!mounted) return null
  
  return createPortal(modalContent, document.body)
}