import { createContext, useContext, useEffect, useState } from 'react'
import { api, setAuthToken } from '../services/api'

const AuthContext = createContext(null)

const SESSION_KEY = 'paypulse_session'

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveSession(session) {
  if (!session) {
    localStorage.removeItem(SESSION_KEY)
    return
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    user: {
      id: session.user.id,
      email: session.user.email,
      user_metadata: session.user.user_metadata,
      created_at: session.user.created_at,
    },
  }))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = loadSession()
    if (stored?.access_token) {
      setAuthToken(stored.access_token)
      api.get('/auth/me')
        .then(({ user: verified }) => {
          setUser(verified)
          setSession({ ...stored, user: verified })
        })
        .catch(() => {
          setAuthToken(null)
          localStorage.removeItem(SESSION_KEY)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const signUp = async (email, password, name) => {
    const data = await api.post('/auth/register', { email, password, name })
    if (data.session) {
      setAuthToken(data.session.access_token)
      saveSession(data.session)
      setUser(data.user)
      setSession(data.session)
    }
    return data
  }

  const signIn = async (email, password) => {
    const data = await api.post('/auth/login', { email, password })
    setAuthToken(data.session.access_token)
    saveSession(data.session)
    setUser(data.user)
    setSession(data.session)
    return data
  }

  const signOut = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // ignore logout errors
    }
    setAuthToken(null)
    saveSession(null)
    setUser(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
