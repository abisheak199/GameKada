import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// ─── JWT Helpers ────────────────────────────────────────────────
function base64UrlEncode(str) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(str))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function generateMockJWT(userData) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    sub: userData.email,
    name: userData.name,
    email: userData.email,
    role: userData.role || 'user',
    iat: now,
    exp: now + 60 * 60 * 24, // 24 hours
    iss: 'gamekada-auth-service',
  }
  const signature = btoa(`gamekada-secret-${userData.email}-${now}`)
    .replace(/=+$/, '')
    .substring(0, 32)

  const token = `${base64UrlEncode(header)}.${base64UrlEncode(payload)}.${signature}`
  return { token, payload, header }
}

function decodeJWT(token) {
  try {
    const [headerB64, payloadB64] = token.split('.')
    const header = JSON.parse(decodeURIComponent(escape(atob(headerB64.replace(/-/g, '+').replace(/_/g, '/')))))
    const payload = JSON.parse(decodeURIComponent(escape(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')))))
    return { header, payload }
  } catch {
    return null
  }
}

function logJWTProcess(phase, { token, header, payload, userData } = {}) {
  const styles = {
    title:   'color:#818cf8;font-size:14px;font-weight:bold;',
    section: 'color:#34d399;font-weight:bold;',
    key:     'color:#fbbf24;font-weight:bold;',
    value:   'color:#e2e8f0;',
    divider: 'color:#475569;',
    success: 'color:#4ade80;font-weight:bold;',
    error:   'color:#f87171;font-weight:bold;',
    warn:    'color:#fb923c;font-weight:bold;',
  }

  if (phase === 'login') {
    console.group('%c🔐 GameKada JWT Authentication', styles.title)
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', styles.divider)
    console.log('%c[1] Raw JWT Token:', styles.section)
    console.log('%c' + token, 'color:#a78bfa;word-break:break-all;')
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', styles.divider)
    console.log('%c[2] Decoded Header:', styles.section)
    console.table(header)
    console.log('%c[3] Decoded Payload:', styles.section)
    console.table(payload)
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', styles.divider)
    console.log('%c[4] User Data:', styles.section)
    console.log('%cName:   %c' + userData.name, styles.key, styles.value)
    console.log('%cEmail:  %c' + userData.email, styles.key, styles.value)
    console.log('%cRole:   %c' + (userData.role || 'user'), styles.key, styles.value)
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', styles.divider)
    const exp = new Date(payload.exp * 1000)
    console.log('%c[5] Token Expiry:', styles.section)
    console.log('%c' + exp.toLocaleString(), styles.value)
    console.log('%c✅ Login Successful — Token stored in localStorage', styles.success)
    console.groupEnd()
  }

  if (phase === 'logout') {
    console.group('%c🔓 GameKada JWT Logout', styles.title)
    console.log('%c[1] Auth token removed from localStorage', styles.warn)
    console.log('%c[2] User session cleared', styles.warn)
    console.log('%c✅ Logout Successful', styles.success)
    console.groupEnd()
  }

  if (phase === 'wrong_credentials') {
    console.group('%c❌ GameKada Login Failed', styles.title)
    console.log('%c[!] Invalid credentials provided', styles.error)
    console.log('%c[!] No JWT token generated', styles.error)
    console.groupEnd()
  }
}

// ─── Mock user credentials ─────────────────────────────────────
// Test accounts:  admin@gamekada.com / admin123  |  user@gamekada.com / user123
export const MOCK_USERS = [
  { email: 'admin@gamekada.com', password: 'admin123', name: 'Admin User', role: 'admin' },
  { email: 'user@gamekada.com',  password: 'user123',  name: 'Regular User', role: 'user' },
]

export function AuthProvider({ children }) {
  const storedToken = localStorage.getItem('gamekada_token')
  const storedUser  = localStorage.getItem('gamekada_user')

  const defaultUser = {
    name: 'Guest User',
    email: 'guest@example.com',
    memberSince: new Date().getFullYear().toString(),
    totalOrders: 0,
    totalSpent: 0,
    address: 'Not set',
    phone: 'Not set',
  }

  const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : defaultUser)
  const [isAuthenticated, setIsAuthenticated] = useState(!!storedToken)

  const login = (email, password) => {
    const matched = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    )

    if (!matched) {
      logJWTProcess('wrong_credentials')
      return { success: false, message: 'Invalid email or password. Please try again.' }
    }

    const userData = { name: matched.name, email: matched.email, role: matched.role }
    const { token, payload, header } = generateMockJWT(userData)

    localStorage.setItem('gamekada_token', token)
    localStorage.setItem('gamekada_user', JSON.stringify(userData))

    logJWTProcess('login', { token, header, payload, userData })

    setUser(userData)
    setIsAuthenticated(true)
    return { success: true }
  }

  const logout = () => {
    localStorage.removeItem('gamekada_token')
    localStorage.removeItem('gamekada_user')
    logJWTProcess('logout')
    setUser(null)
    setIsAuthenticated(false)
  }

  const value = { user, isAuthenticated, login, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
