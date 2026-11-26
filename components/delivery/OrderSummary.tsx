"use client"

import { Plus, Minus, Trash2, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { cartTotals, taxLabel } from '@/lib/pricing'
import { useTaxRate } from '@/hooks/useTaxRate'

interface OrderItem {
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

// Piece items step by 1; everything else keeps the 0.25 kg step.
const uStep = (i: { unit?: string }) => (i.unit === "piece" ? 1 : 0.25)
const uLabel = (i: { unit?: string; unit_label?: string }) =>
  i.unit_label || (i.unit === "piece" ? "Piece" : "kg")
const uQty = (q: number, i: { unit?: string }) =>
  i.unit === "piece" ? String(Math.round(q)) : q

interface OrderSummaryProps {
  items: OrderItem[]
  isUpdating?: number | null
  onQuantityChange: (productId: number, newQuantity: number) => void
  onRemoveItem: (productId: number) => void
  compact?: boolean // For condensed view in checkout
}

export default function OrderSummary({
  items,
  isUpdating = null,
  onQuantityChange,
  onRemoveItem,
  compact = false
}: OrderSummaryProps) {
  const taxRatePercent = useTaxRate()
  const { subtotal, tax, shipping, total } = cartTotals(items, taxRatePercent)

  if (compact) {
    return (
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h3>
        
        {/* Items List - Compact */}
        <div className="space-y-3 mb-6 pb-6 border-b-2 border-gray-100 max-h-96 overflow-y-auto">
          {items.map(item => (
            <div key={item.cart_id} className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 line-clamp-1">{item.name}</p>
                <p className="text-sm text-gray-600">{uQty(item.quantity, item)} {uLabel(item)} × ₹{item.price.toFixed(2)}</p>
              </div>
              <p className="font-bold text-green-600 whitespace-nowrap">₹{item.subtotal.toFixed(2)}</p>
            </div>
          ))}
        </div>

        {/* Pricing Breakdown */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-semibold">₹{subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">{taxLabel(taxRatePercent)}</span><span className="font-semibold">₹{tax.toFixed(2)}</span></div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span className="font-semibold">{shipping === 0 ? <span className="text-green-600">Free</span> : `₹${shipping.toFixed(2)}`}</span>
          </div>
        </div>

        {/* Total */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-4 border-2 border-green-100">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">Total</span>
            <span className="text-2xl font-bold text-green-600">₹{total.toFixed(2)}</span>
          </div>
        </div>

        {shipping > 0 && (
          <p className="text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
            🎉 Add ₹{(500 - subtotal).toFixed(2)} more for free shipping
          </p>
        )}
      </div>
    )
  }

  // Full detailed view
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 sm:p-6">
      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Order Items</h3>

      {/* Items with edit capabilities */}
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.cart_id} className="bg-gray-50 rounded-xl p-3 sm:p-4 border-2 border-gray-100 hover:border-green-300 transition-all">
            <div className="flex gap-3 sm:gap-4">
              {/* Product Image */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-green-50 to-emerald-50 ring-2 ring-green-200">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                {/* Name & Delete */}
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-gray-800 leading-snug break-words min-w-0">{item.name}</h4>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    disabled={isUpdating === item.id}
                    aria-label="Remove item"
                    className="p-1 -mt-0.5 flex-shrink-0 hover:bg-red-100 text-red-500 rounded transition disabled:opacity-50"
                  >
                    {isUpdating === item.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                  </button>
                </div>

                {/* Category & Unit price */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                  {item.category && <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{item.category}</span>}
                  <span className="text-green-600 font-semibold text-sm">₹{item.price.toFixed(2)}/{uLabel(item)}</span>
                </div>

                {/* Quantity & Line total */}
                <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                  <div className="flex items-center flex-shrink-0 border-2 border-gray-300 rounded-lg bg-white">
                    <button
                      onClick={() => onQuantityChange(item.id, item.quantity - uStep(item))}
                      disabled={isUpdating === item.id || item.quantity <= uStep(item)}
                      aria-label="Decrease quantity"
                      className="p-1.5 hover:bg-gray-200 rounded-l-md disabled:opacity-50"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2 py-1 text-sm font-bold whitespace-nowrap">{uQty(item.quantity, item)} {uLabel(item)}</span>
                    <button
                      onClick={() => onQuantityChange(item.id, item.quantity + uStep(item))}
                      disabled={isUpdating === item.id || item.quantity >= item.stock}
                      aria-label="Increase quantity"
                      className="p-1.5 hover:bg-gray-200 rounded-r-md disabled:opacity-50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="font-bold text-green-600 whitespace-nowrap">₹{item.subtotal.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {item.stock < 5 && (
              <p className="text-xs text-orange-600 mt-3 font-bold">⚠️ Only {item.stock} {uLabel(item)} left!</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}