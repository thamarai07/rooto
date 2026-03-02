"use client"

import Link from "next/link"
import { ShoppingCart, TrendingUp, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Product {
  id: number
  name: string
  price: number
  price_per_kg: number
  image: string
  category: string
  stock: number
  description?: string
  total_sold?: number
}

interface EmptyCartProps {
  demandProducts: Product[]
  onAddToCart: (product: Product) => void
}

export default function EmptyCart({ demandProducts, onAddToCart }: EmptyCartProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border-2 border-gray-100">
          <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold mb-3 text-gray-800">Your cart is empty</h2>
          <p className="text-gray-600 mb-8 text-lg">Looks like you haven't added any fruits yet. Check out our fresh products!</p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg">
              Start Shopping
            </Button>
          </Link>
        </div>

        {demandProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-800">Currently in Demand</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {demandProducts.slice(0, 4).map(product => (
                <div key={product.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border-2 border-gray-100 hover:border-green-300 overflow-hidden group">
                  <div className="relative h-48 bg-gradient-to-br from-green-50 to-emerald-50">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    {product.total_sold && product.total_sold > 50 && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        <Star className="w-3 h-3 fill-white" /> Hot
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">{product.category}</span>
                    <h3 className="font-bold text-xl text-gray-800 mt-3 mb-2 group-hover:text-green-600 transition">{product.name}</h3>
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <span className="text-2xl font-bold text-green-600">
                          ₹{Number(product.price_per_kg || product.price || 0).toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">/kg</span>
                      </div>
                      <Button onClick={() => onAddToCart(product)} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-5 py-2 rounded-xl">
                        <ShoppingCart className="w-4 h-4 mr-2" /> Add
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-24 bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Order Summary</h2>
          <div className="text-center py-8 text-gray-500">No items in cart</div>
        </div>
      </div>
    </div>
  )
}