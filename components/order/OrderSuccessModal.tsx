"use client"

import { useEffect, useState } from "react"
import Confetti from "react-confetti"
import Link from "next/link"
import { Check, Copy, CheckCheck, Truck, Bell, Wallet, ShoppingBag, Package, X } from "lucide-react"

interface OrderSuccessModalProps {
  orderNumber: string
  totalAmount: number
  onClose: () => void
  /** Defaults to "cod" to preserve the previous behaviour. */
  paymentMethod?: "cod" | "online"
}

export default function OrderSuccessModal({
  orderNumber,
  totalAmount,
  onClose,
  paymentMethod = "cod",
}: OrderSuccessModalProps) {
  const [copied, setCopied] = useState(false)
  const [size, setSize] = useState({ w: 0, h: 0 })

  // Escape to close + lock background scroll + size the confetti to the viewport.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight })

    onResize()
    document.addEventListener("keydown", onKey)
    window.addEventListener("resize", onResize)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      window.removeEventListener("resize", onResize)
      document.body.style.overflow = ""
    }
  }, [onClose])

  const copyOrder = async () => {
    try {
      await navigator.clipboard.writeText(orderNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard unavailable — ignore */
    }
  }

  const isCod = paymentMethod === "cod"

  const steps = [
    { Icon: Truck, text: "Delivery within 1 hour" },
    { Icon: Bell, text: "You'll get order updates via SMS" },
    { Icon: Package, text: isCod ? "Pay cash at your doorstep" : "Payment received — all set" },
  ]

  return (
    <div
      className="osm-fade fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-success-title"
    >
      {/* One-time celebratory confetti burst */}
      {size.w > 0 && (
        <Confetti
          width={size.w}
          height={size.h}
          numberOfPieces={220}
          recycle={false}
          gravity={0.25}
          tweenDuration={6000}
          colors={["#16a34a", "#22c55e", "#10b981", "#86efac", "#facc15", "#fde68a"]}
          style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 101 }}
        />
      )}

      <div
        className="osm-pop relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/30"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 px-8 pb-10 pt-9 text-center text-white">
          {/* decorative glow */}
          <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -right-8 h-44 w-44 rounded-full bg-emerald-300/20 blur-2xl" />

          {/* Animated success badge */}
          <div className="relative mx-auto mb-4 h-24 w-24">
            <span className="osm-ring absolute inset-0 rounded-full bg-white/40" />
            <span className="absolute inset-0 rounded-full bg-white/15" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-lg">
              <Check className="osm-check h-12 w-12 text-green-600" strokeWidth={3} />
            </div>
          </div>

          <h2 id="order-success-title" className="mb-1 text-3xl font-extrabold tracking-tight">
            Order Confirmed!
          </h2>
          <p className="text-sm text-white/90">Thank you — your order is on its way 🎉</p>
        </div>

        {/* Body */}
        <div className="px-7 py-6">
          {/* Order number + copy */}
          <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl bg-gray-50 px-4 py-3.5">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Order Number</p>
              <p className="truncate text-lg font-bold text-gray-900">{orderNumber}</p>
            </div>
            <button
              onClick={copyOrder}
              className="flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-100"
            >
              {copied ? (
                <>
                  <CheckCheck className="h-4 w-4" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Copy
                </>
              )}
            </button>
          </div>

          {/* Total */}
          <div className="mb-5 flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 px-4 py-4">
            <div>
              <p className="text-xs text-gray-500">Total {isCod ? "Payable" : "Paid"}</p>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                <Wallet className="h-3 w-3" /> {isCod ? "Cash on Delivery" : "Paid Online"}
              </span>
            </div>
            <span className="text-2xl font-extrabold text-green-600">₹{totalAmount.toFixed(2)}</span>
          </div>

          {/* Timeline */}
          <div className="mb-6 space-y-3">
            {steps.map(({ Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-50">
                  <Icon className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm text-gray-700">{text}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <button
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 py-3.5 font-bold text-white shadow-lg shadow-green-600/20 transition hover:from-green-600 hover:to-emerald-700"
          >
            <ShoppingBag className="h-4 w-4" /> Continue Shopping
          </button>
          <Link
            href="/orders"
            onClick={onClose}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-gray-200 py-3.5 font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
          >
            View My Orders
          </Link>
        </div>
      </div>

      {/* Scoped-but-global keyframes so Tailwind arbitrary names aren't renamed by styled-jsx */}
      <style jsx global>{`
        @keyframes osm-fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes osm-popIn {
          0% { opacity: 0; transform: translateY(16px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes osm-ringPulse {
          0% { transform: scale(0.85); opacity: 0.7; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        @keyframes osm-checkPop {
          0% { transform: scale(0) rotate(-25deg); opacity: 0; }
          60% { transform: scale(1.15) rotate(0); opacity: 1; }
          100% { transform: scale(1) rotate(0); }
        }
        .osm-fade { animation: osm-fadeIn 0.2s ease-out; }
        .osm-pop { animation: osm-popIn 0.35s cubic-bezier(0.2, 0.9, 0.3, 1.2); }
        .osm-ring { animation: osm-ringPulse 1.5s ease-out infinite; }
        .osm-check { animation: osm-checkPop 0.45s ease-out 0.15s both; }
        @media (prefers-reduced-motion: reduce) {
          .osm-fade, .osm-pop, .osm-ring, .osm-check { animation: none; }
        }
      `}</style>
    </div>
  )
}
