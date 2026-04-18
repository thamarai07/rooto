const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://seashell-skunk-617240.hostingersite.com/vfs-admin/api"

export async function getMe() {
  try {
    // First check localStorage for user data (instant, no network)
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
    // Clear localStorage
    localStorage.removeItem("auth_user")
    // Also clear backend cookie
    await fetch(`${API_BASE}/logout.php`, {
      method: 'POST',
      credentials: 'include',
    })
  } catch {
    localStorage.removeItem("auth_user")
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