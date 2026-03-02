"use client"

import { Check } from "lucide-react"

interface OrderSuccessModalProps {
  orderNumber: string
  totalAmount: number
  onClose: () => void
}

export default function OrderSuccessModal({ 
  orderNumber, 
  totalAmount, 
  onClose 
}: OrderSuccessModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center rounded-t-3xl">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Order Confirmed!</h2>
          <p className="text-white/90">Thank you for your order</p>
        </div>

        <div className="p-8">
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <p className="text-sm text-gray-600 mb-1">Order Number</p>
            <p className="text-2xl font-bold text-gray-900">{orderNumber}</p>
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Total Amount</span>
              <span className="text-2xl font-bold text-green-600">₹{totalAmount.toFixed(2)}</span>
            </div>
            <p className="text-xs text-green-700 mt-2">💵 Cash on Delivery</p>
          </div>

          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>Delivery in 1-2 business days</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>You'll receive order updates via SMS</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>Pay cash at your doorstep</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg transition"
          >
            Continue Shopping
          </button>

          <button
            onClick={() => window.location.href = '/orders'}
            className="w-full mt-3 py-3 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 font-semibold transition"
          >
            View My Orders
          </button>
        </div>
      </div>
    </div>
  )
}