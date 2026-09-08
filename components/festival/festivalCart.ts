// components/festival/festivalCart.ts
// ---------------------------------------------------------------------------
// Bridges the festival page to the EXISTING cart system. No new cart, no new
// store — guests go through lib/guestStorage.ts, logged-in users through the
// existing /api/cart.php, and both fire the same `cart-updated` /
// `guest-cart-updated` events the Header + ProductGrid drawer already listen to.
// ---------------------------------------------------------------------------

import {
  getGuestCart,
  addToGuestCart,
  updateGuestCartQty,
  removeFromGuestCart,
} from "@/lib/guestStorage"
import { authHeaders } from "@/lib/auth"
import type { FestivalProduct, FestivalUnit } from "@/lib/festivals.api"

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://seashell-skunk-617240.hostingersite.com/vfs-admin/api"

export interface CartLine {
  productId: number
  quantity: number
  unit: string // 'kg' | 'piece'
}

export const getUserId = (): number | null => {
  try {
    const u = localStorage.getItem("auth_user")
    return u ? JSON.parse(u).id : null
  } catch {
    return null
  }
}

const norm = (u: string) => (u === "piece" || u === "pieces" ? "piece" : "kg")

/** Read the current cart as {productId -> line}. Guest = sync, logged-in = fetch. */
export async function readCart(): Promise<Record<number, CartLine>> {
  const map: Record<number, CartLine> = {}
  if (!getUserId()) {
    for (const i of getGuestCart()) {
      map[Number(i.id)] = {
        productId: Number(i.id),
        quantity: Number(i.quantity) || 0,
        unit: norm((i as any).unit || "kg"),
      }
    }
    return map
  }
  try {
    const res = await fetch(`${API_BASE}/cart.php`, { headers: authHeaders() })
    const data = await res.json()
    if (data.status === "success") {
      for (const i of data.data || data.items || []) {
        map[Number(i.id)] = {
          productId: Number(i.id),
          quantity: Number(i.quantity) || 0,
          unit: norm(i.unit || "kg"),
        }
      }
    }
  } catch {
    /* silent — page falls back to empty */
  }
  return map
}

function pickUnit(product: FestivalProduct, unit: string): FestivalUnit | undefined {
  return product.units.find((u) => u.unit === norm(unit)) || product.units[0]
}

/** Add `quantity` of `unit` for this product to the cart. */
export async function addItem(
  product: FestivalProduct,
  unit: string,
  quantity: number
): Promise<{ ok: boolean; message?: string }> {
  const u = norm(unit)
  const chosen = pickUnit(product, u)
  const price = chosen?.price ?? product.final_price

  if (!getUserId()) {
    // If the same product is already in the guest cart under a different unit,
    // replace it so price + unit stay consistent.
    const existing = getGuestCart().find((i) => Number(i.id) === product.id)
    if (existing && norm((existing as any).unit || "kg") !== u) {
      removeFromGuestCart(product.id)
    }
    addToGuestCart(
      {
        id: product.id,
        name: product.name,
        price,
        image: product.image,
        category: product.category || undefined,
        stock: product.stock,
        slug: product.slug,
        // extra field — spread through by addToGuestCart, ignored by old screens
        ...(u === "piece" ? { unit: "piece" } : { unit: "kg" }),
      } as any,
      quantity
    )
    window.dispatchEvent(
      new CustomEvent("guest-cart-updated", {
        detail: { highlightedProductId: String(product.id) },
      })
    )
    return { ok: true }
  }

  try {
    const res = await fetch(`${API_BASE}/cart.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ product_id: product.id, quantity, unit: u }),
    })
    const data = await res.json()
    if (data.status === "success") {
      window.dispatchEvent(
        new CustomEvent("cart-updated", {
          detail: { highlightedProductId: String(product.id) },
        })
      )
      return { ok: true }
    }
    return { ok: false, message: data.message || "Could not add to cart" }
  } catch {
    return { ok: false, message: "Could not add to cart" }
  }
}

/** Set the absolute quantity for a product already in the cart. qty<=0 removes. */
export async function setItemQuantity(
  product: FestivalProduct,
  unit: string,
  quantity: number
): Promise<void> {
  const u = norm(unit)
  if (quantity <= 0) return removeItem(product.id)

  if (!getUserId()) {
    updateGuestCartQty(product.id, quantity)
    window.dispatchEvent(new Event("guest-cart-updated"))
    return
  }
  try {
    await fetch(`${API_BASE}/cart.php`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ product_id: product.id, quantity, unit: u }),
    })
    window.dispatchEvent(new Event("cart-updated"))
  } catch {
    /* optimistic UI already updated by the caller */
  }
}

export async function removeItem(productId: number): Promise<void> {
  if (!getUserId()) {
    removeFromGuestCart(productId)
    window.dispatchEvent(new Event("guest-cart-updated"))
    return
  }
  try {
    await fetch(`${API_BASE}/cart.php?product_id=${productId}`, {
      method: "DELETE",
      headers: authHeaders(),
    })
    window.dispatchEvent(new Event("cart-updated"))
  } catch {
    /* silent */
  }
}
