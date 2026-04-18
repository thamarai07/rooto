"use client"

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CreditCard, Wallet, Banknote, Check, ChevronRight, Shield, Clock, Zap, X, Lock, Smartphone, BadgeCheck } from 'lucide-react'

export type PaymentMethod = 'cod' | 'online'

interface PaymentMethodSelectorProps {
  onPaymentMethodSelect: (method: PaymentMethod) => void
  onClose: () => void
  orderTotal: number
}

export default function PaymentMethodSelector({
  onPaymentMethodSelect,
  onClose,
  orderTotal
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [mounted, setMounted] = useState(false)

  // Portal mounting
  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleConfirm = () => {
    if (selectedMethod) {
      onPaymentMethodSelect(selectedMethod)
    }
  }

  const paymentOptions = [
    {
      id: 'online' as PaymentMethod,
      title: 'Pay Online',
      subtitle: 'UPI, Cards, Net Banking & Wallets',
      icon: CreditCard,
      iconBg: 'bg-blue-600',
      selectedBg: 'bg-blue-50',
      selectedBorder: 'border-blue-500',
      checkColor: 'bg-blue-600',
      features: ['Instant confirmation', 'Multiple options', '100% secure'],
      badge: '',                    // No badge for Online
      badgeColor: ''
    },
    {
      id: 'cod' as PaymentMethod,
      title: 'Cash on Delivery',
      subtitle: 'Pay when your order arrives',
      icon: Banknote,
      iconBg: 'bg-emerald-600',
      selectedBg: 'bg-emerald-50',
      selectedBorder: 'border-emerald-500',
      checkColor: 'bg-emerald-600',
      features: ['Pay at doorstep', 'Inspect before paying', 'No advance required'],
      badge: 'Recommended',         // ← Added Recommended badge
      badgeColor: 'bg-emerald-600'  // Nice green color for recommended
    }
  ]

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center"
      style={{ zIndex: 100000 }}
      onClick={onClose}
    >
      <div 
        className="bg-white w-full sm:max-w-lg sm:rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] sm:max-h-[85vh] flex flex-col rounded-t-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLEAN HEADER */}
        <div className="bg-white border-b border-gray-200 px-5 py-4 sm:px-6 sm:py-5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gray-900 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Payment Method</h2>
                <p className="text-sm text-gray-500">Select how you'd like to pay</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors"
              style={{ touchAction: 'manipulation' }}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Order Total */}
          <div className="mt-4 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Order Total</p>
                <p className="text-2xl font-bold text-gray-900">₹{orderTotal.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Inclusive of taxes</p>
                <p className="text-xs text-green-600 font-medium mt-0.5">Best price guaranteed</p>
              </div>
            </div>
          </div>
        </div>

        {/* PAYMENT OPTIONS */}
        <div 
          className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 space-y-3"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {paymentOptions.map((option) => {
            const Icon = option.icon
            const isSelected = selectedMethod === option.id

            return (
              <button
                key={option.id}
                onClick={() => setSelectedMethod(option.id)}
                className={`w-full text-left rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? `${option.selectedBorder} ${option.selectedBg}`
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-12 h-12 ${option.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-gray-900">{option.title}</h3>
                          {option.badge && (
                            <span className={`${option.badgeColor} text-white text-xs px-2 py-0.5 rounded-full font-medium`}>
                              {option.badge}
                            </span>
                          )}
                        </div>
                        
                        {/* Radio indicator */}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected 
                            ? `${option.checkColor} border-transparent` 
                            : 'border-gray-300 bg-white'
                        }`}>
                          {isSelected && (
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-500 mt-0.5">{option.subtitle}</p>

                      {/* Features */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {option.features.map((feature, idx) => (
                          <span 
                            key={idx} 
                            className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}

          {/* Payment Methods Icons - Only show when online is selected */}
          {selectedMethod === 'online' && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-3">Accepted Payment Methods</p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-700 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>UPI</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-700 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Cards</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-700 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200">
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Wallets</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-700 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  <span>Net Banking</span>
                </div>
              </div>
            </div>
          )}

          {/* COD Note - Only show when COD is selected */}
          {selectedMethod === 'cod' && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Banknote className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Cash on Delivery</p>
                  <p className="text-xs text-amber-700 mt-1">Please keep exact change ready. Our delivery partner may not carry change for large denominations.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="bg-white border-t border-gray-200 px-4 sm:px-6 py-4 flex-shrink-0 space-y-3">
          {/* Main CTA */}
          <button
            onClick={handleConfirm}
            disabled={!selectedMethod}
            className={`w-full py-4 font-semibold text-base rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 ${
              selectedMethod
                ? 'bg-gray-900 hover:bg-gray-800 active:bg-black text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            style={{ touchAction: 'manipulation' }}
          >
            {selectedMethod ? (
              <>
                <span>
                  {selectedMethod === 'cod' 
                    ? 'Place Order (Pay on Delivery)' 
                    : 'Proceed to Pay ₹' + orderTotal.toFixed(2)
                  }
                </span>
                <ChevronRight className="w-4 h-4" />
              </>
            ) : (
              <span>Select a payment method</span>
            )}
          </button>

          {/* Back link */}
          <button
            onClick={onClose}
            className="w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            style={{ touchAction: 'manipulation' }}
          >
            Back to Order Review
          </button>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-4 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Lock className="w-3.5 h-3.5 text-green-600" />
              <span>256-bit SSL</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Shield className="w-3.5 h-3.5 text-green-600" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <BadgeCheck className="w-3.5 h-3.5 text-green-600" />
              <span>Verified</span>
              
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