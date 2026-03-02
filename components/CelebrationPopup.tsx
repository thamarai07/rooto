"use client"

import { ShoppingCart, Heart, Check } from "lucide-react"

interface CelebrationPopupProps {
  show: boolean
  action: string
  product: {
    image?: string
    name?: string
    price?: number
  } | null
}

const messages = {
  "cart-add": "Added to Cart!",
  "wishlist-add": "Added to Wishlist!",
  "cart-remove": "Removed from Cart",
  "wishlist-remove": "Removed from Wishlist"
}

export default function CelebrationPopup({ show, action, product }: CelebrationPopupProps) {
  if (!show) return null

  return (
    <div className="fixed top-24 right-6 z-[100] animate-slideInRight">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-green-200 p-4 min-w-[320px] max-w-[400px]">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-green-300">
            <img src={product?.image} alt={product?.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {action?.includes("cart") && <ShoppingCart className="w-5 h-5 text-green-600" />}
              {action?.includes("wishlist") && <Heart className="w-5 h-5 text-red-500 fill-red-500" />}
              <span className="font-bold text-gray-800">{messages[action as keyof typeof messages]}</span>
            </div>
            <p className="text-sm text-gray-600 font-medium line-clamp-1">{product?.name}</p>
            <p className="text-green-600 font-bold text-sm">₹{product?.price?.toFixed(2)}</p>
          </div>
          <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideInRight { animation: slideInRight 0.3s ease-out; }
      `}</style>
    </div>
  )
}