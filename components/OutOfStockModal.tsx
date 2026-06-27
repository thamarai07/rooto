"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { AlertTriangle, X, ArrowRight } from "lucide-react"

export interface OOSItem {
  id: number | string
  name: string
  image?: string
}

export default function OutOfStockModal({
  items,
  onRemoveAndContinue,
  onClose,
}: {
  items: OOSItem[]
  onRemoveAndContinue: () => void
  onClose: () => void
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])
  if (!mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[10060] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-amber-50 px-5 py-4 flex items-center gap-3 border-b border-amber-100">
          <span className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </span>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">Some items are out of stock</h3>
            <p className="text-xs text-gray-500">They can't be delivered right now</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-amber-100 flex items-center justify-center">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <p className="text-sm text-gray-600 mb-3">
            These items just went out of stock. Remove them to continue — the rest of your order will be delivered as usual.
          </p>
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {items.map((it) => (
              <li key={it.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-2.5">
                <img
                  src={it.image}
                  alt={it.name}
                  className="w-11 h-11 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                  onError={(e) => { e.currentTarget.src = "https://placehold.co/44x44/f3f4f6/9ca3af?text=%20" }}
                />
                <span className="text-sm font-medium text-gray-800 line-clamp-1">{it.name}</span>
                <span className="ml-auto text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex-shrink-0">
                  Out of stock
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 flex flex-col gap-2">
          <button
            onClick={onRemoveAndContinue}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-2xl transition"
          >
            Remove {items.length} item{items.length > 1 ? "s" : ""} &amp; continue
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="w-full text-sm text-gray-500 hover:text-gray-700 py-2 transition"
          >
            Keep shopping
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
