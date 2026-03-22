"use client"

import { useState, useEffect } from "react"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://rootoportal.onrender.com/api"


interface CartItem {
  cart_id: number
  id: number
  name: string
  price: number
  image: string
  category?: string
  stock: number
  quantity: number
  subtotal: number
  slug?: string
}

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

export function useCartData() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [demandProducts, setDemandProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState<number | null>(null)

  const fetchCart = async () => {
    try {
      const response = await fetch(`${API_BASE}/cart.php`, {
        credentials: 'include'   // ← ADD
      })
      const data = await response.json()
      if (data.status === "success") {
        setCartItems(data.data)
        window.dispatchEvent(new Event("cart-updated"))
      }
    } catch (error) {
      console.error("Error fetching cart:", error)
    }
  }

  const fetchDemandProducts = async () => {
    try {
      const response = await fetch(`${API_BASE}/get-products_search.php?search=`)
      const data = await response.json()
      if (data.success && data.topSelling) {
        setDemandProducts(data.topSelling)
      }
    } catch (error) {
      console.error("Error fetching demand products:", error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([fetchCart(), fetchDemandProducts()])
      setIsLoading(false)
    }
    loadData()
  }, [])

  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) return removeItem(productId)

    const updatedItems = cartItems.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.price } : item
    )
    setCartItems(updatedItems)
    setIsUpdating(productId)

    try {
      await fetch(`${API_BASE}/cart.php`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ product_id: productId, quantity: newQuantity }),
      })
      await fetchCart()
    } catch (error) {
      console.error("Error updating quantity:", error)
      await fetchCart()
    } finally {
      setIsUpdating(null)
    }
  }

  const removeItem = async (productId: number) => {
    const itemToRemove = cartItems.find(item => item.id === productId)
    const updatedItems = cartItems.filter(item => item.id !== productId)
    setCartItems(updatedItems)
    setIsUpdating(productId)

    try {
      await fetch(`${API_BASE}/cart.php?product_id=${productId}`, { method: "DELETE",credentials: 'include' })
      if (itemToRemove) {
        window.dispatchEvent(new CustomEvent("celebrate-action", {
          detail: {
            action: "cart-remove",
            product: {
              name: itemToRemove.name,
              price: itemToRemove.price,
              image: itemToRemove.image
            }
          }
        }))
      }
      await fetchCart()
    } catch (error) {
      console.error("Error removing item:", error)
      await fetchCart()
    } finally {
      setIsUpdating(null)
    }
  }

  const addToCart = async (product: Product) => {
    try {
      await fetch(`${API_BASE}/cart.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
         credentials: 'include',
        body: JSON.stringify({ product_id: product.id, quantity: 0.25 }),
      })
      await fetchCart()
      window.dispatchEvent(new CustomEvent("celebrate-action", {
        detail: {
          action: "cart-add",
          product: {
            name: product.name,
            price: product.price_per_kg,
            image: product.image
          }
        }
      }))
    } catch (error) {
      console.error("Error adding to cart:", error)
    }
  }

  return {
    cartItems,
    setCartItems,
    demandProducts,
    isLoading,
    isUpdating,
    updateQuantity,
    removeItem,
    addToCart
  }
}