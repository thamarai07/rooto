"use client"

import { useState, useEffect, useCallback } from 'react'
import { Copy, Check, MapPin, Home, Briefcase, Star, Phone, Mail, X, ArrowRight, Truck, ChevronLeft } from 'lucide-react'

// Flexible interface to accept both formats
interface SuccessViewAddress {
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

interface SuccessViewProps {
  address: SuccessViewAddress
  onClose: () => void
  onContinueShopping?: () => void
  onBack?: () => void
}

const CLOSE_ANIMATION_MS = 200

const LABELS = {
  Home: { icon: Home, chip: 'bg-blue-50 text-blue-700 border-blue-200', iconBg: 'from-blue-500 to-indigo-600' },
  Work: { icon: Briefcase, chip: 'bg-purple-50 text-purple-700 border-purple-200', iconBg: 'from-purple-500 to-fuchsia-600' },
  Other: { icon: Star, chip: 'bg-amber-50 text-amber-700 border-amber-200', iconBg: 'from-amber-500 to-orange-600' },
} as const

// Little dots that burst out of the success tick: [x offset, y offset, colour]
const BURST: [number, number, string][] = [
  [-46, -30, 'bg-yellow-300'], [46, -30, 'bg-white'], [-56, 8, 'bg-white'],
  [56, 8, 'bg-yellow-300'], [-32, 42, 'bg-emerald-200'], [32, 42, 'bg-white'],
  [0, -54, 'bg-emerald-200'],
]

export default function SuccessView({ address, onClose, onContinueShopping, onBack }: SuccessViewProps) {
  const [copied, setCopied] = useState(false)
  const [closing, setClosing] = useState(false)

  const labelStyle = LABELS[address.label] ?? { icon: MapPin, chip: 'bg-gray-50 text-gray-700 border-gray-200', iconBg: 'from-gray-500 to-gray-700' }
  const LabelIcon = labelStyle.icon

  // Play the exit animation before running the parent's callback.
  const closeThen = useCallback((fn: () => void) => {
    if (closing) return
    setClosing(true)
    setTimeout(fn, CLOSE_ANIMATION_MS)
  }, [closing])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeThen(onClose) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeThen, onClose])

  const handleCopyAddress = async () => {
    const addressText = `
Name: ${address.name}
Phone: ${address.phoneNumber}
Email: ${address.email}
Address: ${address.flatNo}${address.landmark ? `, ${address.landmark}` : ''}
${address.fullAddress}
Label: ${address.label}
    `.trim()

    try {
      await navigator.clipboard.writeText(addressText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable — ignore */
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="address-success-title">
      {/* Backdrop */}
      <div
        onClick={() => closeThen(onClose)}
        className={`absolute inset-0 bg-gray-950/50 backdrop-blur-sm duration-200 ${closing ? 'animate-out fade-out-0 fill-mode-forwards' : 'animate-in fade-in-0'}`}
      />

      <div
        className={`relative w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[100dvh] sm:max-h-[calc(100dvh-3rem)] overflow-y-auto flex flex-col sm:flex-row ${closing
          ? 'animate-out fade-out-0 slide-out-to-bottom-10 sm:zoom-out-95 duration-200 fill-mode-forwards'
          : 'animate-in fade-in-0 slide-in-from-bottom-16 sm:slide-in-from-bottom-4 sm:zoom-in-95 duration-300 ease-out'}`}
      >
        {/* Success header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 px-6 pt-6 pb-5 sm:py-8 sm:w-[38%] sm:flex-shrink-0 sm:flex sm:flex-col sm:items-center sm:justify-center text-center text-white">
          <span aria-hidden className="absolute -top-12 -left-10 w-40 h-40 rounded-full bg-white/10" />
          <span aria-hidden className="absolute -bottom-16 -right-10 w-44 h-44 rounded-full bg-white/10" />

          {onBack && (
            <button
              onClick={() => closeThen(onBack)}
              aria-label="Back"
              className="absolute top-3 left-3 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => closeThen(onClose)}
            aria-label="Close"
            className="absolute top-3 right-3 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/15 hover:rotate-90 transition-all duration-300 sm:hidden"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Animated tick */}
          <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20">
            {BURST.map(([tx, ty, color], i) => (
              <span
                key={i}
                aria-hidden
                className={`absolute left-1/2 top-1/2 -ml-1 -mt-1 w-2 h-2 rounded-full ${color} rooto-burst`}
                style={{ '--tx': `${tx}px`, '--ty': `${ty}px` } as React.CSSProperties}
              />
            ))}
            <span aria-hidden className="absolute inset-0 rounded-full bg-white/25 rooto-ring" />
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white shadow-xl shadow-emerald-900/20 flex items-center justify-center rooto-pop">
              <svg viewBox="0 0 24 24" className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7.5" className="rooto-draw" />
              </svg>
            </div>
          </div>

          <h2 id="address-success-title" className="relative mt-3 sm:mt-4 text-xl font-bold animate-in fade-in-0 slide-in-from-bottom-2 duration-500 fill-mode-both" style={{ animationDelay: '250ms' }}>
            {address.id ? 'Address Selected!' : 'Address Saved!'}
          </h2>
          <p className="relative mt-1 text-sm text-white/90 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 fill-mode-both" style={{ animationDelay: '350ms' }}>
            We'll deliver your order here
          </p>
        </div>

        <div className="relative flex-1 min-w-0 p-5 sm:p-6 sm:pt-12 space-y-3.5">
          {/* Close (desktop) */}
          <button
            onClick={() => closeThen(onClose)}
            aria-label="Close"
            className="hidden sm:flex absolute top-2.5 right-2.5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 hover:rotate-90 transition-all duration-300"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Address card */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 animate-in fade-in-0 slide-in-from-bottom-3 duration-500 fill-mode-both" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center gap-3 sm:pr-8">
              <span className={`w-11 h-11 rounded-xl bg-gradient-to-br ${labelStyle.iconBg} text-white shadow-md flex items-center justify-center flex-shrink-0`}>
                <LabelIcon className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 truncate">{address.name}</p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${labelStyle.chip}`}>{address.label}</span>
                  {address.isDefault && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">★ Default</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-3.5 space-y-2 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700 leading-snug">
                  <span className="font-semibold">{address.flatNo}</span>
                  {address.landmark && <span>, {address.landmark}</span>}
                  <span className="block text-gray-500 text-xs mt-0.5">{address.fullAddress}</span>
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-gray-700 font-medium">{address.phoneNumber}</span>
              </div>
              {address.email && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="text-gray-700 break-all">{address.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Delivery note */}
          <div className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-xs text-green-800 animate-in fade-in-0 duration-500 fill-mode-both" style={{ animationDelay: '500ms' }}>
            <Truck className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span><span className="font-semibold">Delivery in 1–2 days</span> · 9 AM – 6 PM</span>
          </div>

          {/* Actions */}
          <div className="space-y-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 fill-mode-both" style={{ animationDelay: '550ms' }}>
            <button
              onClick={() => (onContinueShopping ? closeThen(onContinueShopping) : closeThen(onClose))}
              className="group relative overflow-hidden w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-green-600/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              <span aria-hidden className="absolute inset-y-0 left-0 w-1/3 bg-white/25 rooto-shine" />
              <span className="relative">{onContinueShopping ? 'Continue to Checkout' : 'Done'}</span>
              <ArrowRight className="relative w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={handleCopyAddress}
              className={`w-full py-2.5 rounded-2xl border text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors duration-300 ${copied
                ? 'border-green-300 bg-green-50 text-green-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}
            >
              {copied ? (
                <><Check className="w-4 h-4 animate-in zoom-in-50 duration-200" /> Copied!</>
              ) : (
                <><Copy className="w-4 h-4" /> Copy address</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
