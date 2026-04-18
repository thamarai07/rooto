"use client";

import { useState } from "react";
import { Loader2, User, Mail, Phone, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { clearGuestCart, getGuestCart, getGuestWishlist } from "@/lib/guestStorage";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://seashell-skunk-617240.hostingersite.com/vfs-admin/api";

export default function SignupModal({ onSuccess, onSwitchToLogin }: any) {
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const err: any = {};

    if (!formData.name || formData.name.length < 2)
      err.name = "Enter valid name";

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      err.email = "Invalid email";

    if (!formData.mobile || !/^\d{10}$/.test(formData.mobile))
      err.mobile = "Enter valid 10-digit mobile";

    if (!formData.password || formData.password.length < 6)
      err.password = "Password must be at least 6 characters";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const mergeGuestData = async (userId: number) => {
    const guestCart = getGuestCart();
    const guestWishlist = getGuestWishlist();

    await Promise.all([
      ...guestCart.map((item) =>
        fetch(`${API_BASE}/cart.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: item.id,
            quantity: item.quantity,
            user_id: userId,
          }),
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

  const handleSignup = async () => {
    if (!validate()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/register.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.status === "success") {
        setUser(data.user);
        await mergeGuestData(data.user.id);
        onSuccess?.(data.user);
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[340px] mx-auto p-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Create Account</h2>
        <p className="text-gray-500 text-xs mt-0.5">Join us today</p>
      </div>

      <div className="space-y-3">   {/* Reduced gap from 4 to 3 */}

        {/* Name */}
        <div className="space-y-0.5">   {/* Very tight */}
          <label className="text-[10px] font-medium text-gray-600 tracking-wide">
            FULL NAME
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              placeholder="Your full name"
            />
          </div>
          {errors.name && <p className="text-red-500 text-[10px] pl-1">{errors.name}</p>}
        </div>

        {/* Email */}
        <div className="space-y-0.5">
          <label className="text-[10px] font-medium text-gray-600 tracking-wide">
            EMAIL ADDRESS
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              placeholder="you@example.com"
            />
          </div>
          {errors.email && <p className="text-red-500 text-[10px] pl-1">{errors.email}</p>}
        </div>

        {/* Mobile */}
        <div className="space-y-0.5">
          <label className="text-[10px] font-medium text-gray-600 tracking-wide">
            MOBILE NUMBER
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="tel"
              value={formData.mobile}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  mobile: e.target.value.replace(/\D/g, "").slice(0, 10),
                })
              }
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              placeholder="9876543210"
            />
          </div>
          {errors.mobile && <p className="text-red-500 text-[10px] pl-1">{errors.mobile}</p>}
        </div>

        {/* Password */}
        <div className="space-y-0.5">
          <label className="text-[10px] font-medium text-gray-600 tracking-wide">
            PASSWORD
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              placeholder="At least 6 characters"
            />
          </div>
          {errors.password && <p className="text-red-500 text-[10px] pl-1">{errors.password}</p>}
        </div>

        {/* General Error */}
        {error && (
          <p className="text-red-600 text-[10px] bg-red-50 p-1.5 rounded border border-red-100 mt-1">
            {error}
          </p>
        )}

        {/* Signup Button */}
        <button
          onClick={handleSignup}
          disabled={isLoading}
          className="w-full py-2.5 mt-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-sm font-medium rounded-lg flex items-center justify-center transition-colors disabled:opacity-70"
        >
          {isLoading ? (
            <Loader2 className="animate-spin h-4 w-4" />
          ) : (
            "CREATE ACCOUNT"
          )}
        </button>

        {/* Switch to Login */}
        <p className="text-center text-[10px] text-gray-600 mt-1">
          Already have an account?{" "}
          <button
            onClick={onSwitchToLogin}
            className="text-green-600 font-medium hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}