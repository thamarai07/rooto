// hooks/useRememberMe.ts
"use client";

import { useEffect } from "react";
import { useAuth } from "./useAuth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://seashell-skunk-617240.hostingersite.com/vfs-admin/api";
const REMEMBER_ME_KEY = "remember_me_token";

// Module-level: the remember-me exchange must run at most once per page load.
// auto_login.php ROTATES the remember token on every call, so a second call with
// the (now stale) original token fails — and the old failure path then wiped
// `auth_token`, leaving `auth_user` behind => every API call 401'd with
// "Authentication required" even though the app still showed you as logged in.
let rememberMeAttempted = false;

export function useRememberMe() {
  const { user, setUser } = useAuth();

  useEffect(() => {
    if (user) return;
    if (rememberMeAttempted) return;

    // Guard against the mount-timing race: on first render the auth context
    // hasn't hydrated yet, so `user` is still null even when a session is
    // already stored. Without this direct localStorage check, remember-me would
    // silently auto-login the *remembered* account over the one the user is on.
    try {
      if (localStorage.getItem("auth_token") || localStorage.getItem("auth_user")) return;
    } catch { /* ignore storage errors */ }

    const storedToken = localStorage.getItem(REMEMBER_ME_KEY);
    if (!storedToken) return;

    rememberMeAttempted = true;

    (async () => {
      try {
        const res  = await fetch(`${API_BASE}/auto_login.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ remember_me_token: storedToken }),
        });
        const data = await res.json();

        // A real login (manual, or another tab) may have completed while this
        // request was in flight — never clobber that fresh session.
        let sessionExists = false;
        try { sessionExists = !!localStorage.getItem("auth_token"); } catch {}
        if (sessionExists) return;

        if (data.status === "success" && data.token && data.user) {
          if (data.remember_me_token) {
            localStorage.setItem(REMEMBER_ME_KEY, data.remember_me_token);
          }
          localStorage.setItem("auth_token", data.token);
          setUser(data.user);
        } else {
          // Remember token no longer valid — drop only the remember token.
          // Do NOT touch auth_token / auth_user: the guard above proved there
          // was no session at mount, so anything present now was set by a real
          // login and must be kept.
          localStorage.removeItem(REMEMBER_ME_KEY);
        }
      } catch {
        // Silently fail — don't disrupt page load, don't clear anything.
      }
    })();
  }, []); // run once on mount
}
