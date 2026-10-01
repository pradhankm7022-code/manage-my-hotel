import { createContext, useContext, useEffect, useState } from 'react'
import { call } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('mmh_token')
    if (!token) { setLoading(false); return }
    call('auth.me')
      .then(res => setUser(res.user))
      .catch(() => localStorage.removeItem('mmh_token'))
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const res = await call('auth.login', { email, password })
    localStorage.setItem('mmh_token', res.token)
    setUser(res.user)
  }

  function logout() {
    call('auth.logout').catch(() => {})
    localStorage.removeItem('mmh_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
