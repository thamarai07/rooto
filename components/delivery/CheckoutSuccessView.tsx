"use client"

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Edit2, Download, Truck, Clock, Shield, X, ChevronDown, ChevronUp,
  ChevronLeft, ArrowRight, BadgeCheck, Tag, ReceiptText, Lock
} from 'lucide-react'
import OrderSummary from './OrderSummary'
import { cartTotals } from '@/lib/pricing'
import AddressDisplay from './AddressDisplay'
import PaymentMethodSelector, { PaymentMethod } from './PaymentMethodSelector'

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
  const [showPaymentSelector, setShowPaymentSelector] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const { subtotal, tax, shipping, total } = cartTotals(items)
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0)

  const handlePlaceOrderClick = () => {
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

  const handleClosePaymentSelector = () => setShowPaymentSelector(false)

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
      <div
        className="qc-review fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center"
        style={{ zIndex: 99999 }}
        onClick={onClose}
      >
        <div
          className="bg-gray-50 w-full sm:max-w-md sm:rounded-3xl shadow-2xl overflow-hidden max-h-[94vh] sm:max-h-[90vh] flex flex-col rounded-t-3xl qc-sheet"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="bg-white px-3 py-3 flex items-center gap-2 flex-shrink-0 border-b border-gray-100">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full hover:bg-gray-100 active:bg-gray-200 flex items-center justify-center transition-colors"
              style={{ touchAction: 'manipulation' }}
              aria-label="Back to cart"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex-1">
              <h2 className="text-base font-bold text-gray-900 leading-tight">Review your order</h2>
              <p className="text-xs text-gray-400">{items.length} item{items.length !== 1 && 's'} • {totalQty.toFixed(2)} kg</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full hover:bg-gray-100 active:bg-gray-200 flex items-center justify-center transition-colors"
              style={{ touchAction: 'manipulation' }}
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* SCROLLABLE CONTENT */}
          <div
            className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-3"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {/* DELIVERY ETA BANNER */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl px-4 py-3 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <p className="font-bold text-[15px]">Delivery in 1–2 days</p>
                <p className="text-xs text-green-50/90">Standard delivery • 9 AM – 6 PM</p>
              </div>
            </div>

            {/* DELIVERY ADDRESS */}
            <div className="bg-white rounded-2xl p-3.5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                  <BadgeCheck className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-bold text-gray-900">
                      Delivering to <span className="text-green-700">{address.label}</span>
                    </p>
                    <button
                      onClick={onChangeAddress}
                      className="text-xs font-semibold text-green-600 hover:text-green-700 flex items-center gap-1 flex-shrink-0"
                      style={{ touchAction: 'manipulation' }}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Change
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {address.name}, {address.flatNo}{address.landmark ? `, ${address.landmark}` : ''}, {address.fullAddress}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{address.phoneNumber}</p>
                </div>
              </div>
            </div>

            {/* ORDER ITEMS */}
            <div className="bg-white rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpandedItems(!expandedItems)}
                className="w-full flex items-center justify-between px-3.5 py-3"
                style={{ touchAction: 'manipulation' }}
              >
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <ReceiptText className="w-4 h-4 text-gray-400" />
                  {items.length} item{items.length !== 1 && 's'} in cart
                </h3>
                <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                  {expandedItems ? <>Hide <ChevronUp className="w-4 h-4" /></> : <>View <ChevronDown className="w-4 h-4" /></>}
                </span>
              </button>
              <div className="px-3.5 pb-3.5">
                <OrderSummary
                  items={items}
                  isUpdating={isUpdating}
                  onQuantityChange={onQuantityChange}
                  onRemoveItem={onRemoveItem}
                  compact={!expandedItems}
                />
              </div>
            </div>

            {/* BILL DETAILS */}
            <div className="bg-white rounded-2xl p-3.5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900">Bill details</h3>
                <button
                  onClick={downloadInvoice}
                  className="text-xs font-medium text-gray-400 hover:text-gray-600 flex items-center gap-1"
                  style={{ touchAction: 'manipulation' }}
                >
                  <Download className="w-3.5 h-3.5" />
                  Invoice
                </button>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between text-[13px]">
                  <span className="text-gray-500">Item total</span>
                  <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-gray-500">Taxes &amp; charges (GST)</span>
                  <span className="font-medium text-gray-900">₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-gray-400" /> Delivery fee
                  </span>
                  {shipping === 0 ? (
                    <span className="flex items-center gap-1.5">
                      <span className="text-gray-400 line-through">₹50.00</span>
                      <span className="font-semibold text-green-600">FREE</span>
                    </span>
                  ) : (
                    <span className="font-medium text-gray-900">₹{shipping.toFixed(2)}</span>
                  )}
                </div>

                <div className="border-t border-dashed border-gray-200 my-1" />

                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">To Pay</span>
                  <span className="text-lg font-extrabold text-gray-900">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {shipping === 0 && (
                <div className="mt-3 flex items-center gap-2 bg-green-50 text-green-700 rounded-xl px-3 py-2 text-xs font-medium">
                  <Tag className="w-4 h-4" />
                  You saved ₹50 on delivery!
                </div>
              )}
            </div>

            {/* IMPORTANT INFO (collapsible, subtle) */}
            <div className="bg-white rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="w-full px-3.5 py-3 flex items-center justify-between"
                style={{ touchAction: 'manipulation' }}
              >
                <h4 className="text-sm font-semibold text-gray-700">Delivery &amp; refund info</h4>
                {showInfo ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {showInfo && (
                <ul className="px-3.5 pb-3.5 space-y-2 text-xs text-gray-600">
                  <li className="flex items-start gap-2">
                    <BadgeCheck className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>All products are hand-picked and quality checked</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Delivery between 9 AM – 6 PM on your selected day</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>100% refund guarantee if you're not satisfied</span>
                  </li>
                </ul>
              )}
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 pt-1">
              <Lock className="w-3 h-3 text-green-500" />
              100% secure payments
            </div>
          </div>

          {/* STICKY BOTTOM BAR (quick-commerce style) */}
          <div className="bg-white border-t border-gray-100 px-3 pt-3 pb-4 flex-shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 leading-tight">
                <p className="text-[20px] font-extrabold text-gray-900">₹{total.toFixed(2)}</p>
                <p className="text-[11px] text-gray-400 -mt-0.5">
                  TO PAY{shipping === 0 && <span className="text-green-600 font-semibold"> • Saved ₹50</span>}
                </p>
              </div>
              <button
                onClick={handlePlaceOrderClick}
                disabled={isSubmitting}
                className="flex-1 py-3.5 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:bg-gray-300 text-white font-bold text-[15px] rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-2"
                style={{ touchAction: 'manipulation' }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Placing order…</span>
                  </>
                ) : (
                  <>
                    <span>Place Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-center text-gray-400 mt-2">
              By placing the order you agree to our Terms &amp; Conditions
            </p>
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

      <style jsx>{`
        @keyframes qcSheetUp {
          from { transform: translateY(50px); opacity: 0.5; }
          to { transform: translateY(0); opacity: 1; }
        }
        .qc-sheet { animation: qcSheetUp 0.28s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </>
  )

  if (!mounted) return null
  return createPortal(modalContent, document.body)
}
