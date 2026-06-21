"use client"

import { useState, useEffect } from "react"
import { authHeaders } from "@/lib/auth"
import { lineSubtotal } from "@/lib/pricing"
import {
  getGuestCart,
  addToGuestCart,
  updateGuestCartQty,
  removeFromGuestCart,
} from "@/lib/guestStorage"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://seashell-skunk-617240.hostingersite.com/vfs-admin/api"

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

const isLoggedIn = () => !!authHeaders().Authorization

export function useCartData() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [demandProducts, setDemandProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState<number | null>(null)

  // Loads the cart from the right source of truth. Does NOT broadcast — the
  // mutators broadcast, and this listens, so broadcasting here would loop.
  const fetchCart = async () => {
    try {
      if (!isLoggedIn()) {
        setCartItems(getGuestCart().map((i) => ({ ...i, cart_id: i.cart_id ?? i.id })) as CartItem[])
        return
      }
      const response = await fetch(`${API_BASE}/cart.php`, {
        credentials: "include",
        headers: authHeaders(),
      })
      const data = await response.json()
      if (data.status === "success") setCartItems(data.data || [])
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

    // Stay in sync with every other drawer/popup/page.
    const refresh = () => { fetchCart() }
    window.addEventListener("cart-updated", refresh)
    window.addEventListener("guest-cart-updated", refresh)
    return () => {
      window.removeEventListener("cart-updated", refresh)
      window.removeEventListener("guest-cart-updated", refresh)
    }
  }, [])

  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) return removeItem(productId)

    // Optimistic update — instant feedback.
    setCartItems((items) =>
      items.map((item) =>
        item.id === productId
          ? { ...item, quantity: newQuantity, subtotal: lineSubtotal(item.price, newQuantity) }
          : item
      )
    )
    setIsUpdating(productId)

    try {
      if (!isLoggedIn()) {
        updateGuestCartQty(productId, newQuantity) // broadcasts guest-cart-updated
        return
      }
      await fetch(`${API_BASE}/cart.php`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        credentials: "include",
        body: JSON.stringify({ product_id: productId, quantity: newQuantity }),
      })
      await fetchCart()
      window.dispatchEvent(new Event("cart-updated")) // notify other surfaces
    } catch (error) {
      console.error("Error updating quantity:", error)
      await fetchCart()
    } finally {
      setIsUpdating(null)
    }
  }

  const removeItem = async (productId: number) => {
    const itemToRemove = cartItems.find((item) => item.id === productId)
    setCartItems((items) => items.filter((item) => item.id !== productId)) // optimistic
    setIsUpdating(productId)

    try {
      if (!isLoggedIn()) {
        removeFromGuestCart(productId) // broadcasts guest-cart-updated
      } else {
        await fetch(`${API_BASE}/cart.php?product_id=${productId}`, {
          method: "DELETE",
          credentials: "include",
          headers: authHeaders(),
        })
        await fetchCart()
        window.dispatchEvent(new Event("cart-updated"))
      }
      if (itemToRemove) {
        window.dispatchEvent(
          new CustomEvent("celebrate-action", {
            detail: {
              action: "cart-remove",
              product: { name: itemToRemove.name, price: itemToRemove.price, image: itemToRemove.image },
            },
          })
        )
      }
    } catch (error) {
      console.error("Error removing item:", error)
      await fetchCart()
    } finally {
      setIsUpdating(null)
    }
  }

  const addToCart = async (product: Product) => {
    try {
      if (!isLoggedIn()) {
        addToGuestCart(
          {
            id: product.id,
            name: product.name,
            price: product.price_per_kg ?? product.price,
            image: product.image,
            category: product.category,
            stock: product.stock,
          },
          0.25
        )
      } else {
        await fetch(`${API_BASE}/cart.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          credentials: "include",
          body: JSON.stringify({ product_id: product.id, quantity: 0.25 }),
        })
        await fetchCart()
        window.dispatchEvent(new Event("cart-updated"))
      }
      window.dispatchEvent(
        new CustomEvent("celebrate-action", {
          detail: {
            action: "cart-add",
            product: { name: product.name, price: product.price_per_kg, image: product.image },
          },
        })
      )
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
    addToCart,
  }
}
