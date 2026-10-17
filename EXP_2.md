# Experiment 2: Cart with Context API and LocalStorage

## Overview
Unit 3, Experiment 2 of the GameKada Steam-like e-commerce app. Added cart state management using React Context API and custom hooks, with localStorage persistence. Users can add games to cart, update quantities, remove items, and see order summary with subtotal/discount/delivery/total.

## Stack
- React 19.2.8 + Vite 8.3.0
- React Router DOM 7.18.4
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Lucide React icons
- Context API + custom hooks

## Files Created

### `src/context/CartContext.jsx`
Cart provider with full state management:
- `cartItems` — array of cart items with quantity
- `addToCart(game)` — adds game to cart or increments quantity if already present
- `removeFromCart(id)` — removes item from cart
- `updateQuantity(id, quantity)` — updates item quantity
- `clearCart()` — empties the cart
- `subtotal` — sum of all item prices × quantities
- `discount` — 10% off when subtotal > ₹100
- `delivery` — ₹50 unless subtotal > ₹500 (then FREE)
- `total` — subtotal - discount + delivery
- `itemCount` — total number of items in cart
- localStorage persistence via `useEffect` on `cartItems` changes

```jsx
import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const storedCart = localStorage.getItem('gamekada_cart')
  const initialCart = storedCart ? JSON.parse(storedCart) : []

  const [cartItems, setCartItems] = useState(initialCart)

  // Persist cart to localStorage whenever it changes
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

  // Derived values
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

### `src/hooks/useCart.js`
Re-export hook that throws if used outside CartProvider (safety guard).

```jsx
export function useCart() {
  throw new Error('useCart must be used within a CartProvider. Import from src/context/CartContext instead.')
}
```

### `src/utils/helpers.js`
Currency formatting helper for INR.

```jsx
export function formatINR(amount) {
  return amount.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
```

### `src/pages/CartPage.jsx`
Cart page with two layouts:
- **Empty cart**: Shows shopping cart icon, "Your cart is empty" message, and "Browse Games" button
- **With items**: Two-column layout — left side shows cart items with product image, title, genre, price, quantity controls (minus/plus), remove button, and line total; right side shows order summary with subtotal, discount, delivery, and grand total, plus "Proceed to Checkout" button

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
      <main className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto text-center">
          <ShoppingCart size={64} className="mx-auto text-gray-300 mb-6" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Looks like you haven't added any games yet.</p>
          <button
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            onClick={() => navigate('/products')}
          >
            Browse Games
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Cart ({itemCount})</h1>
          <button
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            onClick={clearCart}
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 items-start rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-24 h-32 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                  <span className="text-sm font-medium text-indigo-600">{item.genre}</span>
                  <span className="block mt-1 text-sm text-gray-500">
                    {formatINR(item.price)} each
                  </span>
                  <div className="mt-4 flex items-center gap-4">
                    <button
                      onClick={() => handleUpdate(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-medium text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdate(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="ml-4 text-sm text-red-600 hover:underline"
                      aria-label={`Remove ${item.title}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <span className="mt-2 text-lg font-bold text-slate-900 block">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <aside className="lg:col-span-1 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Order Summary</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-slate-900">{formatINR(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount (10%)</span>
                  <span className="font-medium text-green-600">-{formatINR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery</span>
                <span className="font-medium text-slate-900">
                  {delivery === 0 ? 'FREE' : formatINR(delivery)}
                </span>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between text-lg font-bold text-slate-900">
                <span>Total</span>
                <span>{formatINR(total)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Orders over ₹100 get 10% off. Free delivery on orders over ₹500.
              </p>
            </div>
            <button
              className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors mt-4"
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

### `src/components/Navbar.jsx` (updated)
Now uses `useCart()` to display real item count badge on cart icon. Badge only shows when `itemCount > 0`.

### `src/components/ProductCard.jsx` (updated)
Now uses `useCart()` `addToCart` function. Added "Add to Cart" button (hidden when out of stock). Clicking adds the game to cart or increments quantity.

### `src/App.jsx` (updated)
- Wrapped app in `<CartProvider>` so all components can access cart context
- Added `/cart` route mapping to `CartPage`

## Routes
| Path | Component | Description |
|------|-----------|-------------|
| `/` | Home | Landing page with hero and featured games |
| `/products` | Products | Full catalog with search, filters, sorting, Add to Cart buttons |
| `/products/:id` | ProductDetail | Individual game details page with Add to Cart |
| `/cart` | CartPage | Cart with quantity controls, order summary, checkout flow |

## Design Decisions
- **Context API**: Chosen over Redux/Zustand for Unit 3 simplicity — matches the md file's experiment spec
- **localStorage persistence**: Cart survives page refreshes and browser restarts
- **useCallback**: All cart operations use `useCallback` with empty deps for stable handler identity
- **useMemo**: Derived values (subtotal, discount, delivery, total, itemCount) memoized to avoid recalculation
- **Discount rule**: 10% off orders over ₹100
- **Delivery rule**: ₹50 unless subtotal over ₹500 (then FREE)

## GitHub
Pushed to: https://github.com/AbisheakSaravanan/GameKada-GameShop

## Screenshots
- Homepage: `Pictures/GameKada/exp2/` — captured at `http://localhost:5173/`
- Cart (empty): `Pictures/GameKada/exp2/cart-empty.png` — captured at `http://localhost:5173/cart`

## Next Experiment (Unit 3, Exp 3)
Add full routing: `/checkout`, `/login`, `/orders` with nested routes `/orders/current`, `/orders/history`. Link/NavLink navigation, useParams for product details, useNavigate for cart→checkout flow.
