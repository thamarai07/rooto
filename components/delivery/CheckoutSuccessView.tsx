"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  Edit2, Truck, X, ChevronLeft, ArrowRight, MapPin, Tag, ReceiptText,
  ShoppingBasket, Plus, Minus, Trash2, Loader2
} from 'lucide-react'
import { cartTotals, taxLabel, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '@/lib/pricing'
import { useTaxRate } from '@/hooks/useTaxRate'
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
  unit?: string
  unit_label?: string
}

const cvLabel = (i: { unit?: string; unit_label?: string }) =>
  i.unit_label || (i.unit === "piece" ? "Piece" : "kg")
const cvQty = (q: number, i: { unit?: string }) =>
  i.unit === "piece" ? String(Math.round(q)) : q
// Piece items step by 1; everything else keeps the 0.25 kg step.
const cvStep = (i: { unit?: string }) => (i.unit === "piece" ? 1 : 0.25)

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
  /** Back one step, to the address step. Falls back to onChangeAddress. */
  onBack?: () => void
  onPlaceOrder: (paymentMethod: PaymentMethod, orderData?: any) => void | Promise<void>
  onClose: () => void
  isSubmitting?: boolean
  clearCart?: (orderId?: number) => Promise<void>
}

type Tab = 'address' | 'items' | 'bill'
const CLOSE_ANIMATION_MS = 220

export default function CheckoutSuccessView({
  items,
  address,
  isUpdating = null,
  onQuantityChange,
  onRemoveItem,
  onChangeAddress,
  onBack,
  onPlaceOrder,
  onClose,
  isSubmitting = false,
  clearCart
}: CheckoutSuccessViewProps) {
  const [showPaymentSelector, setShowPaymentSelector] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('cod')
  // Set synchronously, so a double-tap can't send the order twice before state updates.
  const placingOrder = useRef(false)
  const [activeTab, setActiveTab] = useState<Tab>('address')
  const [mounted, setMounted] = useState(false)
  const [closing, setClosing] = useState(false)
  const taxRatePercent = useTaxRate()

  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // Play the exit animation, then let the parent unmount us.
  const handleClose = useCallback(() => {
    if (closing) return
    setClosing(true)
    setTimeout(onClose, CLOSE_ANIMATION_MS)
  }, [closing, onClose])

  useEffect(() => {
    if (showPaymentSelector) return // the payment popup handles its own Escape
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleClose, showPaymentSelector])

  const { subtotal, tax, shipping, total } = cartTotals(items, taxRatePercent)
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0)

  const handlePaymentMethodSelect = async (paymentMethod: PaymentMethod) => {
    if (placingOrder.current) return
    placingOrder.current = true
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
    // The final step stays open while sending: on success the parent closes the checkout,
    // on failure the customer is still here and can retry.
    try {
      await onPlaceOrder(paymentMethod, orderData)
    } finally {
      placingOrder.current = false
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'address', label: 'Address' },
    { id: 'items', label: `Items (${items.length})` },
    { id: 'bill', label: 'Bill' },
  ]
  const activeIndex = tabs.findIndex(t => t.id === activeTab)
  const onLastTab = activeIndex === tabs.length - 1
  // Tabs exist only on mobile; from sm every section is already on screen.
  const isDesktop = () => window.matchMedia('(min-width: 640px)').matches

  const handleNext = () => {
    if (onLastTab || isDesktop()) setShowPaymentSelector(true)
    else setActiveTab(tabs[activeIndex + 1].id)
  }

  const handleBack = () => {
    if (activeIndex > 0 && !isDesktop()) setActiveTab(tabs[activeIndex - 1].id)
    else (onBack ?? onChangeAddress)()
  }

  // On mobile only the active tab's section is shown; from sm every section is visible.
  const sectionClass = (tab: Tab) =>
    `${activeTab === tab ? 'block animate-in fade-in-0 slide-in-from-bottom-2 duration-300' : 'hidden'} sm:block sm:animate-none`

  /* ---------- Sections ---------- */

  const addressSection = (
    <section className={sectionClass('address')}>
      <div className="rounded-2xl border border-gray-100 bg-white p-4">
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-green-600" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-gray-900">
                Delivering to <span className="text-green-700">{address.label}</span>
              </p>
              <button
                onClick={onChangeAddress}
                className="text-xs font-semibold text-green-600 hover:text-green-700 hover:bg-green-50 px-2 py-1 -my-1 rounded-lg flex items-center gap-1 flex-shrink-0 transition-colors"
                style={{ touchAction: 'manipulation' }}
              >
                <Edit2 className="w-3.5 h-3.5" />
                Change
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed line-clamp-3">
              {/* fullAddress usually already starts with the flat no and has the landmark — don't repeat them */}
              {[
                address.name,
                address.flatNo && !address.fullAddress?.includes(address.flatNo) ? address.flatNo : '',
                address.landmark && !address.fullAddress?.includes(address.landmark) ? address.landmark : '',
                address.fullAddress,
              ].filter(Boolean).join(', ')}
            </p>
            <p className="text-xs text-gray-400 mt-1">{address.phoneNumber}</p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-xs text-green-800">
          <Truck className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span><span className="font-semibold">Delivery in 1–2 days</span> · 9 AM – 6 PM</span>
        </div>
      </div>
    </section>
  )

  const itemsSection = (
    <section className={sectionClass('items')}>
      <div className="rounded-2xl border border-gray-100 bg-white">
        <div className="hidden sm:flex items-center gap-2 px-4 pt-3.5 pb-2">
          <ShoppingBasket className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-bold text-gray-900">
            {items.length} item{items.length !== 1 && 's'}
            {items.every(i => i.unit !== 'piece') && <span className="font-normal text-gray-400"> · {totalQty.toFixed(2)} kg</span>}
          </h3>
        </div>
        {/* Only this list scrolls, and only when the cart is long */}
        <ul className="max-h-[42vh] sm:max-h-56 overflow-y-auto overscroll-contain divide-y divide-gray-50 px-2">
          {items.map((item, i) => {
            const busy = isUpdating === item.id
            const step = cvStep(item)
            return (
              <li
                key={item.cart_id}
                className="flex items-center gap-3 px-2 py-2.5 animate-in fade-in-0 slide-in-from-bottom-1 duration-300 fill-mode-both"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover bg-green-50 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">₹{Number(item.price).toFixed(2)}/{cvLabel(item)}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-sm font-bold text-gray-900">₹{Number(item.subtotal).toFixed(2)}</span>
                  <div className="flex items-center rounded-lg border border-green-200 bg-green-50 text-green-700">
                    {item.quantity <= step ? (
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        disabled={busy}
                        aria-label={`Remove ${item.name}`}
                        className="p-1 hover:bg-green-100 rounded-l-lg disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onQuantityChange(item.id, item.quantity - step)}
                        disabled={busy}
                        aria-label="Decrease quantity"
                        className="p-1 hover:bg-green-100 rounded-l-lg disabled:opacity-50"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span className="min-w-[3.5rem] px-1 text-center text-xs font-bold">
                      {busy ? <Loader2 className="w-3.5 h-3.5 mx-auto animate-spin" /> : `${cvQty(item.quantity, item)} ${cvLabel(item)}`}
                    </span>
                    <button
                      onClick={() => onQuantityChange(item.id, item.quantity + step)}
                      disabled={busy || item.quantity >= item.stock}
                      aria-label="Increase quantity"
                      className="p-1 hover:bg-green-100 rounded-r-lg disabled:opacity-50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )

  const billSection = (
    <section className={`${sectionClass('bill')} sm:h-full`}>
      <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:h-full">
        <h3 className="hidden sm:flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
          <ReceiptText className="w-4 h-4 text-gray-400" /> Bill details
        </h3>
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Item total</span>
            <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{taxLabel(taxRatePercent)}</span>
            <span className="font-medium text-gray-900">₹{tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Delivery fee</span>
            {shipping === 0 ? (
              <span className="flex items-center gap-1.5">
                <span className="text-gray-400 line-through">₹{SHIPPING_FEE.toFixed(2)}</span>
                <span className="font-semibold text-green-600">FREE</span>
              </span>
            ) : (
              <span className="font-medium text-gray-900">₹{shipping.toFixed(2)}</span>
            )}
          </div>
          <div className="border-t border-dashed border-gray-200 pt-2.5 flex justify-between items-center">
            <span className="font-bold text-gray-900">To Pay</span>
            <span className="text-lg font-extrabold text-gray-900">₹{total.toFixed(2)}</span>
          </div>
        </div>

        {shipping === 0 ? (
          <div className="mt-3 flex items-center gap-2 bg-green-50 text-green-700 rounded-xl px-3 py-2 text-xs font-medium">
            <Tag className="w-4 h-4" /> You saved ₹{SHIPPING_FEE} on delivery!
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-2 bg-orange-50 text-orange-700 rounded-xl px-3 py-2 text-xs font-medium">
            <Truck className="w-4 h-4" /> Add ₹{(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)} more for free delivery
          </div>
        )}
      </div>
    </section>
  )

  /* ---------- Modal ---------- */

  const modalContent = (
    <>
      <div
        className="fixed inset-0 flex items-end sm:items-center justify-center sm:p-4"
        style={{ zIndex: 99999 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-order-title"
      >
        {/* Backdrop */}
        <div
          onClick={handleClose}
          className={`absolute inset-0 bg-gray-950/50 backdrop-blur-sm duration-200 ${closing ? 'animate-out fade-out-0 fill-mode-forwards' : 'animate-in fade-in-0'}`}
        />

        <div
          className={`relative bg-gray-50 w-full sm:max-w-3xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[100dvh] sm:max-h-[92vh] flex flex-col ${closing
            ? 'animate-out fade-out-0 slide-out-to-bottom-10 sm:zoom-out-95 duration-200 fill-mode-forwards'
            : 'animate-in fade-in-0 slide-in-from-bottom-16 sm:slide-in-from-bottom-4 sm:zoom-in-95 duration-300 ease-out'}`}
        >
          {/* HEADER */}
          <div className="bg-white flex-shrink-0">
            <div className="sm:hidden flex justify-center pt-2.5">
              <span className="w-10 h-1.5 rounded-full bg-gray-200" />
            </div>
            <div className="px-3 sm:px-5 py-3 flex items-center gap-2">
              <button
                onClick={handleBack}
                className="w-9 h-9 rounded-full hover:bg-gray-100 active:bg-gray-200 flex items-center justify-center transition-colors"
                style={{ touchAction: 'manipulation' }}
                aria-label="Back"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div className="flex-1">
                <h2 id="review-order-title" className="text-base sm:text-lg font-bold text-gray-900 leading-tight">Review your order</h2>
                <p className="text-xs text-gray-400">
                  {items.length} item{items.length !== 1 && 's'}{items.every(i => i.unit !== 'piece') ? ` • ${totalQty.toFixed(2)} kg` : ''}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-9 h-9 rounded-full hover:bg-gray-100 hover:rotate-90 active:bg-gray-200 flex items-center justify-center transition-all duration-300"
                style={{ touchAction: 'manipulation' }}
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* TABS (mobile only) */}
            <div className="sm:hidden px-3 pb-3" role="tablist" aria-label="Order details">
              <div className="relative grid grid-cols-3 rounded-xl bg-gray-100 p-1">
                <span
                  aria-hidden
                  className="absolute top-1 bottom-1 left-1 rounded-lg bg-white shadow-sm transition-transform duration-300 ease-out"
                  style={{ width: 'calc((100% - 0.5rem) / 3)', transform: `translateX(${activeIndex * 100}%)` }}
                />
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative z-10 py-2 text-sm font-semibold rounded-lg transition-colors duration-300 ${activeTab === tab.id ? 'text-green-700' : 'text-gray-500'}`}
                    style={{ touchAction: 'manipulation' }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="border-b border-gray-100" />
          </div>

          {/* CONTENT — one tab at a time on mobile, two columns from sm */}
          {/* min-h keeps the sheet from jumping in height when switching tabs */}
          <div className="flex-1 min-h-[min(300px,40dvh)] sm:min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-5">
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-[1.25fr_1fr]">
              <div className="space-y-3 sm:space-y-4 min-w-0">
                {addressSection}
                {itemsSection}
              </div>
              {billSection}
            </div>
          </div>

          {/* BOTTOM BAR */}
          <div className="bg-white border-t border-gray-100 px-3 sm:px-5 pt-3 pb-4 flex-shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 leading-tight">
                <p className="text-xl font-extrabold text-gray-900">₹{total.toFixed(2)}</p>
                <p className="text-[11px] text-gray-400 -mt-0.5">
                  TO PAY{shipping === 0 && <span className="text-green-600 font-semibold"> • Saved ₹{SHIPPING_FEE}</span>}
                </p>
              </div>
              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className="group relative overflow-hidden flex-1 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 disabled:from-gray-300 disabled:to-gray-300 text-white font-bold text-[15px] rounded-2xl shadow-lg shadow-green-600/25 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:shadow-none disabled:translate-y-0 flex items-center justify-center gap-2"
                style={{ touchAction: 'manipulation' }}
              >
                <span aria-hidden className="absolute inset-y-0 left-0 w-1/3 bg-white/25 rooto-shine" />
                <span className="relative">
                  {onLastTab ? 'Continue' : (
                    <>
                      <span className="sm:hidden">Next</span>
                      <span className="hidden sm:inline">Continue</span>
                    </>
                  )}
                </span>
                <ArrowRight className="relative w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
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
            onClose={() => setShowPaymentSelector(false)}
            onCloseAll={onClose}
            isSubmitting={isSubmitting}
            selectedMethod={selectedPayment}
            onMethodChange={setSelectedPayment}
          />
        </div>
      )}
    </>
  )

  if (!mounted) return null
  return createPortal(modalContent, document.body)
}
