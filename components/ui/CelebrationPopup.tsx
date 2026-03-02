"use client"

import { useState, useEffect } from "react"
import { X, Heart, ShoppingCart, Check, ChevronRight } from "lucide-react"
import Link from "next/link"

interface PopupData {
  action: "wishlist-add" | "wishlist-remove" | "cart-add" | "cart-remove"
  product: {
    id: number
    name: string
    price: number
    image: string
  }
}

export default function CelebrationPopup() {
  const [show, setShow] = useState(false)
  const [data, setData] = useState<PopupData | null>(null)

  /* --------------------------------------------------------------
     Listen to the global celebrate-action event
     -------------------------------------------------------------- */
  useEffect(() => {
    const handleCelebration = (e: any) => {
      const { action, product } = e.detail
      setData({ action, product })
      setShow(true)               // show the drawer
      // **No setTimeout** – panel stays until user closes it
    }

    window.addEventListener("celebrate-action", handleCelebration as EventListener)
    return () => window.removeEventListener("celebrate-action", handleCelebration as EventListener)
  }, [])

  /* --------------------------------------------------------------
     Hide when the user clicks X or the backdrop
     -------------------------------------------------------------- */
  const closeDrawer = () => setShow(false)

  if (!show || !data) return null

  const { action, product } = data
  const isAddAction = action.includes("add")
  const isCartAction = action.includes("cart")

  const messages = {
    "wishlist-add": { text: "Added to Wishlist", icon: <Heart className="w-6 h-6 fill-red-500 text-red-500" /> },
    "wishlist-remove": { text: "Removed from Wishlist", icon: <Heart className="w-6 h-6 text-gray-400" /> },
    "cart-add": { text: "Added to Cart", icon: <ShoppingCart className="w-6 h-6 fill-green-600 text-green-600" /> },
    "cart-remove": { text: "Removed from Cart", icon: <ShoppingCart className="w-6 h-6 text-gray-400" /> },
  }

  const msg = messages[action]
  const viewHref = isCartAction ? "/cart" : "/wishlist"
  const viewText = isCartAction ? "View Cart" : "View Wishlist"

  return (
    <>
      {/* Backdrop – click to close */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Sliding drawer */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
        style={{ animation: "slideInRight 0.4s ease-out" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h2 id="drawer-title" className="text-lg font-bold text-gray-900">
            Action Complete
          </h2>
          <button
            onClick={closeDrawer}
            className="p-2 rounded-full hover:bg-gray-100 transition"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-5 space-y-5 overflow-y-auto">
          {/* Success checkmark (only for add actions) */}
          {isAddAction && (
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-10 h-10 text-green-600" />
              </div>
            </div>
          )}

          {/* Action message */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {msg.icon}
              <p className="text-xl font-bold text-gray-800">{msg.text}</p>
            </div>
            <p className="text-sm text-gray-600">
              {isAddAction ? "Successfully updated!" : "Item has been updated."}
            </p>
          </div>

          {/* Product preview */}
          <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
            <img
              src={product.image}
              alt={product.name}
              className="w-20 h-20 rounded-lg object-cover border border-gray-200"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{product.name}</p>
              <p className="text-lg font-bold text-green-600">₹{product.price}/kg</p>
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="p-5 border-t space-y-3">
          <Link
            href={viewHref}
            onClick={closeDrawer}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
          >
            {viewText}
            <ChevronRight className="w-5 h-5" />
          </Link>

          <button
            onClick={closeDrawer}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  )
}