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
  
  // Compare ids numerically — ids can arrive as strings ("6") or numbers (6)
  // depending on which surface saved the cart; strict === would silently miss.
  const sameId = (a: number | string, b: number | string) => Number(a) === Number(b)

  export const addToGuestCart = (product: Omit<GuestCartItem, "quantity" | "subtotal">, qty = 0.25) => {
    const cart = getGuestCart()
    const existing = cart.find(i => sameId(i.id, product.id))
    if (existing) {
      existing.quantity = parseFloat((Number(existing.quantity) + qty).toFixed(2))
      existing.price = Number(existing.price) || 0
      existing.subtotal = parseFloat((existing.quantity * existing.price).toFixed(2))
    } else {
      cart.unshift({ ...product, id: Number(product.id), cart_id: Number(product.id), price: Number(product.price) || 0, quantity: qty, subtotal: parseFloat((qty * (Number(product.price) || 0)).toFixed(2)) })
    }
    saveGuestCart(cart)
  }

  export const updateGuestCartQty = (productId: number | string, quantity: number) => {
    const cart = getGuestCart().map(i =>
      sameId(i.id, productId)
        ? { ...i, id: Number(i.id), quantity, subtotal: parseFloat((quantity * (Number(i.price) || 0)).toFixed(2)) }
        : i
    )
    saveGuestCart(cart)
  }

  export const removeFromGuestCart = (productId: number | string) => {
    saveGuestCart(getGuestCart().filter(i => !sameId(i.id, productId)))
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


  