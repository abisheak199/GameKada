# Experiment 2: Cart & Checkout with API Data

## Overview
Unit 4, Experiment 2 of the GameKada Steam-like e-commerce app. Integrated the RAWG API into the shopping cart and checkout flow. Users can add API-fetched games to cart, update quantities, remove items, and proceed through the checkout process with real game data from RAWG.

## Stack
- React 19.2.8 + Vite 8.3.4
- React Router DOM 7.18.4
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Lucide React icons
- Axios (HTTP client)
- RAWG Video Games Database API
- Context API + custom hooks (CartContext, AuthContext, useGames)

## Data Flow — API → Cart → Checkout

```
RAWG API → useGames() → ProductCard "Add to Cart" → CartContext → CartPage → CheckoutPage → OrdersPage
```

## Files Created / Modified

### `src/context/CartContext.jsx` — Updated for API data
Cart context now works with both local and API game data. The `addToCart()` function accepts any game object (local or RAWG-mapped) and stores it with quantity tracking.

```javascript
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

### `src/components/ProductCard.jsx` — API-compatible
ProductCard works with both local games and RAWG-mapped games. The "Add to Cart" button calls `useCart().addToCart(game)`.

```jsx
import { Link } from 'react-router-dom'
import { Star, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function ProductCard({ game }) {
  const { addToCart } = useCart()
  const handleAddToCart = () => addToCart(game)
  return (
    <article className="group flex flex-col h-full rounded-lg border border-slate-700 bg-slate-800 p-4 hover:shadow-lg transition-shadow">
      <div className="aspect-[4/5] overflow-hidden rounded-lg bg-slate-700 mb-3 flex-shrink-0">
        <img
          src={game.image}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <span className="inline-block mb-1 px-2 py-0.5 text-xs font-medium text-indigo-400 bg-indigo-500/20 rounded">
        {game.genre}
      </span>
      <Link
        to={`/products/${game.id}`}
        className="block mb-1 text-lg font-semibold text-slate-100 group-hover:text-indigo-400"
      >
        {game.title}
      </Link>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-lg font-bold text-slate-100">
          ₹{game.price.toLocaleString('en-IN')}
        </span>
        <span className="text-sm text-slate-400">· {game.releaseYear}</span>
      </div>
      <div className="flex items-center gap-1 mb-2">
        <Star size={14} className="text-amber-400 fill-amber-400" />
        <span className="text-sm font-medium text-slate-300">
          {game.rating}
        </span>
      </div>
      <button
        onClick={handleAddToCart}
        className="w-full mt-auto px-3 py-2 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-500 transition-colors"
      >
        <ShoppingCart size={14} className="mr-1" /> Add to Cart
      </button>
    </article>
  )
}
```

### `src/pages/CartPage.jsx` — Cart with API data
Displays cart items with quantity controls, remove button, per-item subtotals, and order summary. Works with API-fetched game data.

Key features:
- Cart items with `game.title`, `game.price`, `game.image`, `game.genre`
- Quantity increment/decrement buttons
- Remove item button
- Order summary: subtotal, 10% discount (orders over ₹100), delivery (free over ₹500), total
- "Proceed to Checkout" button (guarded by ProtectedRoute — requires authentication)
- Empty state with "Browse Games" button

### `src/pages/CheckoutPage.jsx` — Checkout with API data
Three-step checkout flow:
1. **Delivery Details** — Name, email, address, city, postal code, phone
2. **Payment** — Card number, expiry, CVV
3. **Confirmation** — Order confirmed, redirect to orders page

Step indicator shows progress. Form validation per step. All fields use slate colors for dark theme contrast.

### `src/pages/OrderNested.jsx` — Orders with API data
- **OrdersCurrent** — Processing orders table with order ID, date, status, total, items
- **OrdersHistory** — Empty state for past orders
- Both wrapped in `ProtectedRoute` — unauthenticated users redirected to `/login`

## Unit 4 Experiment 2 Requirements Met

- [x] Cart works with API-fetched game data (RAWG-mapped format)
- [x] Add to Cart from product cards on Products page
- [x] Cart item quantity controls (+/–)
- [x] Remove item from cart
- [x] Order summary with subtotal, discount, delivery, total
- [x] Checkout flow (3 steps) with form validation
- [x] Order confirmation and redirect to orders
- [x] Protected routes for checkout and orders
- [x] localStorage persistence for cart
- [x] Production build passes with 0 errors
- [x] Code pushed to GitHub (`unit-4` branch)

## Screenshots

- `/home/optimus/Pictures/GameKada/exp4/products-api.png` — Products page showing 40 RAWG games
- `/home/optimus/Pictures/GameKada/exp4/cart-api.png` — Cart page with API items
- `/home/optimus/Pictures/GameKada/exp4/checkout-api.png` — Checkout page with delivery/payment forms
