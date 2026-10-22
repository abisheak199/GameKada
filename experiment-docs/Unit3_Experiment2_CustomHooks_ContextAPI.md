# Unit 3 - Experiment 2: Custom Hooks & Context API

## Components
- ProductCard
- ProductList (Products page)
- CartPage
- CheckoutPage
- Navbar (shows cart count)

## Code

### src/hooks/useProducts.js (Custom hook extracted from useGames)
```jsx
import { useState, useMemo, useEffect, useCallback } from 'react'
import { games as localGames, GENRES as localGenres, PLATFORMS as localPlatforms } from '../data/games'
import { fetchGames, fetchGenres, fetchPlatforms, mapRawgGameToInternal, isApiConfigured } from '../api/games'

export function useProducts() {
  const [search, setSearch] = useState('')
  const [genreFilter, setGenreFilter] = useState('all')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [priceFilter, setPriceFilter] = useState(Infinity)
  const [sortBy, setSortBy] = useState('name')
  const [dataSource, setDataSource] = useState(
    import.meta.env.VITE_DATA_SOURCE || 'local'
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const [allGames, setAllGames] = useState(localGames)
  const [GENRES, setGenres] = useState(localGenres)
  const [PLATFORMS, setPlatforms] = useState(localPlatforms)

  useEffect(() => {
    const loadGames = async () => {
      const source = import.meta.env.VITE_DATA_SOURCE || 'local'
      setDataSource(source)

      if (source === 'api' && isApiConfigured()) {
        setIsLoading(true)
        setError(null)
        try {
          const response = await fetchGames({ page_size: 40 })
          const mappedGames = response.results.map(mapRawgGameToInternal)
          setAllGames(mappedGames)

          const genres = await fetchGenres()
          setGenres(genres.map((g) => g.name))

          const platforms = await fetchPlatforms()
          setPlatforms(platforms.map((p) => p.name))
        } catch (err) {
          console.warn('[GameKada] RAWG API failed, falling back to local data:', err.message)
          setAllGames(localGames)
          setGenres(localGenres)
          setPlatforms(localPlatforms)
          setError(null)
        } finally {
          setIsLoading(false)
        }
      } else {
        setAllGames(localGames)
        setGenres(localGenres)
        setPlatforms(localPlatforms)
      }
    }

    loadGames()
  }, [])

  const MAX_PRICE = useMemo(() => {
    if (allGames.length === 0) return 0
    return Math.max(...allGames.map((g) => g.price))
  }, [allGames])

  const MIN_PRICE = useMemo(() => {
    if (allGames.length === 0) return 0
    return Math.min(...allGames.map((g) => g.price))
  }, [allGames])

  const filteredGames = useMemo(() => {
    const maxPrice = priceFilter === Infinity ? MAX_PRICE : priceFilter
    return allGames
      .filter((g) => {
        const matchesSearch = g.title
          .toLowerCase()
          .includes(search.toLowerCase())
        const matchesGenre =
          genreFilter === 'all' || g.genre === genreFilter
        const matchesPlatform =
          platformFilter === 'all' || g.platform === platformFilter
        const matchesPrice = g.price <= maxPrice
        return matchesSearch && matchesGenre && matchesPlatform && matchesPrice
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.title.localeCompare(b.title)
        if (sortBy === 'price-low') return a.price - b.price
        if (sortBy === 'price-high') return b.price - a.price
        if (sortBy === 'rating') return b.rating - a.rating
        return 0
      })
  }, [allGames, search, genreFilter, platformFilter, priceFilter, sortBy, MAX_PRICE])

  const filters = useMemo(() => ({
    search,
    setSearch,
    genreFilter,
    setGenreFilter,
    platformFilter,
    setPlatformFilter,
    priceFilter,
    setPriceFilter,
    sortBy,
    setSortBy,
  }), [search, genreFilter, platformFilter, priceFilter, sortBy])

  return {
    games: filteredGames,
    allGames,
    GENRES,
    PLATFORMS,
    MAX_PRICE,
    MIN_PRICE,
    ...filters,
    dataSource,
    isLoading,
    error,
  }
}
```

### src/hooks/useCart.js (Custom hook for cart operations)
```jsx
import { useContext } from 'react'
import { CartContext } from '../context/CartContext'

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
```

### src/context/CartContext.jsx
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

  const [orders, setOrders] = useState([])
  const [wishlist, setWishlist] = useState([])

  const addToWishlist = useCallback((game) => {
    setWishlist((prev) => {
      if (prev.some((item) => item.id === game.id)) return prev
      return [...prev, { ...game }]
    })
  }, [])

  const removeFromWishlist = useCallback((id) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const placeOrder = useCallback((orderData) => {
    const order = {
      id: 'ORD-' + Date.now(),
      date: new Date().toISOString(),
      status: 'Processing',
      ...orderData,
      items: cartItems.map((item) => ({
        id: item.id,
        title: item.title,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      })),
    }
    setOrders((prev) => [order, ...prev])
    localStorage.setItem('gamekada_orders', JSON.stringify([order, ...prev]))
    clearCart()
    return order
  }, [cartItems, clearCart])

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
    placeOrder,
    orders,
    setOrders,
    wishlist,
    addToWishlist,
    removeFromWishlist,
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

### src/components/Navbar.jsx (Uses CartContext for item count)
```jsx
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Heart, LogIn, LogOut, User } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { itemCount, wishlist } = useCart()
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const wishlistCount = wishlist.length

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-slate-100">
            <span className="bg-indigo-600 text-white px-2 py-1 rounded">GK</span>
            GameKada
          </Link>

          <div className="flex items-center gap-3">

            <Link
              to="/wishlist"
              className="relative flex items-center text-slate-400 hover:text-indigo-400 transition-colors p-1"
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="relative flex items-center text-slate-400 hover:text-indigo-400 transition-colors p-1"
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2 ml-1">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:border-indigo-500 hover:text-indigo-400 transition-all text-sm"
                  aria-label="Profile"
                >
                  <User size={15} />
                  <span className="hidden sm:inline max-w-[100px] truncate">{user?.name}</span>
                </Link>
                <button
                  id="navbar-logout-btn"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 hover:border-red-400 transition-all text-sm font-medium"
                  aria-label="Log out"
                >
                  <LogOut size={15} />
                  <span className="hidden sm:inline">Log Out</span>
                </button>
              </div>
            ) : (
              <Link
                id="navbar-login-btn"
                to="/login"
                className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 active:scale-95 transition-all text-sm font-semibold ml-1"
                aria-label="Log in"
              >
                <LogIn size={15} />
                Log In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
```

### src/pages/CartPage.jsx
```jsx
import { useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatINR } from '../utils/helpers'

export default function CartPage() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discount,
    delivery,
    total,
    itemCount,
  } = useCart()
  const navigate = useNavigate()
  const handleRemove = (id) => removeFromCart(id)
  const handleUpdate = (id, qty) => updateQuantity(id, qty)

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto text-center">
          <ShoppingCart size={64} className="mx-auto text-slate-300 mb-6" />
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Your cart is empty</h1>
          <p className="text-slate-400 mb-8">Looks like you haven't added any games yet.</p>
          <button
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors"
            onClick={() => navigate('/products')}
          >
            Browse Games
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-100">Cart ({itemCount})</h1>
          <button
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            onClick={clearCart}
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 items-start rounded-lg border border-slate-700 bg-slate-800 p-4 hover:shadow-lg transition-shadow">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-24 h-32 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-100">{item.title}</h3>
                  <span className="text-sm font-medium text-indigo-600">{item.genre}</span>
                  <span className="block mt-1 text-sm text-slate-400">
                    {formatINR(item.price)} each
                  </span>
                  <div className="mt-4 flex items-center justify-center gap-4">
                    <button
                      onClick={() => handleUpdate(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 rounded border border-slate-700 flex items-center justify-center hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} className="self-center" />
                    </button>
                    <span className="w-8 text-center font-medium text-slate-100">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdate(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded border border-slate-700 flex items-center justify-center hover:bg-slate-700"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} className="self-center" />
                    </button>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="ml-4 text-sm text-red-600 hover:underline"
                      aria-label={`Remove ${item.title}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <span className="mt-2 text-lg font-bold text-slate-100 block">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <aside className="lg:col-span-1 rounded-lg border border-slate-700 bg-slate-800 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-100 mb-6">Order Summary</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="font-medium text-slate-100">{formatINR(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Discount (10%)</span>
                  <span className="font-medium text-green-400">-{formatINR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Delivery</span>
                <span className="font-medium text-slate-100">
                  {delivery === 0 ? 'FREE' : formatINR(delivery)}
                </span>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-700">
              <div className="flex justify-between text-lg font-bold text-slate-100">
                <span>Total</span>
                <span>{formatINR(total)}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Orders over ₹100 get 10% off. Free delivery on orders over ₹500.
              </p>
            </div>
            <button
              className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors mt-4"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </button>
          </aside>
        </div>
      </div>
    </main>
  )
}
```