# Experiment 5.3: Wishlist & Admin Panel

## Overview
Unit 4, Experiment 3 of the GameKada Steam-like e-commerce app. Integrated wishlist functionality (favorites) and an admin panel for order/game management. Users can add/remove games from their wishlist, and admins can view dashboard stats, orders, and game management.

## Stack
- React 19.2.8 + Vite 8.3.4
- React Router DOM 7.18.4
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Lucide React icons
- Axios (HTTP client)
- RAWG Video Games Database API
- Context API + custom hooks (CartContext, AuthContext, useGames)

## Files Created

### `src/components/WishlistButton.jsx`
Heart button component for adding/removing games from wishlist. Appears on product cards and product detail pages:

```jsx
import { Heart } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function WishlistButton({ game }) {
  const { wishlist, addToWishlist, removeFromWishlist } = useCart()
  const isWishlisted = wishlist.some((item) => item.id === game.id)

  const handleToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(game.id)
    } else {
      addToWishlist(game)
    }
  }

  return (
    <button
      onClick={handleToggle}
      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
        isWishlisted
          ? 'bg-indigo-500 text-indigo-50 hover:bg-indigo-400'
          : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-slate-200'
      }`}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart size={16} className={isWishlisted ? 'fill-current' : ''} />
    </button>
  )
}
```

Key features:
- Heart icon toggles between filled (wishlisted) and outline (not wishlisted)
- Positioned absolutely in top-right corner of product card image
- Color changes: indigo when wishlisted, slate when not

### `src/pages/Wishlist.jsx`
Wishlist page showing all saved games with remove option:

```jsx
import { Link } from 'react-router-dom'
import { Mail, Gamepad2, Heart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useCart()
  // ... renders wishlist grid with ProductCard components
  // ... each card has remove button
  // ... empty state with Heart icon and "Browse Games" button
}
```

Key features:
- Grid of wishlisted games using ProductCard component
- Remove button (red heart) on each card
- Empty state when no items in wishlist
- "Browse Games" button to navigate to products

### `src/pages/Admin.jsx`
Admin dashboard panel with three tabs:

```jsx
import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { Shield, Gamepad2, Users, Settings, CreditCard, Mail } from 'lucide-react'

export default function Admin() {
  const { orders, cartItems, placeOrder, clearCart } = useCart()
  const [activeTab, setActiveTab] = useState('dashboard')
  // ... Dashboard, Orders, Games tabs
}
```

Key features:
- **Dashboard tab**: Total revenue, total orders, pending orders stats
- **Orders tab**: Table view of all orders with status badges
- **Games tab**: Placeholder for game management (connect RAWG API)

### `src/components/OrderCard.jsx`
Order card component for order listings in orders pages:

```jsx
import { Link } from 'react-router-dom'
import { Clock, Gamepad2, Truck } from 'lucide-react'

export default function OrderCard({ order }) {
  const statusColors = {
    Processing: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    Shipped: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Delivered: 'bg-green-500/10 text-green-400 border-green-500/20',
    Cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  }
  // ... renders order items, status badge, view details link
}
```

## Files Modified

### `src/context/CartContext.jsx`
Added wishlist state management:
- `wishlist` state — array of wishlisted games
- `addToWishlist(game)` — adds game to wishlist (prevents duplicates)
- `removeFromWishlist(id)` — removes game from wishlist

### `src/components/Navbar.jsx`
Added wishlist icon with count badge:
- Heart icon in navigation bar
- Red badge showing wishlist item count
- Links to `/wishlist` page

### `src/components/ProductCard.jsx`
Added WishlistButton to product cards:
- Import WishlistButton component
- Render WishlistButton in image container (absolute top-right)
- Added `relative` class to image container for positioning

### `src/pages/OrdersNested.jsx`
Refactored to use OrderCard component:
- `OrdersCurrent` — shows non-delivered orders as cards
- `OrdersHistory` — shows delivered/cancelled orders as cards
- Both fetch orders from CartContext

### `src/App.jsx`
Added new routes:
- `/wishlist` — Wishlist page (public)
- `/admin` — Admin panel (public)

## Unit 5 Experiment 3 Requirements Met

- [x] Wishlist button on product cards (heart icon, toggle add/remove)
- [x] Wishlist page showing saved games with remove option
- [x] Wishlist count badge in navbar
- [x] Admin panel with dashboard, orders, and games tabs
- [x] OrderCard component for order listings
- [x] Order status badges (Processing/Shipped/Delivered/Cancelled)
- [x] Dashboard stats (total revenue, total orders, pending orders)
- [x] New routes: `/wishlist`, `/admin`
- [x] Production build passes with 0 errors
- [x] Code pushed to GitHub (`unit-5` branch)
- [x] Webpage screenshots captured

## Screenshots

- `/home/optimus/Pictures/GameKada/exp5/wishlist-page.png` — Wishlist page (empty state)
- `/home/optimus/Pictures/GameKada/exp5/products-api.png` — Products page (from Exp 5.1)
- `/home/optimus/Pictures/GameKada/exp5/cart-empty.png` — Empty cart (from Exp 5.1)
- `/home/optimus/Pictures/GameKada/exp5/profile-signin.png` — Profile page (from Exp 5.2)

## How to Test

1. Ensure `.env` has `VITE_RAWG_API_KEY` and `VITE_DATA_SOURCE=api`
2. Start dev server: `npm run dev -- --host`
3. Navigate to `/products`, click heart icon on any game card to add to wishlist
4. Go to `/wishlist` to view saved games
5. Click heart again to remove from wishlist
6. Navigate to `/admin` to view admin dashboard
7. Click tab headers to switch between Dashboard, Orders, Games

## Unit 5 Complete

All three experiments are finished:

| Experiment | Description | Status |
|------------|-------------|--------|
| Exp 1 | Payment Integration | ✅ Complete |
| Exp 2 | User Profiles & Order History | ✅ Complete |
| Exp 3 | Wishlist & Admin Panel | ✅ Complete |

**Build:** Passes with 0 errors.
**Server:** Running on `http://localhost:5173/`.
**GitHub:** All code pushed to `unit-5` branch.
