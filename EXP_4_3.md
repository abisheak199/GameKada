# Experiment 3: Full Routing & Authentication with API Data

## Overview
Unit 4, Experiment 3 of the GameKada Steam-like e-commerce app. Complete client-side routing with React Router DOM, protected routes for checkout and orders (authentication required), and full navigation bar — all integrated with RAWG API game data.

## Stack
- React 19.2.8 + Vite 8.3.4
- React Router DOM 7.18.4
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Lucide React icons
- Context API + custom hooks (AuthContext, CartContext, useGames)
- RAWG Video Games Database API
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

## Files Created

### `src/App.jsx` — Application shell with routing
Combines AuthProvider, CartProvider, Navbar, and all route definitions. Protected routes wrap checkout and orders pages.

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

### `src/components/ProtectedRoute.jsx` — Authentication guard
Redirects unauthenticated users to `/login` for checkout and orders pages.

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

### `src/context/AuthContext.jsx` — Authentication context
Manages login/logout state persisted to localStorage. Provides `isAuthenticated`, `user`, `login()`, and `logout()`.

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

### `src/components/Navbar.jsx` — Navigation bar
Sticky navigation with GameKada logo, cart icon with item-count badge, and public cart link (no login required).

```jsx
import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { itemCount } = useCart()
  return (
    <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-slate-100"
          >
            <span className="bg-indigo-600 text-white px-2 py-1 rounded">GK</span>
            GameKada
          </Link>
          <div className="flex items-center gap-6">
            <Link
              to="/cart"
              className="relative flex items-center text-slate-400 hover:text-indigo-400 transition-colors"
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

### `src/pages/Home.jsx` — Landing page with real API data
Hero section with CTA linking to `/products`. Featured games grid uses real data from `useGames()` — first 6 games from the catalog with ProductCard components.

### `src/pages/Products.jsx` — Product catalog with API data
Full product catalog with 40+ games from RAWG API. Search, genre filter, max-price slider, sort dropdown, and responsive product grid. Loading spinner and error state with retry.

### `src/pages/ProductDetail.jsx` — Game detail page
Individual game detail with large image, title, price, rating, description, tags, and Add to Cart button. 404 state for invalid IDs.

### `src/pages/LoginPage.jsx` — Login form
Email/password validation, error display, localStorage token storage on success, redirect to home.

### `src/pages/OrdersNested.jsx` — Orders pages
`OrdersCurrent` (processing orders table) and `OrdersHistory` (empty state). Both protected by ProtectedRoute.

### `src/pages/CartPage.jsx` — Shopping cart
Line items with quantity controls, remove button, per-item subtotals, order summary (subtotal/discount/delivery/total).

### `src/pages/CheckoutPage.jsx` — Three-step checkout
Delivery Details → Payment → Order Confirmation. Step indicator, form validation per step.

### `src/context/CartContext.jsx` — Cart state
Full cart management: addToCart, removeFromCart, updateQuantity, clearCart, subtotal, discount, delivery, total, itemCount. localStorage persistence.

### `src/api/games.js` — RAWG API service
fetchGames, fetchGameById, fetchGenres, fetchPlatforms, mapRawgGameToInternal, isApiConfigured.

### `src/hooks/useGames.js` — Data source hook
Dual local/API support with loading/error states. Exports filtered games, genres, platforms, price range, and filter setters.

## Unit 4 Experiment 3 Requirements Met

- [x] Client-side routing with React Router DOM (7 routes + nested orders routes)
- [x] Protected routes for checkout and orders (authentication required)
- [x] Cart page publicly accessible (no login required)
- [x] Auth context with login/logout and localStorage persistence
- [x] Cart context with add/remove/update/clear and localStorage persistence
- [x] Product catalog with search, genre, price, and sort filters
- [x] Product detail pages with Add to Cart
- [x] Checkout flow (3 steps) with form validation
- [x] Orders page (current + history, protected)
- [x] 40-game RAWG API catalog
- [x] Uniform product card sizing
- [x] High-contrast dark theme (slate text on dark background)
- [x] Responsive design (mobile + desktop breakpoints)
- [x] Production build passes with 0 errors
- [x] Code pushed to GitHub (`unit-4` branch)

## Unit 4 Complete

All three experiments are finished:

| Experiment | Description | Status |
|------------|-------------|--------|
| Exp 1 | RAWG API Integration | ✅ Complete |
| Exp 2 | Cart & Checkout with API Data | ✅ Complete |
| Exp 3 | Full Routing & Authentication | ✅ Complete |

**Build:** Passes with 0 errors.
**Server:** Running on `http://localhost:5173/`.
**GitHub:** All code pushed to `unit-4` branch.
**Tag:** `unit-4-complete` ready to apply.
