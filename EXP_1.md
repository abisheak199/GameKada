# Experiment 1: Local Game Catalog with Hooks and Routing

## Overview
Unit 3, Experiment 1 of the GameKada Steam-like e-commerce app. Built a local-data product catalog with 30 game titles, custom hooks for search/filter/sort, and React Router for navigation.

## Stack
- React 19.2.8 + Vite 8.3.0
- React Router DOM 7.18.4
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Lucide React icons

## Files Created

### `src/data/games.js`
Seed data with 30 major game titles. Each game has: `id, title, genre, platform, price, rating, releaseYear, developer, description, tags, inStock, image`. Also exports `GENRES`, `PLATFORMS`, `MAX_PRICE`, `MIN_PRICE` derived arrays/constants for filtering.

### `src/hooks/useGames.js
Custom hook that encapsulates:
- `useState` for search term, genre filter, platform filter, max price, sort order
- `useMemo` for filtered/sorted game list
- Returns filtered games, filter state, setters, and derived constants

```jsx
import { useState, useMemo } from 'react'
import { games, GENRES, PLATFORMS, MAX_PRICE, MIN_PRICE } from '../data/games'

export function useGames() {
  const [search, setSearch] = useState('')
  const [genreFilter, setGenreFilter] = useState('all')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [priceFilter, setPriceFilter] = useState(MAX_PRICE)
  const [sortBy, setSortBy] = useState('name')

  const filteredGames = useMemo(() => {
    return games
      .filter((g) => {
        const matchesSearch = g.title
          .toLowerCase()
          .includes(search.toLowerCase())
        const matchesGenre =
          genreFilter === 'all' || g.genre === genreFilter
        const matchesPlatform =
          platformFilter === 'all' || g.platform === platformFilter
        const matchesPrice = g.price <= priceFilter
        return matchesSearch && matchesGenre && matchesPlatform && matchesPrice
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.title.localeCompare(b.title)
        if (sortBy === 'price-low') return a.price - b.price
        if (sortBy === 'price-high') return b.price - a.price
        if (sortBy === 'rating') return b.rating - a.rating
        return 0
      })
  }, [search, genreFilter, platformFilter, priceFilter, sortBy])

  return {
    games: filteredGames,
    allGames: games,
    GENRES,
    PLATFORMS,
    MAX_PRICE,
    MIN_PRICE,
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
  }
}
```

### `src/components/Navbar.jsx`
Sticky top navigation bar with GameKada logo and cart link.

```jsx
import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
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
              className="relative flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
```

### `src/components/ProductCard.jsx`
Reusable product card component with cover image, genre badge, title, price, rating, and stock status.

```jsx
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'

export default function ProductCard({ game }) {
  return (
    <article className="group rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow">
      <div className="aspect-[3/4] overflow-hidden rounded-md mb-3 bg-gray-100">
        <img
          src={game.image}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <span className="inline-block mb-1 px-2 py-0.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded">
        {game.genre}
      </span>
      <Link
        to={`/products/${game.id}`}
        className="block mb-1 text-lg font-semibold text-slate-900 group-hover:text-indigo-600"
      >
        {game.title}
      </Link>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-lg font-bold text-slate-900">
          ₹{game.price.toLocaleString('en-IN')}
        </span>
        <span className="text-sm text-gray-500">· {game.releaseYear}</span>
      </div>
      <div className="flex items-center gap-1">
        <Star size={14} className="text-amber-400 fill-amber-400" />
        <span className="text-sm font-medium text-slate-700">
          {game.rating}
        </span>
      </div>
      {!game.inStock && (
        <span className="mt-2 inline-block px-2 py-0.5 text-xs font-medium text-red-600 bg-red-50 rounded">
          Out of Stock
        </span>
      )}
    </article>
  )
}
```

### `src/pages/Home.jsx`
Landing page with dark hero section, "Welcome to GameKada" heading, Shop Games CTA, and featured games preview.

```jsx
import { Link } from 'react-router-dom'
import { ArrowRight, Grid, List } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="relative bg-slate-900 text-white py-16 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold tracking-wider text-indigo-300 bg-indigo-600/20 rounded-full">
            New Arrivals
          </span>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Welcome to GameKada
          </h1>
          <p className="mb-8 max-w-2xl text-lg text-slate-300">
            Your destination for the best video games. Browse the catalog, add
            games to your cart, and check out in seconds.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Shop Games <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Featured Games</h2>
            <Link
              to="/products"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((id) => (
              <div key={id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="aspect-[4/3] overflow-hidden rounded-md mb-3 bg-gray-100">
                  <span className="block w-full h-full flex items-center justify-center text-gray-400">
                    🎮
                  </span>
                </div>
                <span className="inline-block mb-1 px-2 py-0.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded">
                  Action RPG
                </span>
                <Link
                  to={`/products/${id}`}
                  className="block mb-1 text-lg font-semibold text-slate-900 group-hover:text-indigo-600"
                >
                  Featured Game {id}
                </Link>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-slate-900">
                    ₹4,999
                  </span>
                </div>
iiiiio,              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
```

### `src/pages/Products.jsx`
Product listing page with left sidebar (search, genre filter, price range slider, sort dropdown) and responsive product grid on the right.

```jsx
import { useGames } from '../hooks/useGames'
import ProductCard from '../components/ProductCard'
import { Grid } from 'lucide-react'

export default function Products() {
  const {
    games: filteredGames,
    GENRES,
    PLATFORMS,
    MAX_PRICE,
    MIN_PRICE,
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
  } = useGames()

  return (
    <main className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">All Games</h1>
          <p className="text-gray-600 mt-1">
            {filteredGames.length} games found
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Search games
                </label>
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-slate-700">Genre</span>
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => setGenreFilter('all')}
                    className={`w-full text-left px-3 py-2 rounded border transition-colors ${
                      genreFilter === 'all'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    All Genres
                  </button>
                  {GENRES.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => setGenreFilter(genre)}
                      className={`w-full text-left px-3 py-2 rounded border transition-colors ${
                        genreFilter === genre
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-slate-700">Max Price</span>
                </div>
                <input
                  type="range"
                  min={MIN_PRICE}
                  max={MAX_PRICE}
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>₹{MIN_PRICE.toLocaleString('en-IN')}</span>
                  <span>₹{MAX_PRICE.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-slate-700">Sort by</span>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating (High to Low)</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <section className="lg:col-span-9">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Grid size={16} />
                <span>Grid View</span>
              </div>
              <div className="hidden lg:flex items-center gap-2 text-sm text-gray-600">
                <span>Showing {filteredGames.length} results</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGames.map((game) => (
                <ProductCard key={game.id} game={game} />
              ))}
            </div>

            {filteredGames.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-500">No games found matching your filters.</p>
                <button
                  onClick={() => {
                    setSearch('')
                    setGenreFilter('all')
                    setPlatformFilter('all')
                    setPriceFilter(MAX_PRICE)
                  }}
                  className="mt-4 text-indigo-600 font-medium hover:text-indigo-700"
                >
                  Clear filters
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
```

### `src/pages/ProductDetail.jsx`
Individual product page with breadcrumb, large cover image, title, price, rating, description, tags, and Add to Cart button.

```jsx
import { useParams } from 'react-router-dom'
import { useGames } from '../hooks/useGames'
import { Star, ShoppingCart } from 'lucide-react'

export default function ProductDetail() {
  const { id } = useParams()
  const { games: allGames } = useGames()

  const game = allGames.find((g) => g.id === Number(id))

  if (!game) {
    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-slate-900">Game Not Found</h1>
          <p className="text-gray-600 mt-2">The game you are looking for does not exist.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <nav className="mb-6 text-sm text-gray-500">
          <span className="text-indigo-600 cursor-pointer hover:underline">Home</span>
          <span className="mx-2 text-gray-400">{'>'}</span>
          <span className="text-indigo-600 cursor-pointer hover:underline">Games</span>
          <span className="mx-2 text-gray-400">{'>'}</span>
          <span className="text-gray-900 font-medium">{game.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-[3/4] overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
            <img
              src={game.image}
              alt={game.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-baseline gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded">
                {game.genre}
              </span>
              <span className="text-xs font-medium text-gray-500">{game.platform}</span>
            </div>

            <h1 className="text-3xl font-bold text-slate-900">{game.title}</h1>

            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-2xl font-bold text-slate-900">
                ₹{game.price.toLocaleString('en-IN')}
              </span>
              <span className="text-sm text-gray-500">{game.releaseYear}</span>
            </div>

            <div className="flex items-center gap-2 text-slate-600">
              <Star size={18} className="text-amber-400 fill-amber-400" />
              <span className="font-medium">{game.rating} / 5.0</span>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">{game.description}</p>
            </div>

            {!game.inStock ? (
              <button
                disabled
                className="w-full px-6 py-3 bg-gray-200 text-gray-500 font-medium rounded-lg cursor-not-allowed"
              >
                Out of Stock
              </button>
            ) : (
              <button className="w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                <ShoppingCart size={18} />
                Add to Cart
              </button>
            )}
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Tags</h2>
          <div className="flex gap-2">
            {game.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded-full">
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

### `src/App.jsx`
Router configuration with `BrowserRouter` wrapper, `Navbar` on all routes, and three routes.

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
      </Routes>
    </BrowserRouter>
  )
}
```

### `src/index.css`
Added `@import "tailwindcss";` directive at top for Tailwind CSS v4, alongside existing CSS variable theme.

### `vite.config.js`
Added `tailwindcss()` plugin to Vite config.

### `tailwind.config.js`
Custom theme with slate and indigo color extensions, system font stack.

## Routes
| Path | Component | Description |
|------|-----------|-------------|
| `/` | Home | Landing page with hero and featured games |
| `/products` | Products | Full catalog with search, filters, sorting |
| `/products/:id` | ProductDetail | Individual game details page |

## Design Decisions
- **Simple & professional UI**: White background, slate text, indigo accents, generous whitespace
- **Responsive**: Mobile-first grid (1 col → 4 cols on desktop)
- **Local data first**: All 30 games stored in `src/data/games.js`, no API dependency
- **Custom hook pattern**: `useGames` encapsulates all filtering logic, keeping components presentational

## GitHub
Pushed to: https://github.com/AbisheakSaravanan/GameKada-GameShop (4 commits)

## Screenshots
- Homepage: `Pictures/GameKada/exp1/homepage.png` — captured at `http://localhost:5173/`
- Products page: captured at `http://localhost:5173/products` (build verified passing)

## Fixes applied during Experiment 1
- Removed invalid `Filter` and `DollarSign` lucide-react icon imports that caused `ReferenceError` at runtime
- Added missing `Grid` lucide-react import for the grid-view toggle
- All icons removed that don't exist in the installed lucide-react version
- Production build (`npm run build`) passes with 0 errors

## Next Experiment (Unit 3, Exp 2)
Add `useCart` hook + `CartContext` for add/remove/update/clear cart operations with localStorage persistence.
