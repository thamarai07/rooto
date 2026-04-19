"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Lock, CheckCircle, XCircle } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://seashell-skunk-617240.hostingersite.com/vfs-admin/api";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token  = params.get("token") ?? "";

  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [error, setError]         = useState<string | null>(null);
  const [isLoading, setLoading]   = useState(false);
  const [success, setSuccess]     = useState(false);
  const [invalid, setInvalid]     = useState(false);

  useEffect(() => {
    if (!token) setInvalid(true);
  }, [token]);

  const handleReset = async () => {
    if (!password || !confirm) { setError("Please fill in both fields"); return; }
    if (password.length < 8)   { setError("Password must be at least 8 characters"); return; }
    if (password !== confirm)  { setError("Passwords do not match"); return; }

    setLoading(true);
    setError(null);

    try {
      const res  = await fetch(`${API_BASE}/reset_password.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (data.status === "success") {
        setSuccess(true);
        setTimeout(() => router.push("/"), 3000);
      } else {
        setError(data.message || "Something went wrong");
        if (data.message?.includes("expired") || data.message?.includes("Invalid")) {
          setInvalid(true);
        }
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (invalid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <XCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Link expired</h1>
          <p className="text-sm text-gray-500 mb-6">
            This reset link is invalid or has expired. Please request a new one.
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Password reset!</h1>
          <p className="text-sm text-gray-500">Redirecting you to login in a moment…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[340px]">
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Set new password</h1>
          <p className="text-gray-500 text-xs mt-1">Choose a strong password</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-gray-600 tracking-wide">NEW PASSWORD</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
                placeholder="At least 8 characters"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-medium text-gray-600 tracking-wide">CONFIRM PASSWORD</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleReset()}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
                placeholder="Repeat password"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-[10px] bg-red-50 p-2 rounded border border-red-100">{error}</p>
          )}

          <button
            onClick={handleReset}
            disabled={isLoading}
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg flex items-center justify-center transition-colors disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "RESET PASSWORD"}
          </button>
        </div>
      </div>
    </div>
  );
}