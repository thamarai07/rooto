"use client";

import { useState } from "react";
import { Loader2, Phone, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { clearGuestCart, getGuestCart, getGuestWishlist } from "@/lib/guestStorage";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://seashell-skunk-617240.hostingersite.com/vfs-admin/api";

const REMEMBER_ME_KEY = "remember_me_token";

export default function LoginModal({ onSuccess, onSwitchToSignup, onForgotPassword }: any) {
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({ login: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mergeGuestData = async (userId: number) => {
    const guestCart     = getGuestCart();
    const guestWishlist = getGuestWishlist();

    await Promise.all([
      ...guestCart.map((item) =>
        fetch(`${API_BASE}/cart.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: item.id, quantity: item.quantity, user_id: userId }),
        })
      ),
      ...guestWishlist.map((item) =>
        fetch(`${API_BASE}/wishlist.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: item.id, user_id: userId }),
        })
      ),
    ]);

    clearGuestCart();
    localStorage.removeItem("guest_wishlist");
    window.dispatchEvent(new Event("cart-updated"));
    window.dispatchEvent(new Event("wishlist-updated"));
  };

  const handleLogin = async () => {
    if (!formData.login || !formData.password) {
      setError("Enter mobile/email & password");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, remember_me: rememberMe }),
      });

      const data = await res.json();

      if (data.status === "success") {
        // Store JWT
        localStorage.setItem("auth_token", data.token);

        // Store remember_me token if user opted in
        if (rememberMe && data.remember_me_token) {
          localStorage.setItem(REMEMBER_ME_KEY, data.remember_me_token);
        } else {
          localStorage.removeItem(REMEMBER_ME_KEY);
        }

        setUser(data.user);
        await mergeGuestData(data.user.id);
        onSuccess?.(data.user);
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[340px] mx-auto p-4 sm:p-5">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Welcome Back</h2>
        <p className="text-gray-500 text-xs mt-1">Sign in to continue</p>
      </div>

      <div className="space-y-4">
        {/* Mobile / Email */}
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-gray-600 tracking-wide">
            MOBILE OR EMAIL
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={formData.login}
              onChange={(e) => setFormData({ ...formData, login: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              placeholder="Enter mobile or email"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-medium text-gray-600 tracking-wide">
              PASSWORD
            </label>
            {/* Forgot Password */}
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-[10px] text-green-600 hover:underline font-medium"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              placeholder="Enter password"
            />
          </div>
        </div>

        {/* Remember Me */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-600 accent-green-600"
          />
          <span className="text-xs text-gray-600">Remember me for 30 days</span>
        </label>

        {/* Error */}
        {error && (
          <p className="text-red-600 text-[10px] bg-red-50 p-2 rounded border border-red-100">
            {error}
          </p>
        )}

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full py-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-sm font-medium rounded-lg flex items-center justify-center transition-colors disabled:opacity-70"
        >
          {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "LOGIN"}
        </button>

        <p className="text-center text-[10px] text-gray-600">
          Don't have an account?{" "}
          <button
            onClick={onSwitchToSignup}
            className="text-green-600 font-medium hover:underline"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}