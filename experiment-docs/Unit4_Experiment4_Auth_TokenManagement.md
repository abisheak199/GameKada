# Unit 4 - Experiment 4: Auth & Token Management

## Components
- AuthContext (with Axios interceptors)
- LoginPage (API login)
- ProtectedRoute
- api/client.js (Axios instance with interceptors)

## Code

### src/api/client.js
```js
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || ''

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gamekada_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('gamekada_token')
      localStorage.removeItem('gamekada_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
```

### src/api/auth.js
```js
import api from './client'

export const loginAPI = async (email, password) => {
  const res = await api.post('/auth/login', { email, password })
  return res.data // { token, user }
}

export const registerAPI = async (data) => {
  const res = await api.post('/auth/register', data)
  return res.data
}

export const refreshTokenAPI = async () => {
  const res = await api.post('/auth/refresh')
  return res.data
}

export const logoutAPI = async () => {
  await api.post('/auth/logout')
}
```

### src/context/AuthContext.jsx (with API)
```jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { loginAPI, logoutAPI, refreshTokenAPI } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('gamekada_token')
      const storedUser = localStorage.getItem('gamekada_user')
      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser))
          setIsAuthenticated(true)
        } catch {
          localStorage.removeItem('gamekada_token')
          localStorage.removeItem('gamekada_user')
        }
      }
      setIsLoading(false)
    }
    initAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const { token, user: userData } = await loginAPI(email, password)
      localStorage.setItem('gamekada_token', token)
      localStorage.setItem('gamekada_user', JSON.stringify(userData))
      setUser(userData)
      setIsAuthenticated(true)
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' }
    }
  }

  const logout = async () => {
    try { await logoutAPI() } catch {}
    localStorage.removeItem('gamekada_token')
    localStorage.removeItem('gamekada_user')
    setUser(null)
    setIsAuthenticated(false)
  }

  const value = { user, isAuthenticated, login, logout, isLoading }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
```

### src/components/ProtectedRoute.jsx
```jsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" /></div>

  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />

  return children
}
```

### src/pages/LoginPage.jsx (API login)
```jsx
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(form.email, form.password)
    setLoading(false)
    if (result.success) {
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    } else setError(result.message)
  }

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-slate-800 p-8 rounded-xl border border-slate-700 space-y-4">
        <h1 className="text-2xl font-bold text-center">Sign In</h1>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <input name="email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email" className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded" required />
        <input name="password" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Password" className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded" required />
        <button type="submit" disabled={loading} className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 disabled:opacity-50">{loading ? 'Signing in...' : 'Sign In'}</button>
      </form>
    </main>
  )
}
```