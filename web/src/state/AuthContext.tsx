import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { AuthUser } from '../lib/auth'
import { clearToken, getToken, setToken } from '../lib/auth'
import { apiFetch } from '../lib/api'

type AuthContextValue = {
  token: string | null
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken())
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const onAuthChanged = () => setTokenState(getToken())
    window.addEventListener('sporttown-auth-changed', onAuthChanged)
    window.addEventListener('storage', onAuthChanged)
    return () => {
      window.removeEventListener('sporttown-auth-changed', onAuthChanged)
      window.removeEventListener('storage', onAuthChanged)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadMe() {
      if (!token) {
        setUser(null)
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const res = await apiFetch<{ user: AuthUser }>('/api/auth/me')
        if (!cancelled) setUser(res.user)
      } catch {
        // Token inválido/expirado → limpiar
        clearToken()
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadMe()
    return () => {
      cancelled = true
    }
  }, [token])

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      loading,
      async login(email, password) {
        const res = await apiFetch<{ token: string; user: AuthUser }>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        })
        setToken(res.token)
        setUser(res.user)
      },
      async register(name, email, password) {
        const res = await apiFetch<{ token: string; user: AuthUser }>('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password }),
        })
        setToken(res.token)
        setUser(res.user)
      },
      async logout() {
        try {
          await apiFetch('/api/auth/logout', { method: 'POST' })
        } finally {
          clearToken()
          setUser(null)
        }
      },
      async refresh() {
        if (!token) return
        try {
          const res = await apiFetch<{ user: AuthUser }>('/api/auth/me')
          setUser(res.user)
        } catch {
          // Si falla, no hacer nada (el efecto se encargará de limpiar)
        }
      },
    }),
    [token, user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}


