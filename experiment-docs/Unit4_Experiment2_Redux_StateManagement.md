# Unit 4 - Experiment 2: Redux Toolkit State Management

## Components
- Products
- ProductDetail
- CartPage
- CheckoutPage
- Navbar (cart count)
- Redux Store

## Code

### src/store/index.js
```js
import { configureStore } from '@reduxjs/toolkit'
import productsReducer from './productsSlice'
import cartReducer from './cartSlice'

export const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: cartReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

### src/store/productsSlice.js
```js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchGames, fetchGenres, fetchPlatforms, mapRawgGameToInternal, isApiConfigured } from '../api/games'
import { games as localGames, GENRES as localGenres, PLATFORMS as localPlatforms } from '../data/games'

export const loadProducts = createAsyncThunk('products/load', async (_, { rejectWithValue }) => {
  try {
    if (isApiConfigured()) {
      const [gamesRes, genresRes, platformsRes] = await Promise.all([
        fetchGames({ page_size: 40 }),
        fetchGenres(),
        fetchPlatforms(),
      ])
      return {
        games: gamesRes.results.map(mapRawgGameToInternal),
        genres: genresRes.map((g) => g.name),
        platforms: platformsRes.map((p) => p.name),
      }
    }
    return { games: localGames, genres: localGenres, platforms: localPlatforms }
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: localGames,
    allItems: localGames,
    genres: localGenres,
    platforms: localPlatforms,
    search: '',
    genreFilter: 'all',
    platformFilter: 'all',
    priceFilter: Infinity,
    sortBy: 'name',
    isLoading: false,
    error: null,
  },
  reducers: {
    setSearch: (state, action) => { state.search = action.payload },
    setGenreFilter: (state, action) => { state.genreFilter = action.payload },
    setPlatformFilter: (state, action) => { state.platformFilter = action.payload },
    setPriceFilter: (state, action) => { state.priceFilter = action.payload },
    setSortBy: (state, action) => { state.sortBy = action.payload },
    setFilteredGames: (state, action) => { state.items = action.payload },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadProducts.pending, (state) => { state.isLoading = true })
      .addCase(loadProducts.fulfilled, (state, action) => {
        state.isLoading = false
        state.allItems = action.payload.games
        state.genres = action.payload.genres
        state.platforms = action.payload.platforms
      })
      .addCase(loadProducts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { setSearch, setGenreFilter, setPlatformFilter, setPriceFilter, setSortBy, setFilteredGames } = productsSlice.actions
export default productsSlice.reducer
```

### src/store/cartSlice.js
```js
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: JSON.parse(localStorage.getItem('gamekada_cart') || '[]'),
  orders: JSON.parse(localStorage.getItem('gamekada_orders') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('gamekada_wishlist') || '[]'),
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const existing = state.items.find((i) => i.id === action.payload.id)
      if (existing) existing.quantity += 1
      else state.items.push({ ...action.payload, quantity: 1 })
      localStorage.setItem('gamekada_cart', JSON.stringify(state.items))
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload)
      localStorage.setItem('gamekada_cart', JSON.stringify(state.items))
    },
    updateQuantity: (state, action) => {
      const item = state.items.find((i) => i.id === action.payload.id)
      if (item && action.payload.quantity > 0) item.quantity = action.payload.quantity
      localStorage.setItem('gamekada_cart', JSON.stringify(state.items))
    },
    clearCart: (state) => {
      state.items = []
      localStorage.setItem('gamekada_cart', JSON.stringify(state.items))
    },
    addToWishlist: (state, action) => {
      if (!state.wishlist.some((i) => i.id === action.payload.id)) {
        state.wishlist.push(action.payload)
        localStorage.setItem('gamekada_wishlist', JSON.stringify(state.wishlist))
      }
    },
    removeFromWishlist: (state, action) => {
      state.wishlist = state.wishlist.filter((i) => i.id !== action.payload)
      localStorage.setItem('gamekada_wishlist', JSON.stringify(state.wishlist))
    },
    placeOrder: (state, action) => {
      const order = { id: 'ORD-' + Date.now(), date: new Date().toISOString(), status: 'Processing', ...action.payload, items: state.items }
      state.orders.unshift(order)
      localStorage.setItem('gamekada_orders', JSON.stringify(state.orders))
      state.items = []
      localStorage.setItem('gamekada_cart', JSON.stringify(state.items))
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart, addToWishlist, removeFromWishlist, placeOrder } = cartSlice.actions
export default cartSlice.reducer
```

### src/hooks/useProducts.js (Redux)
```jsx
import { useSelector, useDispatch } from 'react-redux'
import { setSearch, setGenreFilter, setPlatformFilter, setPriceFilter, setSortBy } from '../store/productsSlice'

export function useProducts() {
  const dispatch = useDispatch()
  const { items, allItems, genres, platforms, search, genreFilter, platformFilter, priceFilter, sortBy, isLoading, error } = useSelector((state) => state.products)

  return {
    games: items,
    allGames: allItems,
    GENRES: genres,
    PLATFORMS: platforms,
    search,
    setSearch: (v) => dispatch(setSearch(v)),
    genreFilter,
    setGenreFilter: (v) => dispatch(setGenreFilter(v)),
    platformFilter,
    setPlatformFilter: (v) => dispatch(setPlatformFilter(v)),
    priceFilter,
    setPriceFilter: (v) => dispatch(setPriceFilter(v)),
    sortBy,
    setSortBy: (v) => dispatch(setSortBy(v)),
    isLoading,
    error,
  }
}
```

### src/hooks/useCart.js (Redux)
```jsx
import { useSelector, useDispatch } from 'react-redux'
import { addToCart, removeFromCart, updateQuantity, clearCart, addToWishlist, removeFromWishlist, placeOrder } from '../store/cartSlice'

export function useCart() {
  const dispatch = useDispatch()
  const { items: cartItems, orders, wishlist } = useSelector((state) => state.cart)

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const discount = subtotal > 100 ? subtotal * 0.1 : 0
  const delivery = subtotal > 500 ? 0 : (subtotal > 0 ? 50 : 0)
  const total = subtotal - discount + delivery
  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0)

  return {
    cartItems,
    orders,
    wishlist,
    subtotal,
    discount,
    delivery,
    total,
    itemCount,
    addToCart: (game) => dispatch(addToCart(game)),
    removeFromCart: (id) => dispatch(removeFromCart(id)),
    updateQuantity: (id, qty) => dispatch(updateQuantity({ id, quantity: qty })),
    clearCart: () => dispatch(clearCart()),
    addToWishlist: (game) => dispatch(addToWishlist(game)),
    removeFromWishlist: (id) => dispatch(removeFromWishlist(id)),
    placeOrder: (data) => dispatch(placeOrder(data)),
  }
}
```