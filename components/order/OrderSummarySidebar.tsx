"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

interface OrderSummarySidebarProps {
  subtotal: number
  tax: number
  shipping: number
  total: number
  onProceedToCheckout: () => void
}

export default function OrderSummarySidebar({
  subtotal,
  tax,
  shipping,
  total,
  onProceedToCheckout
}: OrderSummarySidebarProps) {
  return (
    <div className="sticky top-24 bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
      <h2 className="text-xl font-bold mb-6 text-gray-800">Order Summary</h2>
      
      <div className="space-y-3 mb-6 pb-6 border-b-2 border-gray-100">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Tax (8%)</span>
          <span className="font-semibold">₹{tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="font-semibold">
            {shipping === 0 ? (
              <span className="text-green-600 font-bold">Free</span>
            ) : (
              `₹${shipping.toFixed(2)}`
            )}
          </span>
        </div>
        {shipping === 0 ? (
          <p className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded">
            Free shipping applied!
          </p>
        ) : (
          <p className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
            Add ₹{(500 - subtotal).toFixed(2)} more for free shipping
          </p>
        )}
      </div>

      <div className="flex justify-between items-center mb-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl px-4">
        <span className="text-lg font-bold text-gray-800">Total</span>
        <span className="text-3xl font-bold text-green-600">₹{total.toFixed(2)}</span>
      </div>

      <Button 
        onClick={onProceedToCheckout} 
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-6 text-lg rounded-xl shadow-lg mb-3"
      >
        Proceed to Checkout
      </Button>

      <Button variant="outline" className="w-full py-6 rounded-xl border-2" asChild>
        <Link href="/">Continue Shopping</Link>
      </Button>

      <div className="mt-6 pt-6 border-t-2 border-gray-100 space-y-3 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
          Delivery in 1-2 business days
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
          Fresh produce guaranteed
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
          30-day satisfaction guarantee
        </div>
      </div>
    </div>
  )
}