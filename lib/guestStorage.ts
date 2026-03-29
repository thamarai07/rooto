// ─── Types ───────────────────────────────────────────────
export interface GuestCartItem {
    id: number
    name: string
    price: number
    image: string
    category?: string
    stock: number
    quantity: number
    subtotal: number
    slug?: string
    cart_id?: number   // use id as cart_id for guest items
  }
  
  export interface GuestWishlistItem {
    id: number
    name: string
    price: number
    image: string
    category?: string
    slug?: string
  }
  
  // ─── Cart ─────────────────────────────────────────────────
  export const getGuestCart = (): GuestCartItem[] => {
    try {
      return JSON.parse(localStorage.getItem("guest_cart") || "[]")
    } catch { return [] }
  }
  
  export const saveGuestCart = (items: GuestCartItem[]) => {
    localStorage.setItem("guest_cart", JSON.stringify(items))
    window.dispatchEvent(new Event("guest-cart-updated"))
  }
  
  export const addToGuestCart = (product: Omit<GuestCartItem, "quantity" | "subtotal">, qty = 0.25) => {
    const cart = getGuestCart()
    const existing = cart.find(i => i.id === product.id)
    if (existing) {
      existing.quantity = parseFloat((existing.quantity + qty).toFixed(2))
      existing.subtotal = parseFloat((existing.quantity * existing.price).toFixed(2))
    } else {
      cart.unshift({ ...product, cart_id: product.id, quantity: qty, subtotal: parseFloat((qty * product.price).toFixed(2)) })
    }
    saveGuestCart(cart)
  }
  
  export const updateGuestCartQty = (productId: number, quantity: number) => {
    const cart = getGuestCart().map(i =>
      i.id === productId
        ? { ...i, quantity, subtotal: parseFloat((quantity * i.price).toFixed(2)) }
        : i
    )
    saveGuestCart(cart)
  }
  
  export const removeFromGuestCart = (productId: number) => {
    saveGuestCart(getGuestCart().filter(i => i.id !== productId))
  }
  
  export const clearGuestCart = () => {
    localStorage.removeItem("guest_cart")
    window.dispatchEvent(new Event("guest-cart-updated"))
  }
  
  // ─── Wishlist ──────────────────────────────────────────────
  export const getGuestWishlist = (): GuestWishlistItem[] => {
    try {
      return JSON.parse(localStorage.getItem("guest_wishlist") || "[]")
    } catch { return [] }
  }
  
  export const saveGuestWishlist = (items: GuestWishlistItem[]) => {
    localStorage.setItem("guest_wishlist", JSON.stringify(items))
    window.dispatchEvent(new Event("guest-wishlist-updated"))
  }
  
  export const toggleGuestWishlist = (product: GuestWishlistItem): "added" | "removed" => {
    const list = getGuestWishlist()
    const idx = list.findIndex(i => i.id === product.id)
    if (idx > -1) {
      list.splice(idx, 1)
      saveGuestWishlist(list)
      return "removed"
    } else {
      list.unshift(product)
      saveGuestWishlist(list)
      return "added"
    }
  }


  
  
  export const isInGuestWishlist = (productId: number): boolean =>
    getGuestWishlist().some(i => i.id === productId)


  