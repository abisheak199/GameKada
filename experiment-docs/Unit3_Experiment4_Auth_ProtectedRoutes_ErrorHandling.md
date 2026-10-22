# Unit 3 - Experiment 4: Authentication, Protected Routes & Error Handling

## Components
- AuthContext (Context API for auth)
- LoginPage (controlled form)
- ProtectedRoute (HOC for route protection)
- ErrorBoundary (class component for error handling)
- Button (reusable)
- Input (reusable)
- ProductCard (reusable)
- Loading (reusable)

## Code

### src/context/AuthContext.jsx
```jsx
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

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
    exp: now + 60 * 60 * 24,
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
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', styles.divider)
    console.log('%c[1] Raw JWT Token:', styles.section)
    console.log('%c' + token, 'color:#a78bfa;word-break:break-all;')
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', styles.divider)
    console.log('%c[2] Decoded Header:', styles.section)
    console.table(header)
    console.log('%c[3] Decoded Payload:', styles.section)
    console.table(payload)
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', styles.divider)
    console.log('%c[4] User Data:', styles.section)
    console.log('%cName:   %c' + userData.name, styles.key, styles.value)
    console.log('%cEmail:  %c' + userData.email, styles.key, styles.value)
    console.log('%cRole:   %c' + (userData.role || 'user'), styles.key, styles.value)
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', styles.divider)
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
```

### src/components/ProtectedRoute.jsx
```jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
```

### src/components/ErrorBoundary.jsx
```jsx
import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo })
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-xl">
            <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100 mb-2">Something went wrong</h1>
            <p className="text-slate-400 mb-6">
              An unexpected error occurred. Please try again or contact support.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-6 p-4 bg-slate-900 rounded-lg border border-slate-700">
                <summary className="text-sm font-medium text-slate-400 cursor-pointer">Error Details</summary>
                <pre className="mt-2 text-xs text-slate-300 overflow-auto max-h-64">
                  {this.state.error && this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleRetry}
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <RefreshCw size={16} /> Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
```

### src/components/Loading.jsx
```jsx
import { Loader2 } from 'lucide-react'

export default function Loading({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <Loader2 size={32} className="text-indigo-400 animate-spin" />
      <p className="text-slate-400">{message}</p>
    </div>
  )
}
```

### src/components/Button.jsx
```jsx
import { forwardRef } from 'react'

const Button = forwardRef(({ children, variant = 'primary', size = 'md', className = '', disabled, loading, ...props }, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-500',
    secondary: 'bg-slate-700 text-slate-300 hover:bg-slate-600 focus:ring-slate-500',
    danger: 'bg-red-600 text-white hover:bg-red-500 focus:ring-red-500',
    ghost: 'bg-transparent text-slate-300 hover:bg-slate-800 focus:ring-slate-500',
    outline: 'border-2 border-slate-600 text-slate-300 hover:border-indigo-500 hover:text-indigo-400 focus:ring-indigo-500',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  }

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  )
})

Button.displayName = 'Button'
export default Button
```

### src/components/Input.jsx
```jsx
import { forwardRef } from 'react'

const Input = forwardRef(({ label, error, className = '', type = 'text', ...props }, ref) => {
  const id = props.id || props.name

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        type={type}
        className={`
          w-full px-3 py-2.5 bg-slate-700 border rounded-lg text-slate-100 placeholder-slate-500
          focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors
          ${error ? 'border-red-500' : 'border-slate-600'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
          <span className="w-3 h-3" style={{ background: 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2IiBmaWxsPSJub25lIj48cGF0aCBkPSJNNCA0TDEyIDEyTTEyIDRMMCAxMiIgc3Ryb2tlPSIjZjg3MTcxIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==) center/contain no-repeat' }} />
          {error}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'
export default Input
```

### src/pages/LoginPage.jsx (Controlled form with validation)
```jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth, MOCK_USERS } from '../context/AuthContext'
import Button from '../components/Button'
import Input from '../components/Input'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [alertMessage, setAlertMessage] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
    if (alertMessage) setAlertMessage(null)
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.email) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Invalid email address'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters'
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setIsLoading(true)
    setAlertMessage(null)

    setTimeout(() => {
      const result = login(formData.email, formData.password)
      setIsLoading(false)

      if (result.success) {
        setAlertMessage({ type: 'success', text: '✅ Login successful! Redirecting...' })
        setTimeout(() => navigate('/'), 1000)
      } else {
        setAlertMessage({ type: 'error', text: result.message })
        alert(`⚠️ Login Failed\n\n${result.message}`)
      }
    }, 800)
  }

  const fillDemo = (user) => {
    setFormData({ email: user.email, password: user.password })
    setErrors({})
    setAlertMessage(null)
  }

  return (
    <main className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-xl">

          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100">Welcome Back</h1>
            <p className="text-slate-400 mt-1 text-sm">Sign in to your GameKada account</p>
          </div>

          {alertMessage && (
            <div
              className={`flex items-start gap-3 px-4 py-3 rounded-lg mb-5 text-sm font-medium border ${
                alertMessage.type === 'error'
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : 'bg-green-500/10 border-green-500/30 text-green-400'
              }`}
            >
              {alertMessage.type === 'error' ? (
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
              ) : (
                <CheckCircle size={18} className="mt-0.5 shrink-0" />
              )}
              <span>{alertMessage.text}</span>
            </div>
          )}

          <div className="mb-6">
            <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">
              Demo Accounts
            </p>
            <div className="flex gap-2">
              {MOCK_USERS.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => fillDemo(u)}
                  className="flex-1 py-2 px-3 text-xs rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-indigo-500 transition-all font-medium"
                >
                  {u.role === 'admin' ? '🛡️ Admin' : '👤 User'}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="login-email"
              type="email"
              name="email"
              label="Email Address"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email}
            />

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full px-3 py-2.5 bg-slate-700 border rounded-lg text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors pr-10 ${
                    errors.password ? 'border-red-500' : 'border-slate-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.password}
                </p>
              )}
            </div>

            <Button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              loading={isLoading}
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm tracking-wide mt-2"
            >
              {isLoading ? 'Authenticating...' : '🔐 Log In'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/" className="text-indigo-400 hover:text-indigo-300 hover:underline font-medium">
              Browse as guest
            </Link>
          </p>

          <p className="mt-3 text-center text-xs text-slate-600">
            🔍 Open DevTools → Console to inspect JWT token
          </p>
        </div>
      </div>
    </main>
  )
}
```

### src/main.jsx (App wrapped with ErrorBoundary)
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
)
```