import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth, MOCK_USERS } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [alertMessage, setAlertMessage] = useState(null) // { type: 'error'|'success', text: '' }

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

  // ─── Login submit ───────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setIsLoading(true)
    setAlertMessage(null)

    // Simulate async auth call
    setTimeout(() => {
      const result = login(formData.email, formData.password)
      setIsLoading(false)

      if (result.success) {
        setAlertMessage({ type: 'success', text: '✅ Login successful! Redirecting...' })
        setTimeout(() => navigate('/'), 1000)
      } else {
        setAlertMessage({ type: 'error', text: result.message })
        // Also show browser alert for visibility
        alert(`⚠️ Login Failed\n\n${result.message}`)
      }
    }, 800)
  }

  // ─── Quick fill from demo accounts ─────────────────────────────
  const fillDemo = (user) => {
    setFormData({ email: user.email, password: user.password })
    setErrors({})
    setAlertMessage(null)
  }

  return (
    <main className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-xl">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100">Welcome Back</h1>
            <p className="text-slate-400 mt-1 text-sm">Sign in to your GameKada account</p>
          </div>

          {/* Alert Banner */}
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

          {/* Demo account shortcuts */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className={`w-full px-3 py-2.5 bg-slate-700 border rounded-lg text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors ${
                  errors.email ? 'border-red-500' : 'border-slate-600'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
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

            {/* ─── Login Button (separate, prominent) ──────────────── */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm tracking-wide mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Authenticating...
                </span>
              ) : (
                '🔐 Log In'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/" className="text-indigo-400 hover:text-indigo-300 hover:underline font-medium">
              Browse as guest
            </Link>
          </p>

          {/* JWT hint */}
          <p className="mt-3 text-center text-xs text-slate-600">
            🔍 Open DevTools → Console to inspect JWT token
          </p>
        </div>
      </div>
    </main>
  )
}
