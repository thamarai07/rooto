"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  Heart, ShoppingCart, ArrowLeft, Plus, Minus, Truck, Leaf,
  Star, Package, Award, X, Loader2, Trash2, User, LogIn, ArrowRight,
  ShoppingBag, Shield, Clock, CheckCircle, ChevronRight, BadgeCheck
} from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LoginModal from "@/components/auth/LoginModal";
import SignupModal from "@/components/auth/SignupModal";
import DeliveryModal from "@/components/delivery/DeliveryModal";
import CheckoutSuccessView from "@/components/delivery/CheckoutSuccessView";
import { UserData, SavedAddress } from "@/components/types";
import { authHeaders, getToken } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import { cartTotals, unitPrice, lineSubtotal } from "@/lib/pricing";
import OutOfStockModal from "@/components/OutOfStockModal";
// existing imports-க்கு கீழே add பண்ணு
import {
  getGuestCart,
  addToGuestCart,
  toggleGuestWishlist,
  isInGuestWishlist,
  updateGuestCartQty,
  removeFromGuestCart,
} from "@/lib/guestStorage"


const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE || `${process.env.NEXT_PUBLIC_API_BASE?.replace('/api', '') || 'https://seashell-skunk-617240.hostingersite.com/vfs-admin'}/assets/images/uploads`;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://seashell-skunk-617240.hostingersite.com/vfs-admin/api";

interface Product {
  id: number;
  name: string;
  slug: string;
  category: string;
  price_per_kg: number;
  discount_percent: number;
  unit: string;
  min_quantity: number;
  max_quantity?: number;
  stock: number;
  image: string;
  description?: string;
  is_featured?: number;
  final_price?: number;
  rating?: number;
  review_count?: number;
}

interface CartItem {
  cart_id: number;
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  subtotal: any;
  slug?: string;
  category?: string;
  stock: number;
}

interface ClientProductPageProps {
  initialProduct: Product;
  relatedProducts: any[];
}

// ============================================
// TOAST COMPONENT - Clean & Minimal
// ============================================
function Toast({ show, message, type }: { show: boolean; message: string; type: 'success' | 'error' | 'info' }) {
  if (!show) return null;

  const styles = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-gray-800'
  };

  return (
    <div className="fixed top-20 right-4 z-[100000] animate-slideIn">
      <div className={`${styles[type]} px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2`}>
        {type === 'success' && <CheckCircle className="w-4 h-4" />}
        {type === 'error' && <X className="w-4 h-4" />}
        {type === 'info' && <Package className="w-4 h-4" />}
        <span>{message}</span>
      </div>
    </div>
  );
}

// ============================================
// CART DRAWER COMPONENT - Professional Design
// ============================================
function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  isLoggedIn = false,
  onCheckoutClick,
  onLoginClick
}: {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: number, qty: number) => void;
  onRemoveItem: (id: number) => void;
  isLoggedIn: boolean;
  onCheckoutClick: () => void;
  onLoginClick: (mode: 'login' | 'signup') => void;
}) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  const { subtotal, tax, shipping, total } = cartTotals(cartItems);
  const totalWeight = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleRemove = async (id: number) => {
    setDeletingId(id);
    await onRemoveItem(id);
    setDeletingId(null);
  };

  if (!isOpen || !mounted) return null;

  const itemCount = cartItems.length;
  const progressPct = Math.min((subtotal / 500) * 100, 100);

  const drawerContent = (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity z-[10001]"
        onClick={onClose}
      />

      {/* Drawer — full screen on mobile, side sheet on desktop */}
      <div
        className="fixed right-0 top-0 h-full w-full sm:max-w-md bg-gray-50 shadow-2xl z-[10002] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white px-4 py-3.5 flex items-center justify-between flex-shrink-0 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 transition sm:hidden">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h3 className="font-bold text-lg text-gray-900 leading-tight">My Cart</h3>
              <p className="text-xs text-gray-500">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} · {totalWeight.toFixed(2)} kg
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {cartItems.length === 0 ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 bg-green-50 rounded-3xl flex items-center justify-center mb-6">
              <ShoppingCart className="w-12 h-12 text-green-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">Add some fresh products to get started</p>
            <button
              onClick={onClose}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2"
            >
              Continue Shopping
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Free-delivery progress — pinned under header */}
            <div className="bg-white px-4 py-2.5 flex-shrink-0 border-b border-gray-100">
              {shipping === 0 ? (
                <p className="flex items-center gap-2 text-sm font-medium text-green-700">
                  <Truck className="w-4 h-4 flex-shrink-0" /> Yay! You've unlocked FREE delivery 🎉
                </p>
              ) : (
                <>
                  <p className="text-xs text-gray-600 mb-1.5">
                    Add <span className="font-bold text-gray-900">₹{(500 - subtotal).toFixed(2)}</span> more for{' '}
                    <span className="font-semibold text-green-600">FREE delivery</span>
                  </p>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                  </div>
                </>
              )}
            </div>

            {/* Items + bill (scrolls) */}
            <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="p-3 space-y-2">
                {cartItems.map((item) => (
                  <div
                    key={item.cart_id}
                    data-product-id={item.id}
                    className="bg-white rounded-2xl p-3 flex gap-3 items-center"
                  >
                    <Link
                      href={`/product/${encodeURIComponent(item.slug || item.name)}`}
                      onClick={onClose}
                      className="flex-shrink-0"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover bg-gray-100"
                        onError={(e) => {
                          e.currentTarget.src = "https://placehold.co/80x80/f3f4f6/9ca3af?text=No+Image";
                        }}
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${encodeURIComponent(item.slug || item.name)}`}
                        onClick={onClose}
                        className="font-medium text-gray-900 text-sm line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">₹{item.price.toFixed(2)} / kg</p>
                      <p className="text-sm font-bold text-gray-900 mt-1">
                        ₹{(item.subtotal || item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Right: remove + green stepper */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={deletingId === item.id}
                        className="p-1 text-gray-300 hover:text-red-500 transition"
                        aria-label="Remove"
                      >
                        {deletingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                      <div className="flex items-center bg-green-600 rounded-lg text-white shadow-sm">
                        <button
                          onClick={() => onUpdateQuantity(item.id, Math.max(0.25, item.quantity - 0.25))}
                          disabled={deletingId === item.id}
                          className="w-8 h-8 flex items-center justify-center active:bg-green-700 rounded-l-lg"
                          aria-label="Decrease"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-1 min-w-[52px] text-center text-xs font-semibold">{item.quantity.toFixed(2)} kg</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 0.25)}
                          disabled={deletingId === item.id}
                          className="w-8 h-8 flex items-center justify-center active:bg-green-700 rounded-r-lg"
                          aria-label="Increase"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Bill details */}
                <div className="bg-white rounded-2xl p-4 !mt-3">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">Bill Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Item total</span>
                      <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tax (8%)</span>
                      <span className="font-medium text-gray-900">₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Delivery</span>
                      <span className={shipping === 0 ? "text-green-600 font-semibold" : "font-medium text-gray-900"}>
                        {shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2.5 mt-1 border-t border-dashed border-gray-200">
                      <span className="font-bold text-gray-900">To Pay</span>
                      <span className="text-lg font-extrabold text-gray-900">₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky CTA — single dominant action */}
            <div
              className="bg-white border-t border-gray-100 p-3 flex-shrink-0"
              style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
            >
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => { onClose(); onCheckoutClick(); }}
                    className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white py-3.5 px-5 rounded-2xl font-bold transition-colors flex items-center justify-between"
                  >
                    <span>Proceed to Checkout</span>
                    <span className="flex items-center gap-1">₹{total.toFixed(2)} <ChevronRight className="w-5 h-5" /></span>
                  </button>
                  <Link href="/cart" onClick={onClose} className="block text-center text-sm text-gray-500 hover:text-gray-700 mt-2.5 transition">
                    View full cart
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { onClose(); onLoginClick('login'); }}
                    className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white py-3.5 px-5 rounded-2xl font-bold transition-colors flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2"><LogIn className="w-5 h-5" /> Login to Checkout</span>
                    <span>₹{total.toFixed(2)}</span>
                  </button>
                  <p className="text-center text-sm text-gray-500 mt-2.5">
                    New to Rooto?{' '}
                    <button onClick={() => { onClose(); onLoginClick('signup'); }} className="text-green-600 font-semibold hover:underline">
                      Create account
                    </button>
                  </p>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );

  return createPortal(drawerContent, document.body);
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function ClientProductPage({ initialProduct, relatedProducts }: ClientProductPageProps) {
  if (!initialProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-900 text-xl font-semibold mb-2">Product not found</p>
          <p className="text-gray-500 mb-6">The product you're looking for doesn't exist</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const [quantity, setQuantity] = useState(initialProduct.min_quantity || 0.25);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState<'success' | 'error' | 'info'>('success');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const [user, setUser] = useState<UserData | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryView, setDeliveryView] = useState<'saved' | 'map' | 'form' | 'success'>('saved');
  const [savedAddress, setSavedAddress] = useState<SavedAddress | null>(null);
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [showOOS, setShowOOS] = useState(false);

  // Mirror the global auth context so this page never thinks a logged-in user
  // is a guest (which silently routed Add-to-Cart into the guest localStorage
  // cart instead of the server cart).
  const { user: authUser } = useAuth();
  useEffect(() => {
    setUser(authUser ?? null);
    setIsLoggedIn(!!authUser);
  }, [authUser]);

  const product = initialProduct;

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification(msg);
    setNotificationType(type);
    setTimeout(() => setNotification(""), 3000);
  };

  // Load user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("auth_user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch (e) {
        localStorage.removeItem("auth_user");
        setUser(null);
        setIsLoggedIn(false);
      }
    }

    const handleUserUpdate = () => {
      const updatedUser = localStorage.getItem("auth_user");
      if (updatedUser) {
        try {
          const parsedUser = JSON.parse(updatedUser);
          setUser(parsedUser);
          setIsLoggedIn(true);
        } catch (e) {
          setUser(null);
          setIsLoggedIn(false);
        }
      } else {
        setUser(null);
        setIsLoggedIn(false);
        setCartItems([]);
      }
    };

    window.addEventListener("user-updated", handleUserUpdate);
    return () => window.removeEventListener("user-updated", handleUserUpdate);
  }, []);

  const outOfStockItems = cartItems.filter((i) => Number(i.stock) <= 0);
  const handleCheckoutClick = () => {
    if (!user || !isLoggedIn) {
      setAuthMode("login");
      setShowAuth(true);
      return;
    }
    if (outOfStockItems.length > 0) {
      setShowOOS(true);  // block + re-check before checkout
      return;
    }
    setShowDeliveryModal(true);
    setDeliveryView('saved');
  };

  const handleRemoveOOSAndContinue = async () => {
    for (const it of outOfStockItems) {
      await handleRemoveFromCart(Number(it.id));
    }
    setShowOOS(false);
    setShowDeliveryModal(true);
    setDeliveryView('saved');
  };

  const handleAuthSuccess = (userData: UserData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setShowAuth(false);
    window.dispatchEvent(new Event("user-updated"));
    setShowDeliveryModal(true);
    setDeliveryView('saved');
    showToast(`Welcome, ${userData.name}!`, 'success');
  };

  useEffect(() => {
    const handleCheckoutTrigger = () => {
      if (!user) {
        setShowAuth(true);
        setAuthMode("login");
      } else {
        setShowDeliveryModal(true);
        setDeliveryView('saved');
      }
    };

    window.addEventListener('start-checkout-from-cart', handleCheckoutTrigger);
    return () => window.removeEventListener('start-checkout-from-cart', handleCheckoutTrigger);
  }, [user]);

  const handleAddressComplete = async (address: any) => {
    setSavedAddress(address);
    setDeliveryView('success');

    if (!address.id) {
      try {
        const response = await fetch(`${API_BASE}/save_address.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({
            name: address.name,
            phoneNumber: address.phoneNumber,
            email: address.email,
            flatNo: address.flatNo,
            streetAddress: address.streetAddress || '',
            area: address.area || '',
            city: address.city || '',
            state: address.state || '',
            pincode: address.pincode || '',
            country: address.country || 'India',
            landmark: address.landmark || '',
            fullAddress: address.fullAddress,
            label: address.label,
            coordinates: address.coordinates,
            isDefault: false
          }),
        });
        const result = await response.json();
        if (!result.success) {
          console.error('Error saving address:', result.message);
        }
      } catch (error) {
        console.error("Error saving address:", error);
      }
    }
  };

  const handleCloseDeliveryModal = () => {
    setShowDeliveryModal(false);
    setDeliveryView('saved');
    setSavedAddress(null);
  };

  const handleDeliveryModalAddressSelected = () => {
    setShowDeliveryModal(false);
    setShowCheckoutSuccess(true);
  };

  const handlePlaceOrder = async () => {
    setIsSubmittingOrder(true);
    try {
      const { subtotal, tax, shipping: shippingCharge, total: totalAmount } = cartTotals(cartItems);

      const response = await fetch(`${API_BASE}/create_order.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          items: cartItems,
          address: savedAddress,
          notes: orderNotes,
          total: parseFloat(totalAmount.toFixed(2)),
        }),
      });

      const result = await response.json();

      if (result.success) {
        await clearCart(result.data.orderId || result.data.id);
        setCartItems([]);
        setShowCheckoutSuccess(false);
        setIsCartOpen(false);
        showToast(`Order #${result.data.orderNumber} placed successfully!`, 'success');
        window.dispatchEvent(new Event("order-placed"));
        window.dispatchEvent(new Event("cart-updated"));
      } else {
        showToast(result.message || 'Failed to place order', 'error');
      }
    } catch (error) {
      console.error("Error placing order:", error);
      showToast('Failed to place order. Please try again.', 'error');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const clearCart = async (orderId?: number) => {
    try {
      const response = await fetch(`${API_BASE}/clear_cart.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          orderId: orderId,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setCartItems([]);
        window.dispatchEvent(new Event("cart-updated"));
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const updateQuantityInCheckout = async (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) return handleRemoveFromCart(productId);

    const updatedItems = cartItems.map(item =>
      Number(item.id) === productId ? {
        ...item,
        quantity: newQuantity,
        subtotal: lineSubtotal(item.price, newQuantity)
      } : item
    );
    setCartItems(updatedItems);
    setIsUpdating(productId);

    try {
      await fetch(`${API_BASE}/cart.php`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ product_id: productId, quantity: newQuantity }),
      });
      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setIsUpdating(null);
    }
  };

  const removeItemInCheckout = async (productId: number) => {
    const updatedItems = cartItems.filter(item => Number(item.id) !== productId);
    setCartItems(updatedItems);
    setIsUpdating(productId);

    try {
      await fetch(`${API_BASE}/cart.php?product_id=${productId}`, { method: "DELETE", headers: authHeaders() });
      window.dispatchEvent(new Event("cart-updated"));
      showToast('Item removed from cart', 'info');
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setIsUpdating(null);
    }
  };

  // Fetch cart
  useEffect(() => {
    const fetchCart = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`${API_BASE}/cart.php`, { headers: authHeaders() });
        const data = await res.json();

        if (data.status === 'success') {
          let items = data.data || data.items || [];
          if (!Array.isArray(items)) {
            setCartItems([]);
            return;
          }
          items = items.map((item: any) => ({
            ...item,
            last_added_at: item.last_added_at || new Date().toISOString()
          }));
          items.sort((a: any, b: any) =>
            new Date(b.last_added_at).getTime() - new Date(a.last_added_at).getTime()
          );
          setCartItems(items);
        } else {
          setCartItems([]);
        }
      } catch (error) {
        setCartItems([]);
      }
    };

    fetchCart();
  }, [user?.id]);

  // Listen to cart updates
  useEffect(() => {
    let lastHighlightedId: number | null = null;

    const handleCartUpdate = async (e: any) => {
      lastHighlightedId = e.detail?.highlightedProductId || null;
      if (!user?.id) {
        const items = getGuestCart().map(i => ({ ...i, cart_id: i.id }))
        setCartItems(items)
        return
      }
      try {
        const res = await fetch(`${API_BASE}/cart.php`, { headers: authHeaders() });
        const data = await res.json();

        if (data.status === 'success') {
          let items = data.data || data.items || [];
          if (!Array.isArray(items)) {
            setCartItems([]);
            return;
          }

          const now = new Date().toISOString();
          items = items.map((item: any) => {
            if (item.id === lastHighlightedId) {
              return { ...item, last_added_at: now };
            }
            return {
              ...item,
              last_added_at: item.last_added_at || new Date(Date.now() - 100000000).toISOString()
            };
          });

          items.sort((a: any, b: any) =>
            new Date(b.last_added_at).getTime() - new Date(a.last_added_at).getTime()
          );

          setCartItems(items);

          if (lastHighlightedId && isCartOpen) {
            setTimeout(() => {
              const el = document.querySelector(`[data-product-id="${lastHighlightedId}"]`);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('ring-2', 'ring-green-500', 'ring-offset-2');
                setTimeout(() => {
                  el.classList.remove('ring-2', 'ring-green-500', 'ring-offset-2');
                }, 2000);
              }
            }, 150);
          }
        } else {
          setCartItems([]);
        }
      } catch (error) {
        setCartItems([]);
      }
    };

    const handleGuestCartUpdate = () => {
      const items = getGuestCart().map(i => ({ ...i, cart_id: i.id }))
      setCartItems(items)
    }

    handleCartUpdate({})
    window.addEventListener('cart-updated', handleCartUpdate)
    window.addEventListener('guest-cart-updated', handleGuestCartUpdate)  // ✅

    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate)
      window.removeEventListener('guest-cart-updated', handleGuestCartUpdate)  // ✅
    }

  }, [isCartOpen, user?.id]);

  useEffect(() => {
    setIsWishlisted(isInGuestWishlist(product.id))
  }, [product.id])

  const finalPrice = product.final_price || product.price_per_kg * (1 - product.discount_percent / 100);
  const totalPrice = (finalPrice * quantity).toFixed(2);
  const step = product.unit === "kg" ? 0.25 : 1;
  const isInStock = product.stock > 0;

  const increment = () => setQuantity(prev => Math.min(prev + step, product.max_quantity || Infinity));
  const decrement = () => setQuantity(prev => Math.max(prev - step, product.min_quantity || 0));

  const addToCart = async () => {
    if (!isInStock || quantity < product.min_quantity) return

    setIsAddingToCart(true)

    // ✅ Guest: localStorage. Decide from a FRESH token read (not React state)
    // so a logged-in user is never misrouted to the guest cart on first click.
    if (!getToken()) {
      addToGuestCart({
        id: product.id,
        name: product.name,
        price: unitPrice(product),
        image: product.image,
        category: product.category,
        stock: product.stock,
        slug: product.slug,
      }, quantity)

      // Cart state update
      setCartItems(getGuestCart().map(i => ({ ...i, cart_id: i.id })))
      showToast('Added to cart!', 'success')
      window.dispatchEvent(new CustomEvent('guest-cart-updated', {
        detail: { highlightedProductId: product.id.toString() }
      }))
      setTimeout(() => setIsCartOpen(true), 100)
      setIsAddingToCart(false)
      return
    }
    try {
      const res = await fetch(`${API_BASE}/cart.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          product_id: product.id,
          quantity: quantity,
          status: 'active',
          last_added_at: new Date().toISOString()
        })
      });

      const data = await res.json();

      if (data.status === 'success') {
        showToast('Added to cart!', 'success');

        const cartRes = await fetch(`${API_BASE}/cart.php`, { headers: authHeaders() });
        const cartData = await cartRes.json();

        if (cartData.status === 'success') {
          let items = cartData.data || cartData.items || [];
          items = items.map((item: any) => ({
            ...item,
            last_added_at: item.id === product.id ? new Date().toISOString() : (item.last_added_at || new Date(Date.now() - 100000000).toISOString())
          }));
          items.sort((a: any, b: any) =>
            new Date(b.last_added_at).getTime() - new Date(a.last_added_at).getTime()
          );
          setCartItems(items);
        }

        setTimeout(() => {
          setIsCartOpen(true);
        }, 100);

        window.dispatchEvent(new CustomEvent('cart-updated', {
          detail: { highlightedProductId: product.id }
        }));
      } else {
        showToast(data.message || 'Failed to add to cart', 'error');
      }
    } catch (error) {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleUpdateQuantity = async (productId: number, quantity: number) => {
    if (quantity < 0.25) {
      handleRemoveFromCart(productId);
      return;
    }

    if (!user?.id) {
      updateGuestCartQty(productId, quantity)
      return
    }
    try {
      const res = await fetch(`${API_BASE}/cart.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          product_id: productId,
          quantity: quantity,
          last_added_at: new Date().toISOString()
        })
      });

      const data = await res.json();
      if (data.status === 'success') {
        window.dispatchEvent(new CustomEvent('cart-updated', {
          detail: { highlightedProductId: productId }
        }));
      }
    } catch (error) {
      showToast('Failed to update quantity', 'error');
    }
  };

  const handleRemoveFromCart = async (productId: number) => {
    if (!user?.id) {
      removeFromGuestCart(productId)
      return
    }
    try {
      const userId = user.id;
      const res = await fetch(`${API_BASE}/cart.php?product_id=${productId}`, {
        method: 'DELETE',
        headers: authHeaders()
      });

      const data = await res.json();
      if (data.status === 'success') {
        showToast('Item removed', 'info');
        window.dispatchEvent(new Event('cart-updated'));
      }
    } catch (error) {
      showToast('Failed to remove item', 'error');
    }
  };

  const toggleWishlist = () => {
    // ✅ No login required — guest + logged-in both work
    const result = toggleGuestWishlist({
      id: product.id,
      name: product.name,
      price: unitPrice(product),
      image: product.image,
      category: product.category,
      slug: product.slug,
    })

    setIsWishlisted(result === "added")
    showToast(
      result === "added" ? "Added to wishlist" : "Removed from wishlist",
      result === "added" ? "success" : "info"
    )
    window.dispatchEvent(new Event("guest-wishlist-updated"))
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      <Toast show={!!notification} message={notification} type={notificationType} />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        isLoggedIn={isLoggedIn}
        onCheckoutClick={handleCheckoutClick}
        onLoginClick={(mode) => {
          setAuthMode(mode);
          setShowAuth(true);
        }}
      />

      {/* Auth Modal */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="sm:max-w-md p-0">
          <div className="p-6">
            {authMode === "login" ? (
              <LoginModal
                onSuccess={handleAuthSuccess}
                onSwitchToSignup={() => setAuthMode("signup")}
              />
            ) : (
              <SignupModal
                onSuccess={handleAuthSuccess}
                onSwitchToLogin={() => setAuthMode("login")}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delivery Modal */}
      {showOOS && (
        <OutOfStockModal
          items={outOfStockItems.map((i) => ({ id: i.id, name: i.name, image: i.image }))}
          onRemoveAndContinue={handleRemoveOOSAndContinue}
          onClose={() => setShowOOS(false)}
        />
      )}

      {showDeliveryModal && user && (
        <DeliveryModal
          userData={user}
          currentView={deliveryView}
          onViewChange={setDeliveryView}
          onAddressComplete={handleAddressComplete}
          savedAddress={savedAddress}
          onClose={handleCloseDeliveryModal}
          onAddressSelected={handleDeliveryModalAddressSelected}
        />
      )}

      {/* Checkout Success View */}
      {showCheckoutSuccess && savedAddress && (
        <CheckoutSuccessView
          items={cartItems}
          address={savedAddress}
          isUpdating={isUpdating}
          onQuantityChange={updateQuantityInCheckout}
          onRemoveItem={removeItemInCheckout}
          onChangeAddress={() => {
            setShowCheckoutSuccess(false);
            setShowDeliveryModal(true);
          }}
          onPlaceOrder={handlePlaceOrder}
          onClose={() => setShowCheckoutSuccess(false)}
          isSubmitting={isSubmittingOrder}
        />
      )}

      {/* Back Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid lg:grid-cols-2">
            {/* Product Image */}
            <div className="relative bg-gray-100">
              <div className="aspect-square lg:aspect-auto lg:h-[600px] relative">
                <Image
                  src={`${IMAGE_BASE}/${product.image}`}
                  alt={product.name}
                  fill
                  unoptimized
                  className="object-cover"
                />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.is_featured === 1 && (
                    <span className="bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" /> Featured
                    </span>
                  )}
                  {product.discount_percent > 0 && (
                    <span className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
                      {product.discount_percent}% OFF
                    </span>
                  )}
                </div>

                {/* Rating Badge */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-sm">{product.rating || 4.7}</span>
                  <span className="text-gray-500 text-xs">({product.review_count || 289})</span>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="p-6 lg:p-10 flex flex-col">
              {/* Category */}
              <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold w-fit mb-4">
                {product.category}
              </span>

              {/* Name */}
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

              {/* Description */}
              {product.description && (
                <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>
              )}

              {/* Price */}
              <div className="bg-gray-50 rounded-xl p-5 mb-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl font-bold text-gray-900">₹{finalPrice.toFixed(2)}</span>
                  <span className="text-gray-500">/ {product.unit}</span>
                  {product.discount_percent > 0 && (
                    <span className="text-lg text-gray-400 line-through">₹{Number(product.price_per_kg.toFixed(2))}</span>
                  )}
                </div>
                {product.discount_percent > 0 && (
                  <p className="text-green-600 text-sm font-medium">
                    You save ₹{(product.price_per_kg - finalPrice).toFixed(2)} per {product.unit}
                  </p>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-3 block">Quantity</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                    <button
                      onClick={decrement}
                      disabled={quantity <= product.min_quantity}
                      className="p-3 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                    >
                      <Minus className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="px-6 py-3 min-w-[100px] text-center border-x border-gray-300">
                      <span className="text-xl font-semibold">{quantity}</span>
                      <span className="text-gray-500 ml-1">{product.unit}</span>
                    </div>
                    <button
                      onClick={increment}
                      disabled={quantity >= (product.max_quantity || Infinity)}
                      className="p-3 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                    >
                      <Plus className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-2xl font-bold text-gray-900">₹{totalPrice}</p>
                  </div>
                </div>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 mb-6">
                {isInStock ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-700 text-sm font-medium">In Stock • {product.stock} {product.unit} available</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-red-700 text-sm font-medium">Out of Stock</span>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-8">
                <button
                  onClick={addToCart}
                  disabled={!isInStock || isAddingToCart}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {isAddingToCart ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ShoppingCart className="w-5 h-5" />
                  )}
                  {isAddingToCart ? "Adding..." : isInStock ? "Add to Cart" : "Out of Stock"}
                </button>
                <button
                  onClick={toggleWishlist}
                  className={`w-14 h-14 rounded-xl border-2 transition-colors flex items-center justify-center ${isWishlisted
                    ? "border-red-200 bg-red-50 text-red-500"
                    : "border-gray-300 hover:border-gray-400 text-gray-400 hover:text-gray-600"
                    }`}
                >
                  <Heart className={`w-6 h-6 ${isWishlisted ? "fill-current" : ""}`} />
                </button>
              </div>

              {/* Features */}
              <div className="border-t border-gray-200 pt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Truck className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700">Free delivery on orders above ₹500</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Leaf className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">100% Fresh • Farm to Table</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-gray-700">Quality Guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((item) => (
                <Link key={item.id} href={`/product/${item.slug}`} className="group">
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-md">
                    <div className="relative aspect-square bg-gray-100">
                      <Image
                        src={`${IMAGE_BASE}/${item.image}`}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {item.discount_percent > 0 && (
                        <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 rounded text-xs font-semibold">
                          -{item.discount_percent}%
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-green-600 transition-colors">
                        {item.name}
                      </h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-gray-900">₹{item.final_price}</span>
                        <span className="text-xs text-gray-500">/{item.unit}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}