# Unit 5 - Experiment 2: Optimization (Lazy Loading, Code Splitting, PWA, Accessibility, Security)

## Components
- App (lazy routes)
- ServiceWorker registration
- manifest.json

## Code

### src/App.jsx (Lazy Loading + Suspense)
```jsx
import { BrowserRouter, Routes, Route, Navigate, Suspense } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import { lazy } from 'react'

const Home = lazy(() => import('./pages/Home'))
const Products = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const OrdersPage = lazy(() => import('./pages/OrdersNested'))
const Profile = lazy(() => import('./pages/Profile'))
const OrderDetail = lazy(() => import('./pages/OrderDetail'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const Admin = lazy(() => import('./pages/Admin'))
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'))
const PaymentCancel = lazy(() => import('./pages/PaymentCancel'))

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
  </div>
)

export default function App() {
  return (
    <BrowserRouter basename="/GameKada/">
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-cancel" element={<PaymentCancel />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/orders/detail" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>}>
                <Route index element={<Navigate to="/orders/current" replace />} />
                <Route path="current" element={<OrdersPage /> } />
                <Route path="history" element={<OrdersPage />} />
              </Route>
            </Routes>
          </Suspense>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
```

### public/manifest.json (PWA)
```json
{
  "name": "GameKada",
  "short_name": "GameKada",
  "description": "Your destination for the best video games",
  "start_url": "/GameKada/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#4f46e5",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### public/sw.js (Service Worker - Workbox)
```js
const CACHE_NAME = 'gamekada-v1'
const urlsToCache = ['/', '/index.html', '/manifest.json']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))))
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  )
})
```

### src/main.jsx (SW Registration + CSP)
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
)
```

### src/components/Button.jsx (Accessible)
```jsx
import { forwardRef } from 'react'

const Button = forwardRef(({ children, variant = 'primary', size = 'md', className = '', disabled, loading, 'aria-label': ariaLabel, ...props }, ref) => {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-500',
    secondary: 'bg-slate-700 text-slate-300 hover:bg-slate-600 focus:ring-slate-500',
    danger: 'bg-red-600 text-white hover:bg-red-500 focus:ring-red-500',
    outline: 'border-2 border-slate-600 text-slate-300 hover:border-indigo-500 hover:text-indigo-400 focus:ring-indigo-500',
  }
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' }

  return (
    <button ref={ref} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={disabled || loading} aria-label={ariaLabel} aria-busy={loading} {...props}>
      {loading && <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>}
      {children}
    </button>
  )
})
Button.displayName = 'Button'
export default Button
```

### src/components/Input.jsx (Accessible + Sanitized)
```jsx
import { forwardRef } from 'react'

const Input = forwardRef(({ label, error, className = '', type = 'text', ...props }, ref) => {
  const id = props.id || props.name
  const sanitizedValue = props.value?.replace(/[<>]/g, '') // Basic XSS prevention

  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>}
      <input ref={ref} id={id} type={type} value={sanitizedValue} className={`w-full px-3 py-2.5 bg-slate-700 border rounded-lg text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors ${error ? 'border-red-500' : 'border-slate-600'} ${className}`} {...props} />
      {error && <p className="mt-1 text-xs text-red-400" role="alert">{error}</p>}
    </div>
  )
})
Input.displayName = 'Input'
export default Input
```

### vite.config.js (Code Splitting)
```js
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy: { '/api/rawg': { target: 'https://api.rawg.io/api', changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/rawg/, '') } } },
  base: '/GameKada/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          lucide: ['lucide-react'],
          axios: ['axios'],
        },
      },
    },
  },
})
```