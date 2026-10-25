import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { UNAUTHORIZED_EVENT, api, sessionStorageKey } from '../api/client'
import type { Session } from '../api/types'

interface AuthContextValue {
  user: Session | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function restoreSession(): Session | null {
  try {
    const session = JSON.parse(localStorage.getItem(sessionStorageKey) ?? 'null') as Session | null
    return session && session.expiresAt > Date.now() ? session : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Session | null>(restoreSession)

  const logout = useCallback(() => {
    localStorage.removeItem(sessionStorageKey)
    setUser(null)
  }, [])

  // Token expirado ou inválido: a API responde 401 e a sessão é encerrada
  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, logout)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout)
  }, [logout])

  const login = useCallback(async (email: string, password: string) => {
    const response = await api<{ accessToken: string; expiresIn: number; name: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    const session: Session = {
      accessToken: response.accessToken,
      name: response.name,
      expiresAt: Date.now() + response.expiresIn * 1000,
    }
    localStorage.setItem(sessionStorageKey, JSON.stringify(session))
    setUser(session)
  }, [])

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      await api('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) })
      await login(email, password)
    },
    [login],
  )

  const value = useMemo(() => ({ user, login, register, logout }), [user, login, register, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return context
}
