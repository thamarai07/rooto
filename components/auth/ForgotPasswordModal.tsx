"use client";

import { useState } from "react";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://seashell-skunk-617240.hostingersite.com/vfs-admin/api";

export default function ForgotPasswordModal({ onBack }: { onBack: () => void }) {
  const [email, setEmail]       = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [sent, setSent]         = useState(false);

  const handleSubmit = async () => {
    if (!email) { setError("Please enter your email"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Invalid email"); return; }

    setLoading(true);
    setError(null);

    try {
      const res  = await fetch(`${API_BASE}/forgot_password.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.status === "success") {
        setSent(true);
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="w-full max-w-[340px] mx-auto p-4 sm:p-5 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-14 h-14 text-green-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Check your inbox</h2>
        <p className="text-sm text-gray-500 mb-6">
          If <span className="font-medium text-gray-700">{email}</span> is registered,
          you'll receive a reset link shortly. The link expires in 1 hour.
        </p>
        <button
          onClick={onBack}
          className="w-full py-2.5 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[340px] mx-auto p-4 sm:p-5">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-5"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to login
      </button>

      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Forgot password?</h2>
        <p className="text-gray-500 text-xs mt-1">Enter your email to receive a reset link</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-gray-600 tracking-wide">EMAIL</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              placeholder="Enter your email address"
              autoFocus
            />
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-[10px] bg-red-50 p-2 rounded border border-red-100">
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg flex items-center justify-center transition-colors disabled:opacity-70"
        >
          {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "SEND RESET LINK"}
        </button>
      </div>
    </div>
  );
}