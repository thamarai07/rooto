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

const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE || `${process.env.NEXT_PUBLIC_API_BASE?.replace('/api', '') || 'https://rootoportal.onrender.com'}/assets/images/uploads`;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://rootoportal.onrender.com/api";

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

  const subtotal = cartItems.reduce((sum, item) => sum + (item.subtotal || item.price * item.quantity), 0);
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;
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

  const drawerContent = (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity z-[10001]"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-full sm:max-w-md bg-white shadow-2xl z-[10002] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">Shopping Cart</h3>
              <p className="text-sm text-gray-500">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} • {totalWeight.toFixed(2)} kg
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto bg-gray-50" style={{ WebkitOverflowScrolling: 'touch' }}>
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                <ShoppingCart className="w-12 h-12 text-gray-400" />
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
            <div className="p-4 space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.cart_id}
                  data-product-id={item.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex gap-3">
                    {/* Product Image */}
                    <Link
                      href={`/product/${encodeURIComponent(item.slug || item.name)}`}
                      onClick={onClose}
                      className="flex-shrink-0"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 rounded-lg object-cover bg-gray-100"
                        onError={(e) => {
                          e.currentTarget.src = "https://placehold.co/80x80/f3f4f6/9ca3af?text=No+Image";
                        }}
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      {/* Product Name */}
                      <Link
                        href={`/product/${encodeURIComponent(item.slug || item.name)}`}
                        onClick={onClose}
                        className="font-medium text-gray-900 hover:text-green-600 line-clamp-2 text-sm transition-colors"
                      >
                        {item.name}
                      </Link>

                      {/* Price */}
                      <p className="text-sm text-gray-500 mt-1">₹{item.price.toFixed(2)} / kg</p>

                      {/* Quantity & Actions */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-gray-200 rounded-lg">
                          <button
                            onClick={() => onUpdateQuantity(item.id, Math.max(0.25, item.quantity - 0.25))}
                            className="p-2 hover:bg-gray-50 transition-colors"
                            disabled={deletingId === item.id}
                          >
                            <Minus className="w-4 h-4 text-gray-600" />
                          </button>
                          <span className="px-3 text-sm font-medium min-w-[60px] text-center">
                            {item.quantity.toFixed(2)} kg
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 0.25)}
                            className="p-2 hover:bg-gray-50 transition-colors"
                            disabled={deletingId === item.id}
                          >
                            <Plus className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-900">
                            ₹{(item.subtotal || item.price * item.quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => handleRemove(item.id)}
                            disabled={deletingId === item.id}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            {deletingId === item.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Free Delivery Banner */}
              {subtotal > 500 ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Truck className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-green-800">Free delivery unlocked!</p>
                    <p className="text-green-600 text-xs">You saved ₹50 on delivery</p>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-sm text-amber-800">
                    Add <span className="font-semibold">₹{(500 - subtotal).toFixed(2)}</span> more for free delivery
                  </p>
                  <div className="mt-2 h-1.5 bg-amber-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${Math.min((subtotal / 500) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0 space-y-4">
            {/* Price Summary */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span className={shipping === 0 ? "text-green-600 font-medium" : "font-medium"}>
                  {shipping === 0 ? "FREE" : `₹${shipping}`}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-gray-900">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            {isLoggedIn ? (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onClose();
                    onCheckoutClick();
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  Checkout
                  <ChevronRight className="w-4 h-4" />
                </button>
                <Link href="/cart" onClick={onClose}>
                  <button className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 py-3 rounded-xl font-medium transition-colors">
                    View Full Cart
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">Login to checkout</p>
                    <p className="text-blue-700 text-xs">Sign in to complete your purchase</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onLoginClick('login');
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onLoginClick('signup');
                    }}
                    className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 py-3 rounded-xl font-semibold transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            )}
          </div>
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

  const handleCheckoutClick = () => {
    if (!user || !isLoggedIn) {
      setAuthMode("login");
      setShowAuth(true);
    } else {
      setShowDeliveryModal(true);
      setDeliveryView('saved');
    }
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId: user?.id,
            name: address.name,
            phoneNumber: address.phoneNumber,
            email: address.email,
            flatNo: address.flatNo,
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
      const subtotal = cartItems.reduce(
        (sum, item) => sum + (item.subtotal || item.price * item.quantity),
        0
      );
      const tax = subtotal * 0.08;
      const shippingCharge = subtotal > 500 ? 0 : 50;
      const totalAmount = subtotal + tax + shippingCharge;

      const response = await fetch(`${API_BASE}/create_order.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: user?.id,
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: user?.id,
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
        subtotal: newQuantity * item.price
      } : item
    );
    setCartItems(updatedItems);
    setIsUpdating(productId);

    try {
      await fetch(`${API_BASE}/cart.php`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
      await fetch(`${API_BASE}/cart.php?product_id=${productId}`, { method: "DELETE" });
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
        const userId = user.id;
        const res = await fetch(`${API_BASE}/cart.php?user_id=${userId}`);
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

      if (!user?.id) return;
      try {
        const userId = user.id;
        const res = await fetch(`${API_BASE}/cart.php?user_id=${userId}`);
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

    handleCartUpdate({});
    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, [isCartOpen, user?.id]);

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setIsWishlisted(wishlist.some((i: any) => i.id === product.id));
  }, [product.id]);

  const finalPrice = product.final_price || product.price_per_kg * (1 - product.discount_percent / 100);
  const totalPrice = (finalPrice * quantity).toFixed(2);
  const step = product.unit === "kg" ? 0.25 : 1;
  const isInStock = product.stock > 0;

  const increment = () => setQuantity(prev => Math.min(prev + step, product.max_quantity || Infinity));
  const decrement = () => setQuantity(prev => Math.max(prev - step, product.min_quantity || 0));

  const addToCart = async () => {
    if (!isInStock || quantity < product.min_quantity) return;

    // 🔐 Login guard
    if (!isLoggedIn || !user) {
      setAuthMode("login");
      setShowAuth(true);
      return;
    }

    setIsAddingToCart(true);

    try {
      const res = await fetch(`${API_BASE}/cart.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          quantity: quantity,
          user_id: user?.id,
          status: 'active',
          last_added_at: new Date().toISOString()
        })
      });

      const data = await res.json();

      if (data.status === 'success') {
        showToast('Added to cart!', 'success');

        const cartRes = await fetch(`${API_BASE}/cart.php?user_id=${user?.id}`);
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

    try {
      const res = await fetch(`${API_BASE}/cart.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          quantity: quantity,
          user_id: user?.id,
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
    if (!user?.id) return;
    try {
      const userId = user.id;
      const res = await fetch(`${API_BASE}/cart.php?product_id=${productId}&user_id=${userId}`, {
        method: 'DELETE'
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
    // 🔐 Login guard
    if (!isLoggedIn || !user) {
      setAuthMode("login");
      setShowAuth(true);
      return;
    }

    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const exists = wishlist.some((i: any) => i.id === product.id);

    if (exists) {
      const newWishlist = wishlist.filter((i: any) => i.id !== product.id);
      localStorage.setItem("wishlist", JSON.stringify(newWishlist));
      showToast("Removed from wishlist", 'info');
      setIsWishlisted(false);
    } else {
      wishlist.push({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: finalPrice,
        image: product.image,
        unit: product.unit,
      });
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      showToast("Added to wishlist", 'success');
      setIsWishlisted(true);
    }
  };

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
                    <span className="text-lg text-gray-400 line-through">₹{product.price_per_kg.toFixed(2)}</span>
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