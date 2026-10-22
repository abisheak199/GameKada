# Unit 3 - Experiment 3: React Router Navigation

## Components
- App (main routing)
- Navbar (Link/NavLink navigation)
- Home
- Products
- ProductDetail (dynamic route /products/:id)
- CartPage
- CheckoutPage (protected)
- LoginPage
- OrdersPage (nested routes)
- OrdersCurrent
- OrdersHistory
- ProtectedRoute

## Code

### src/App.jsx
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
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentCancel from './pages/PaymentCancel'
import Profile from './pages/Profile'
import OrderDetail from './pages/OrderDetail'
import Wishlist from './pages/Wishlist'
import Admin from './pages/Admin'
import './App.css'

export default function App() {
  return (
    <BrowserRouter basename="/GameKada-GameShop/">
      <AuthProvider>
        <CartProvider>
          <Navbar />
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

### src/components/Navbar.jsx (Navigation with Link/NavLink)
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

### src/pages/ProductDetail.jsx (Dynamic routing with useParams)
```jsx
import { useParams } from 'react-router-dom'
import { useGames } from '../hooks/useGames'
import { Star, ShoppingCart } from 'lucide-react'

export default function ProductDetail() {
  const { id } = useParams()
  const { games: allGames } = useGames()

  const game = allGames.find((g) => g.id === Number(id))

  if (!game) {
    return (
      <main className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-slate-100">Game Not Found</h1>
          <p className="text-slate-400 mt-2">The game you are looking for does not exist.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <nav className="mb-6 text-sm text-slate-400">
          <span className="text-indigo-400 cursor-pointer hover:underline">Home</span>
          <span className="mx-2 text-slate-500">{'>'}</span>
          <span className="text-indigo-400 cursor-pointer hover:underline">Games</span>
          <span className="mx-2 text-slate-500">{'>'}</span>
          <span className="text-slate-100 font-medium">{game.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-[3/4] overflow-hidden rounded-xl border border-slate-700 bg-slate-700">
            <img
              src={game.image}
              alt={game.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-baseline gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-indigo-400 bg-indigo-500/20 rounded">
                {game.genre}
              </span>
              <span className="text-xs font-medium text-slate-400">{game.platform}</span>
            </div>

            <h1 className="text-3xl font-bold text-slate-100">{game.title}</h1>

            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-2xl font-bold text-slate-100">
                ₹{game.price.toLocaleString('en-IN')}
              </span>
              <span className="text-sm text-slate-400">{game.releaseYear}</span>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <Star size={18} className="text-amber-400 fill-amber-400" />
              <span className="font-medium">{game.rating} / 5.0</span>
            </div>

            <div className="pt-6 border-t border-slate-700">
              <h3 className="text-lg font-semibold text-slate-100 mb-3">Description</h3>
              <p className="text-slate-400 leading-relaxed">{game.description}</p>
            </div>

            <button className="w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2">
              <ShoppingCart size={18} />
              Add to Cart
            </button>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-700">
          <h2 className="text-xl font-bold text-slate-100 mb-6">Tags</h2>
          <div className="flex gap-2">
            {game.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 text-sm font-medium text-slate-300 bg-slate-700 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
```

### src/pages/OrdersNested.jsx (Nested routing with Outlet)
```jsx
import { Link, useNavigate, Outlet } from 'react-router-dom'
import { Clock, Mail } from 'lucide-react'
import OrderCard from '../components/OrderCard'
import { useCart } from '../context/CartContext'

export default function OrdersPage() {
  return <Outlet />
}

export function OrdersCurrent() {
  const navigate = useNavigate()
  const { orders } = useCart()

  const currentOrders = orders.filter(
    (o) => o.status !== 'Delivered' && o.status !== 'Cancelled'
  )

  return (
    <main className="min-h-screen bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-100">Current Orders</h1>
          <Link
            to="/products"
            className="px-4 py-2 text-sm font-medium text-indigo-400 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Clock size={14} className="mr-2" /> Browse Games
          </Link>
        </div>

        {currentOrders.length === 0 ? (
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-sm text-center py-20">
            <Clock className="mx-auto h-12 w-12 text-slate-500 mb-4" />
            <h2 className="text-lg font-bold text-slate-100 mb-2">No current orders</h2>
            <p className="text-slate-400">
              Your placed orders will appear here once you complete checkout.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export function OrdersHistory() {
  const { orders } = useCart()

  const historyOrders = orders.filter(
    (o) => o.status === 'Delivered' || o.status === 'Cancelled'
  )

  return (
    <main className="min-h-screen bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-100 mb-8">Order History</h1>

        {historyOrders.length === 0 ? (
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-sm text-center py-20">
            <Mail className="mx-auto h-12 w-12 text-slate-500 mb-4" />
            <h2 className="text-lg font-bold text-slate-100 mb-2">No past orders</h2>
            <p className="text-slate-400">
              Your completed orders will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {historyOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
```

### src/pages/CheckoutPage.jsx (Programmatic navigation with useNavigate)
```jsx
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Shield, CreditCard, Truck } from 'lucide-react'
import PaymentForm from '../components/PaymentForm'
import { useCart } from '../context/CartContext'
import { useState } from 'react'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { cartItems, total, placeOrder } = useCart()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
  })
  const [errors, setErrors] = useState({})
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [paymentError, setPaymentError] = useState(null)

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
  }

  const validateStep = (currentStep) => {
    const newErrors = {}
    if (currentStep === 1) {
      if (!formData.name) newErrors.name = 'Full name is required'
      if (!formData.email) newErrors.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email address'
      }
      if (!formData.address) newErrors.address = 'Delivery address is required'
      if (!formData.city) newErrors.city = 'City is required'
      if (!formData.postalCode) newErrors.postalCode = 'Postal code is required'
      if (!formData.phone) newErrors.phone = 'Phone number is required'
    }
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (step === 1) {
      const validationErrors = validateStep(1)
      setErrors(validationErrors)
      if (Object.keys(validationErrors).length === 0) {
        setStep(2)
      }
    } else if (step === 2) {
      setIsLoading(true)
      setPaymentError(null)
      setTimeout(() => {
        setIsLoading(false)
        setStep(3)
      }, 1000)
    } else {
      placeOrder({
        customerName: formData.name,
        customerEmail: formData.email,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        phone: formData.phone,
        total,
        paymentStatus: 'Paid',
      })
      navigate('/orders/current')
    }
  }

  const goBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handlePaymentSuccess = (paymentId) => {
    const order = placeOrder({
      customerName: formData.name,
      customerEmail: formData.email,
      address: formData.address,
      city: formData.city,
      postalCode: formData.postalCode,
      phone: formData.phone,
      total,
      paymentStatus: 'Paid',
      paymentId,
    })
    navigate(`/payment-success?paymentId=${paymentId}&orderId=${order.id}&amount=${total}`)
  }

  const handlePaymentCancel = () => {
    navigate(`/payment-cancel?error=${encodeURIComponent('Payment was cancelled. No charges were made.')}`)
  }

  if (step === 3) {
    return (
      <main className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <Shield className="mx-auto h-12 w-12 text-green-400 mb-4" />
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Order Confirmed!</h1>
          <p className="text-slate-400 mb-8">Thank you for your purchase. Your games are ready to download.</p>
          <Link
            to="/orders/current"
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors"
          >
            View Orders
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step >= s
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {s}
              </div>
              {s < 3 && <div className={`h-1 mx-2 ${step > s ? 'bg-indigo-600' : 'bg-slate-700'}`} />}
              <span className={`text-sm font-medium ${step >= s ? 'text-indigo-400' : 'text-slate-500'}`}>
                {s === 1 ? 'Details' : s === 2 ? 'Payment' : 'Complete'}
              </span>
            </div>
          ))}
        </div>

        {step === 1 && (
          <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl border border-slate-700 p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-100 mb-4">Delivery Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    errors.name ? 'border-red-500' : 'border-slate-700'
                  }`}
                  placeholder="John Doe"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    errors.email ? 'border-red-500' : 'border-slate-700'
                  }`}
                  placeholder="you@example.com"
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Delivery Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                  errors.address ? 'border-red-500' : 'border-slate-700'
                }`}
                placeholder="123 Street, Area"
              />
              {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    errors.city ? 'border-red-500' : 'border-slate-700'
                  }`}
                  placeholder="City"
                />
                {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    errors.postalCode ? 'border-red-500' : 'border-slate-700'
                  }`}
                  placeholder="110001"
                />
                {errors.postalCode && <p className="mt-1 text-xs text-red-600">{errors.postalCode}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    errors.phone ? 'border-red-500' : 'border-slate-700'
                  }`}
                  placeholder="+91 98765 43210"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
              </div>
            </div>
            <div className="flex justify-between items-center pt-6 border-t border-slate-700">
              <button
                type="button"
                onClick={goBack}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-3 text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-indigo-600`}
              >
                Continue to Payment
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-100 mb-6">Payment</h2>
            <PaymentForm
              amount={total}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
            {paymentError && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {paymentError}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
```