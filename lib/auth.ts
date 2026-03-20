const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://rootoportal.onrender.com/api"

export async function getMe() {
  const res = await fetch(`${API_BASE}/me.php`, {
    credentials: 'include', // ← sends cookie automatically
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.status === 'success' ? data.user : null
}

export async function logout() {
  await fetch(`${API_BASE}/logout.php`, {
    method: 'POST',
    credentials: 'include',
  })
}