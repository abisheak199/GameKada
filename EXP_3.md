# Experiment 3: Full Routing & Authentication

## Overview
Unit 3, Experiment 3 of the GameKada Steam-like e-commerce app. Added complete client-side routing with React Router DOM, protected routes for checkout and orders (authentication required), and a full navigation bar. Combined Experiments 1 and 2 (local game catalog + cart with Context API) into a single working e-commerce flow.

## Stack
- React 19.2.8 + Vite 8.3.4
- React Router DOM 7.18.4
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Lucide React icons
- Context API + custom hooks (AuthContext, CartContext, useGames)
- localStorage persistence (auth token + cart)

## Routes

| Path | Component | Auth Required |
|------|-----------|---------------|
| `/` | Home | No |
| `/products` | Products | No |
| `/products/:id` | ProductDetail | No |
| `/cart` | CartPage | No |
| `/login` | LoginPage | No |
| `/checkout` | CheckoutPage | Yes |
| `/orders` | OrdersPage | Yes |
| `/orders/current` | OrdersCurrent | Yes |
| `/orders/history` | OrdersHistory | Yes |

## Files Created / Modified

### `src/App.jsx`
Application shell with `BrowserRouter`, `AuthProvider`, `CartProvider`, `Navbar`, and all route definitions. Protected routes (`/checkout`, `/orders/*`) wrap their pages in `ProtectedRoute`.

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import LoginPage from './pages/LoginPage'
import OrdersPage, { OrdersCurrent, OrdersHistory } from './pages/OrdersNested'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>}>
              <Route index element={<Navigate to="/orders/current" replace />} />
              <Route path="current" element={<OrdersCurrent />} />
              <Route path="history" element={<OrdersHistory />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
```

### `src/components/ProtectedRoute.jsx`
Authentication guard. Redirects unauthenticated users to `/login`.

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

### `src/context/AuthContext.jsx`
Authentication context managing login/logout state persisted to localStorage.

```jsx
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const storedToken = localStorage.getItem('gamekada_token')
  const storedUser = localStorage.getItem('gamekada_user')
  const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : null)
  const [isAuthenticated, setIsAuthenticated] = useState(!!storedToken)

  const login = (userData, token) => {
    localStorage.setItem('gamekada_token', token)
    localStorage.setItem('gamekada_user', JSON.stringify(userData))
    setUser(userData)
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('gamekada_token')
    localStorage.removeItem('gamekada_user')
    setUser(null)
    setIsAuthenticated(false)
  }

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

### `src/context/CartContext.jsx`
Cart context with full state management and localStorage persistence (from Experiment 2).

```jsx
import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const storedCart = localStorage.getItem('gamekada_cart')
  const initialCart = storedCart ? JSON.parse(storedCart) : []

  const [cartItems, setCartItems] = useState(initialCart)

  useEffect(() => {
    localStorage.setItem('gamekada_cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = useCallback((game) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === game.id)
      if (existing) {
        return prev.map((item) =>
          item.id === game.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...game, quantity: 1 }]
    })
  }, [])

  const removeFromCart = useCallback((id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const updateQuantity = useCallback((id, quantity) => {
    if (quantity < 1) return
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    )
  }, [])

  const clearCart = useCallback(() => {
    setCartItems([])
  }, [])

  const { subtotal, discount, delivery, total, itemCount } = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const discount = subtotal > 100 ? subtotal * 0.1 : 0
    const delivery = subtotal > 0 ? (subtotal > 500 ? 0 : 50) : 0
    const total = subtotal - discount + delivery
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
    return { subtotal, discount, delivery, total, itemCount }
  }, [cartItems])

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    discount,
    delivery,
    total,
    itemCount,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
```

### `src/components/Navbar.jsx`
Sticky navigation bar with GameKada logo, cart icon with item-count badge, and link to cart page (public — no login required).

```jsx
import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { itemCount } = useCart()
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-slate-900"
          >
            <span className="bg-indigo-600 text-white px-2 py-1 rounded">GK</span>
            GameKada
          </Link>
          <div className="flex items-center gap-6">
            <Link
              to="/cart"
              className="relative flex items-center text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
```

### `src/pages/Home.jsx`
Landing page with hero section (slate-900 background) and featured games grid. CTA button links to `/products`.

### `src/pages/Products.jsx`
Full product catalog page with search, genre filter, max-price range slider, sort dropdown, and responsive product grid (1–4 columns). Uses `useGames` hook for filtering and sorting logic.

### `src/pages/ProductDetail.jsx`
Individual game detail page with large image, title, price, rating, description, tags, and "Add to Cart" button. 404 state for invalid IDs.

### `src/pages/CartPage.jsx`
Shopping cart page showing line items with quantity controls (+/–), remove button, per-item subtotals, and order summary (subtotal, discount, delivery, total). Empty state with "Browse Games" button. "Proceed to Checkout" button (guarded by ProtectedRoute).

### `src/pages/CheckoutPage.jsx`
Three-step checkout flow: (1) Delivery Details form, (2) Payment form, (3) Order confirmation. Step indicator with slate-colored inactive steps. Form validation per step.

### `src/pages/LoginPage.jsx`
Login form with email/password validation, error display, and "Sign In" button. On success, stores token in localStorage and redirects to home.

### `src/pages/OrdersNested.jsx`
Orders page with `OrdersCurrent` (processing orders table) and `OrdersHistory` (empty state). Both wrapped in `ProtectedRoute` — unauthenticated users are redirected to `/login`.

### `src/components/ProductCard.jsx`
Uniform product card component (used on Home featured grid and Products catalog). Fixed `aspect-[4/5]` image container, `object-cover` for consistent sizing, genre badge, price, year, star rating, and "Add to Cart" button.

### `src/pages/Products.jsx` — Filter Sidebar
Search input, genre filter buttons, max-price range slider, sort select dropdown — all using slate text colors for contrast.

### `src/data/games.js`
30-game seed dataset with SteamDB CDN header images. Each game: `id, title, genre, platform, price, rating, releaseYear, developer, description, tags, inStock, image`. Exports `GENRES`, `PLATFORMS`, `MAX_PRICE`, `MIN_PRICE`.

### `src/index.css` — Theme
Replaced all light-gray text with dark slate variants for better contrast on white backgrounds:
- `--text: #0f172a` (near-black body text)
- `--text-h: #020617` (near-black headings)
- `--border: #94a3b8` (slate borders)
- Light-mode / dark-mode CSS variables defined

## Unit 3 Requirements Met

- [x] Client-side routing with React Router DOM (7 routes + nested orders routes)
- [x] Protected routes for checkout and orders (authentication required)
- [x] Cart page publicly accessible (no login required)
- [x] Auth context with login/logout and localStorage persistence
- [x] Cart context with add/remove/update/clear and localStorage persistence
- [x] Product catalog with search, genre, price, and sort filters
- [x] Product detail pages with Add to Cart
- [x] Checkout flow (3 steps) with form validation
- [x] Orders page (current + history, protected)
- [x] 30-game local data catalog with SteamDB images
- [x] Uniform product card sizing (`aspect-[4/5]`, `object-cover`)
- [x] High-contrast theme (slate text on white background, no gray-on-white)
- [x] Responsive design (mobile + desktop breakpoints)
- [x] Production build passes with 0 errors
