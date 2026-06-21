const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://seashell-skunk-617240.hostingersite.com/vfs-admin/api"

// ─── JWT Token helpers ────────────────────────────────────────────────────────

/** Returns the stored JWT string, or null if not logged in. */
export function getToken(): string | null {
  try {
    return localStorage.getItem("auth_token")
  } catch {
    return null
  }
}

/** Persist the JWT returned by the login API. */
export function saveToken(token: string) {
  localStorage.setItem("auth_token", token)
}

/** Build Authorization header object — returns {} if no token. */
export function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** Remove the stored JWT (call on logout). */
export function clearToken() {
  localStorage.removeItem("auth_token")
}

// ─── User profile helpers ─────────────────────────────────────────────────────

export async function getMe() {
  try {
    const savedUser = localStorage.getItem("auth_user")
    if (savedUser) {
      return JSON.parse(savedUser)
    }
    return null
  } catch {
    return null
  }
}

export async function logout() {
  try {
    clearToken()
    localStorage.removeItem("auth_user")
    // Must also clear the remember-me token, otherwise useRememberMe()
    // auto-logs the user back in on the next page load.
    localStorage.removeItem("remember_me_token")
    await fetch(`${API_BASE}/logout.php`, {
      method: 'POST',
      credentials: 'include',
    })
  } catch {
    clearToken()
    localStorage.removeItem("auth_user")
    localStorage.removeItem("remember_me_token")
  }
}

// Save user to localStorage
export function saveUser(user: object) {
  localStorage.setItem("auth_user", JSON.stringify(user))
}

// Clear user from localStorage
export function clearUser() {
  localStorage.removeItem("auth_user")
}