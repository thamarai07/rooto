'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { logout as authLogout, saveUser, clearUser } from '@/lib/auth'

interface User {
  id: number
  name: string
  email: string
  phone?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  setUser: () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load user from localStorage on mount
    try {
      const savedUser = localStorage.getItem("auth_user")
      if (savedUser) {
        setUserState(JSON.parse(savedUser))
      }
    } catch {
      localStorage.removeItem("auth_user")
    } finally {
      setLoading(false)
    }
  }, [])

  const setUser = (user: User | null) => {
    setUserState(user)
    if (user) {
      saveUser(user)        // ← save to localStorage
    } else {
      clearUser()           // ← clear from localStorage
    }
  }

  const logout = async () => {
    await authLogout()
    setUserState(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
