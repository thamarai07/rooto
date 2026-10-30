"use client"

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { CreditCard, Wallet, Banknote, ChevronLeft, ChevronRight, Shield, X, Lock, Smartphone, BadgeCheck, Info, Check, Loader2 } from 'lucide-react'

export type PaymentMethod = 'cod' | 'online'

interface PaymentMethodSelectorProps {
  onPaymentMethodSelect: (method: PaymentMethod) => void
  /** Back one step, to the order review. */
  onClose: () => void
  /** Leave the whole checkout (the ✕ button). Falls back to onClose. */
  onCloseAll?: () => void
  orderTotal: number
  /** True while the order request is in flight — locks the step so it can't be sent twice. */
  isSubmitting?: boolean
  /** Lets the parent remember the choice when the customer goes back and returns. */
  selectedMethod?: PaymentMethod
  onMethodChange?: (method: PaymentMethod) => void
}

const CLOSE_ANIMATION_MS = 220

const paymentOptions = [
  {
    id: 'cod' as PaymentMethod,
    title: 'Cash on Delivery',
    subtitle: 'Pay when your order arrives',
    icon: Banknote,
    accent: {
      icon: 'from-emerald-500 to-green-600 shadow-emerald-500/30',
      ring: 'border-emerald-500 bg-emerald-50/70 shadow-lg shadow-emerald-500/10',
      radio: 'border-emerald-500',
      dot: 'bg-emerald-500',
      tick: 'text-emerald-600',
    },
    features: ['Pay at doorstep', 'Inspect before paying', 'No advance required'],
    badge: 'Recommended',
  },
  {
    id: 'online' as PaymentMethod,
    title: 'Pay Online',
    subtitle: 'UPI, Cards, Net Banking & Wallets',
    icon: CreditCard,
    accent: {
      icon: 'from-blue-500 to-indigo-600 shadow-blue-500/30',
      ring: 'border-blue-500 bg-blue-50/70 shadow-lg shadow-blue-500/10',
      radio: 'border-blue-500',
      dot: 'bg-blue-500',
      tick: 'text-blue-600',
    },
    features: ['Instant confirmation', 'Multiple options', '100% secure'],
    badge: '',
  },
]

const ONLINE_METHODS = [
  { icon: Smartphone, label: 'UPI' },
  { icon: CreditCard, label: 'Cards' },
  { icon: Wallet, label: 'Wallets' },
  { icon: BadgeCheck, label: 'Net Banking' },
]

export default function PaymentMethodSelector({
  onPaymentMethodSelect,
  onClose,
  onCloseAll,
  orderTotal,
  isSubmitting = false,
  selectedMethod: initialMethod = 'cod',
  onMethodChange
}: PaymentMethodSelectorProps) {
  // Cash on Delivery is pre-selected so the customer can place the order in one tap.
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(initialMethod)
  const [mounted, setMounted] = useState(false)
  const [closing, setClosing] = useState(false)

  // Portal mounting. Page scroll is already locked by the review step underneath.
  useEffect(() => {
    setMounted(true)
  }, [])

  // Play the exit animation, then let the parent unmount us.
  const leaveWith = useCallback((fn: () => void) => {
    if (closing || isSubmitting) return
    setClosing(true)
    setTimeout(fn, CLOSE_ANIMATION_MS)
  }, [closing, isSubmitting])

  const handleClose = useCallback(() => leaveWith(onClose), [leaveWith, onClose])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleClose])

  const handleConfirm = () => {
    if (!isSubmitting) onPaymentMethodSelect(selectedMethod)
  }

  const selectMethod = (method: PaymentMethod) => {
    if (isSubmitting) return
    setSelectedMethod(method)
    onMethodChange?.(method)
  }

  const modalContent = (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center sm:p-4"
      style={{ zIndex: 100000 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-method-title"
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`absolute inset-0 bg-gray-950/50 backdrop-blur-sm duration-200 ${closing ? 'animate-out fade-out-0 fill-mode-forwards' : 'animate-in fade-in-0'}`}
      />

      {/* Sheet / dialog — sized to fit its content, no inner scrolling.
          (max-h + overflow on the sheet is only a safety net for very short screens.) */}
      <div
        className={`relative bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[100dvh] overflow-y-auto ${closing
          ? 'animate-out fade-out-0 slide-out-to-bottom-10 sm:zoom-out-95 duration-200 fill-mode-forwards'
          : 'animate-in fade-in-0 slide-in-from-bottom-16 sm:slide-in-from-bottom-4 sm:zoom-in-95 duration-300 ease-out'}`}
      >
        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3">
          <span className="w-10 h-1.5 rounded-full bg-gray-200" />
        </div>

        <div className="px-5 pt-3 pb-4 sm:px-7 sm:pt-6 sm:pb-6">
          {/* HEADER */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                aria-label="Back to order review"
                className="-ml-2 p-2 rounded-full text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-40"
                style={{ touchAction: 'manipulation' }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-600/30 flex items-center justify-center">
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 id="payment-method-title" className="text-lg sm:text-2xl font-bold text-gray-900">Place Your Order</h2>
                <p className="text-sm text-gray-500">Choose how you'd like to pay</p>
              </div>
            </div>

            <button
              onClick={() => leaveWith(onCloseAll ?? onClose)}
              disabled={isSubmitting}
              aria-label="Close"
              className="p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 hover:rotate-90 active:bg-gray-200 transition-all duration-300"
              style={{ touchAction: 'manipulation' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Order Total */}
          <div className="relative mt-4 sm:mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 px-5 py-3 sm:px-6 sm:py-4 text-white shadow-lg shadow-emerald-700/20 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 fill-mode-both" style={{ animationDelay: '80ms' }}>
            <span aria-hidden className="absolute -top-10 -right-8 w-36 h-36 rounded-full bg-white/10" />
            <span aria-hidden className="absolute -bottom-14 right-24 w-28 h-28 rounded-full bg-white/10" />
            <div className="relative flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-widest font-semibold text-white/75">Order Total</p>
                <p className="text-3xl sm:text-[2rem] font-extrabold tracking-tight">₹{orderTotal.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/75">Inclusive of taxes</p>
                <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold">
                  <BadgeCheck className="w-3.5 h-3.5" /> Best price guaranteed
                </p>
              </div>
            </div>
          </div>

          {/* PAYMENT OPTIONS — stacked on mobile, side by side from sm */}
          <div className="mt-4 sm:mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4" role="radiogroup" aria-label="Payment method">
            {paymentOptions.map((option, i) => {
              const Icon = option.icon
              const isSelected = selectedMethod === option.id

              return (
                <button
                  key={option.id}
                  onClick={() => selectMethod(option.id)}
                  role="radio"
                  aria-checked={isSelected}
                  className={`group relative w-full text-left rounded-2xl border-2 p-3.5 sm:p-4 transition-all duration-300 active:scale-[0.99] animate-in fade-in-0 slide-in-from-bottom-3 duration-500 fill-mode-both ${isSelected
                    ? option.accent.ring
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'}`}
                  style={{ touchAction: 'manipulation', animationDelay: `${160 + i * 90}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex w-full items-start justify-between gap-3">
                      {/* Icon */}
                      <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${option.accent.icon} shadow-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${isSelected ? 'scale-105 -rotate-6' : 'group-hover:scale-105'}`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pr-8">
                          <h3 className="text-base sm:text-lg font-bold text-gray-900">{option.title}</h3>
                          {option.badge && (
                            <span className="inline-flex items-center bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[11px] px-2 py-0.5 rounded-full font-semibold shadow-sm">
                              ★ {option.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{option.subtitle}</p>

                        {/* Features — inline chips on mobile, a tick list from sm */}
                        <ul className="hidden sm:flex mt-2.5 flex-wrap gap-x-3 gap-y-1">
                          {option.features.map((feature) => (
                            <li key={feature} className="flex items-center gap-1.5 text-xs text-gray-600">
                              <Check className={`w-3.5 h-3.5 flex-shrink-0 transition-colors duration-300 ${isSelected ? option.accent.tick : 'text-gray-300'}`} strokeWidth={3} />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Radio indicator */}
                  <span className={`absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${isSelected ? option.accent.radio : 'border-gray-300 bg-white'}`}>
                    <span className={`w-3 h-3 rounded-full ${option.accent.dot} transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isSelected ? 'scale-100' : 'scale-0'}`} />
                  </span>
                </button>
              )
            })}
          </div>

          {/* Details for the selected option (swaps with a fade) */}
          <div key={selectedMethod} className="mt-3 animate-in fade-in-0 slide-in-from-top-1 duration-300">
            {selectedMethod === 'cod' ? (
              <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2.5">
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                  Please keep exact change ready. Our delivery partner may not carry change for large denominations.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2 rounded-xl bg-blue-50/60 border border-blue-100 px-3.5 py-2.5">
                <span className="text-[11px] text-gray-500 uppercase tracking-wide font-semibold mr-1">Accepted</span>
                {ONLINE_METHODS.map(({ icon: MIcon, label }) => (
                  <span key={label} className="flex items-center gap-1.5 text-xs text-gray-700 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                    <MIcon className="w-3.5 h-3.5 text-blue-600" />
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="mt-4 sm:mt-5 space-y-1">
            {/* Main CTA */}
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="group relative overflow-hidden w-full py-3.5 sm:py-4 font-semibold text-base sm:text-lg rounded-2xl text-white bg-gradient-to-r from-green-500 to-emerald-600 disabled:from-gray-400 disabled:to-gray-400 disabled:shadow-none disabled:translate-y-0 shadow-lg shadow-green-600/30 transition-all duration-300 hover:shadow-xl hover:shadow-green-600/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] flex items-center justify-center gap-2"
              style={{ touchAction: 'manipulation' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Placing order…</span>
                </>
              ) : (
                <>
                  <span aria-hidden className="absolute inset-y-0 left-0 w-1/3 bg-white/25 rooto-shine" />
                  <span key={selectedMethod} className="relative animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
                    {selectedMethod === 'cod'
                      ? `Place Order · ₹${orderTotal.toFixed(2)}`
                      : `Proceed to Pay ₹${orderTotal.toFixed(2)}`}
                  </span>
                  <ChevronRight className="relative w-5 h-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-gray-400">
              By placing the order you agree to our Terms &amp; Conditions
            </p>

            {/* Back link */}
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full py-1.5 disabled:opacity-40 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
              style={{ touchAction: 'manipulation' }}
            >
              Back to Order Review
            </button>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-2.5 border-t border-gray-100">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Lock className="w-3.5 h-3.5 text-green-600" /> 256-bit SSL
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Shield className="w-3.5 h-3.5 text-green-600" /> Secure Payment
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <BadgeCheck className="w-3.5 h-3.5 text-green-600" /> Verified
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Use Portal to render at document.body level
  if (!mounted) return null

  return createPortal(modalContent, document.body)
}
