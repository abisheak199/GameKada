# Experiment 5.2: User Profiles & Order History

## Overview
Unit 4, Experiment 2 of the GameKada Steam-like e-commerce app. Integrated user profile management and order history tracking. Users can view their profile details, edit personal information, sign out, and browse their order history with detailed order views.

## Stack
- React 19.2.8 + Vite 8.3.4
- React Router DOM 7.18.4
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Lucide React icons
- Axios (HTTP client)
- RAWG Video Games Database API
- Context API + custom hooks (AuthContext, CartContext, useGames)

## Files Created

### `src/pages/Profile.jsx`
User profile page showing account details, order statistics, and edit functionality:

```jsx
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { User, Mail, Home, Shield, Clock, LogOut } from 'lucide-react'

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth()
  const { orders } = useCart()
  const [editing, setEditing] = useState(false)

  const userOrders = orders || []
  const totalOrders = userOrders.length
  const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0)

  const profileData = {
    name: user?.name || 'John Doe',
    email: user?.email || 'john@example.com',
    memberSince: user?.memberSince || '2024',
    totalOrders,
    totalSpent,
    address: user?.address || 'Not set',
    phone: user?.phone || 'Not set',
  }
  // ... edit form, profile display, sign out button
}
```

Key features:
- Profile header with user avatar, name, email
- Statistics cards: member since, total orders, total spent
- Editable fields: name, address, phone
- Sign out button
- Redirects to login if not authenticated

### `src/pages/OrderDetail.jsx`
Individual order detail page showing order items, status, and shipping address:

```jsx
import { Link, useSearchParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { Clock, Mail, Gamepad2, Shield, Truck } from 'lucide-react'

export default function OrderDetail() {
  const [searchParams] = useSearchParams()
  const { orders } = useCart()

  const orderId = searchParams.get('id')
  const order = orders.find((o) => o.id === orderId)
  // ... renders order items, status badge, shipping details
}
```

Key features:
- Order ID, date, status badge (Processing/Shipped/Delivered/Cancelled)
- Order items with images, quantities, and subtotals
- Shipping address display
- "Not found" state for invalid order IDs

### `src/components/OrderCard.jsx`
Order card component used in orders list pages:

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
  // ... renders order summary with link to detail page
}
```

Key features:
- Order items with thumbnails
- Date, total, status badge
- "View Details" link to order detail page

## Files Modified

### `src/context/AuthContext.jsx`
Added default user profile fields:
- `memberSince`, `totalOrders`, `totalSpent`, `address`, `phone`
- Default user object when no stored user exists

### `src/pages/OrdersNested.jsx`
Refactored to use OrderCard component:
- `OrdersCurrent` — shows non-delivered, non-cancelled orders as cards
- `OrdersHistory` — shows delivered/cancelled orders as cards
- Both fetch orders from CartContext

### `src/App.jsx`
Added new routes:
- `/profile` — Profile page (protected, requires authentication)
- `/orders/detail` — Order detail page (reads order ID from query params)

## Unit 5 Experiment 2 Requirements Met

- [x] User profile page with account details
- [x] Profile edit functionality (name, address, phone)
- [x] Profile statistics (total orders, total spent, member since)
- [x] Order history page (past orders)
- [x] Current orders page (processing/shipping orders)
- [x] Order detail page with item breakdown
- [x] OrderCard component for order listings
- [x] Status badges with color coding (Processing, Shipped, Delivered, Cancelled)
- [x] Protected routes for profile and orders
- [x] Production build passes with 0 errors
- [x] Code pushed to GitHub (`unit-5` branch)
- [x] Webpage screenshots captured

## Screenshots

- `/home/optimus/Pictures/GameKada/exp5/profile-signin.png` — Profile page showing sign-in required
- `/home/optimus/Pictures/GameKada/exp5/products-api.png` — Products page (from Exp 5.1)
- `/home/optimus/Pictures/GameKada/exp5/cart-empty.png` — Empty cart (from Exp 5.1)

## How to Test

1. Ensure `.env` has `VITE_RAWG_API_KEY` and `VITE_DATA_SOURCE=api`
2. Start dev server: `npm run dev -- --host`
3. Navigate to `/login`, sign in with any email/password
4. Go to `/products`, add games to cart
5. Complete checkout via `/checkout`
6. After payment success, navigate to `/profile` to view account stats
7. Navigate to `/orders` to view order history
8. Click "View Details" on any order to see `/orders/detail?id=<orderId>`
