// hooks/useRememberMe.ts
"use client";

import { useEffect } from "react";
import { useAuth } from "./useAuth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://seashell-skunk-617240.hostingersite.com/vfs-admin/api";
const REMEMBER_ME_KEY = "remember_me_token";

export function useRememberMe() {
  const { user, setUser } = useAuth();

  useEffect(() => {
    // Only attempt if not already logged in.
    if (user) return;

    // Guard against the mount-timing race: on first render the auth context
    // hasn't hydrated yet, so `user` is still null even when a JWT is already
    // stored. Without this direct localStorage check, remember-me would silently
    // auto-login the *remembered* account and overwrite the session the user is
    // actually on — e.g. placing an order as one account, then getting switched
    // back to another so the order never appears in "My Orders".
    try {
      if (localStorage.getItem("auth_token") || localStorage.getItem("auth_user")) return;
    } catch { /* ignore storage errors */ }

    const storedToken = localStorage.getItem(REMEMBER_ME_KEY);
    if (!storedToken) return;

    (async () => {
      try {
        const res  = await fetch(`${API_BASE}/auto_login.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ remember_me_token: storedToken }),
        });
        const data = await res.json();

        if (data.status === "success") {
          // Rotate stored token
          localStorage.setItem(REMEMBER_ME_KEY, data.remember_me_token);
          localStorage.setItem("auth_token", data.token);
          setUser(data.user);
        } else {
          // Token invalid/expired — clear it
          localStorage.removeItem(REMEMBER_ME_KEY);
          localStorage.removeItem("auth_token");
        }
      } catch {
        // Silently fail — don't disrupt page load
      }
    })();
  }, []); // run once on mount
}