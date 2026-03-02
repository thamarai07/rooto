"use client"

import { Plus, Minus, Trash2, Loader2 } from 'lucide-react'
import Image from 'next/image'

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
}

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
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
  const tax = subtotal * 0.08
  const shipping = subtotal > 500 ? 0 : 50
  const total = subtotal + tax + shipping

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
                <p className="text-sm text-gray-600">{item.quantity} kg × ₹{item.price.toFixed(2)}</p>
              </div>
              <p className="font-bold text-green-600 whitespace-nowrap">₹{item.subtotal.toFixed(2)}</p>
            </div>
          ))}
        </div>

        {/* Pricing Breakdown */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-semibold">₹{subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Tax (8%)</span><span className="font-semibold">₹{tax.toFixed(2)}</span></div>
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
    <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Order Items</h3>

      {/* Items with edit capabilities */}
      <div className="space-y-4 mb-6 pb-6 border-b-2 border-gray-100">
        {items.map(item => (
          <div key={item.cart_id} className="bg-gray-50 rounded-xl p-4 border-2 border-gray-100 hover:border-green-300 transition-all">
            <div className="flex gap-4">
              {/* Product Image */}
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-green-50 to-emerald-50 ring-2 ring-green-200">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-800 mb-1">{item.name}</h4>
                {item.category && <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">{item.category}</span>}
                <p className="text-green-600 font-semibold text-sm mt-2">₹{item.price.toFixed(2)}/kg</p>
              </div>

              {/* Quantity & Delete */}
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={() => onRemoveItem(item.id)}
                  disabled={isUpdating === item.id}
                  className="p-1 hover:bg-red-100 text-red-500 rounded transition disabled:opacity-50"
                >
                  {isUpdating === item.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                </button>

                {/* Quantity Controls */}
                <div className="flex items-center border-2 border-gray-300 rounded-lg">
                  <button
                    onClick={() => onQuantityChange(item.id, item.quantity - 0.25)}
                    disabled={isUpdating === item.id || item.quantity <= 0.25}
                    className="p-1 hover:bg-gray-200 disabled:opacity-50"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-2 py-1 text-sm font-bold">{item.quantity} kg</span>
                  <button
                    onClick={() => onQuantityChange(item.id, item.quantity + 0.25)}
                    disabled={isUpdating === item.id || item.quantity >= item.stock}
                    className="p-1 hover:bg-gray-200 disabled:opacity-50"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <p className="font-bold text-green-600 text-right">₹{item.subtotal.toFixed(2)}</p>
              </div>
            </div>

            {item.stock < 5 && (
              <p className="text-xs text-orange-600 mt-3 font-bold">⚠️ Only {item.stock} kg left!</p>
            )}
          </div>
        ))}
      </div>

      {/* Pricing Summary */}
      <div className="space-y-3 mb-6 pb-6 border-b-2 border-gray-100">
        <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-semibold">₹{subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between"><span className="text-gray-600">Tax (8%)</span><span className="font-semibold">₹{tax.toFixed(2)}</span></div>
        <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span className="font-semibold">{shipping === 0 ? <span className="text-green-600 font-bold">Free</span> : `₹${shipping.toFixed(2)}`}</span></div>
        {shipping === 0 ? (
          <p className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded">✓ Free shipping applied!</p>
        ) : (
          <p className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">Add ₹{(500 - subtotal).toFixed(2)} more for free shipping</p>
        )}
      </div>

      {/* Total */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-100">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-800">Total Amount</span>
          <span className="text-3xl font-bold text-green-600">₹{total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}