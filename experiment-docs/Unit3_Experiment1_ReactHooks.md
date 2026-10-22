# Unit 3 - Experiment 1: React Hooks

## Components
- Home
- Products
- ProductCard
- ProductDetail
- SearchBar (embedded in Products)
- FilterPanel (embedded in Products)
- CartPage
- CheckoutPage
- Footer (embedded in Layout)
- Header (Navbar)

## Code

### src/hooks/useGames.js
```jsx
import { useState, useMemo, useEffect, useCallback } from 'react'
import { games as localGames, GENRES as localGenres, PLATFORMS as localPlatforms } from '../data/games'
import { fetchGames, fetchGenres, fetchPlatforms, mapRawgGameToInternal, isApiConfigured } from '../api/games'

export function useGames() {
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

  return {
    games: filteredGames,
    allGames,
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
    dataSource,
    isLoading,
    error,
  }
}
```

### src/components/ProductCard.jsx
```jsx
import { Link } from 'react-router-dom'
import { Star, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import WishlistButton from './WishlistButton'

export default function ProductCard({ game }) {
  const { addToCart } = useCart()
  const handleAddToCart = () => addToCart(game)
  return (
    <article className="group flex flex-col h-full rounded-lg border border-slate-700 bg-slate-800 p-4 hover:shadow-lg transition-shadow">
      <div className="aspect-[4/5] overflow-hidden rounded-lg bg-slate-700 mb-3 flex-shrink-0 relative">
        <img
          src={game.image}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <WishlistButton game={game} />
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
        className="w-full mt-auto flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-500 transition-colors"
      >
        <ShoppingCart size={14} /> Add to Cart
      </button>
    </article>
  )
}
```

### src/pages/Home.jsx
```jsx
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { useGames } from '../hooks/useGames'

export default function Home() {
  const { games: filteredGames } = useGames()
  const featuredGames = filteredGames.slice(0, 6)

  return (
    <main className="min-h-screen bg-slate-900">
      <section className="relative bg-[#020617] text-white py-16 px-4 overflow-hidden">
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors"
          >
            Shop Games <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-100">Featured Games</h2>
            <Link
              to="/products"
              className="text-sm font-medium text-indigo-400 hover:text-indigo-300"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredGames.map((game) => (
              <ProductCard key={game.id} game={game} />
            ))}
            {featuredGames.length === 0 && (
              <div className="col-span-full text-center py-20 text-slate-400">
                No games available.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
```

### src/pages/Products.jsx
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
    dataSource,
    isLoading,
    error,
  } = useGames()

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-900 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading games from API...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-900 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-slate-400 mb-4">Failed to load games from API.</p>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors"
          >
            Retry
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <header className="mb-8">
              <h1 className="text-2xl font-bold text-slate-100">All Games</h1>
              <p className="text-slate-400 mt-1">
                {filteredGames.length} games found
              </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <aside className="lg:col-span-3 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Search games
                    </label>
                    <input
                      type="text"
                      placeholder="Search by title..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors bg-slate-800 text-slate-100"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-slate-300">Genre</span>
                    </div>
                    <div className="space-y-1">
                      <button
                        onClick={() => setGenreFilter('all')}
                        className={`w-full text-left px-3 py-2 rounded border transition-colors ${
                          genreFilter === 'all'
                            ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
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
                              ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-slate-300">Max Price</span>
                    </div>
                    <input
                      type="range"
                      min={MIN_PRICE}
                      max={MAX_PRICE}
                      value={priceFilter}
                      onChange={(e) => setPriceFilter(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>₹{MIN_PRICE.toLocaleString('en-IN')}</span>
                      <span>₹{MAX_PRICE.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-slate-300">Sort by</span>
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-slate-800 text-slate-100"
                    >
                      <option value="name">Name (A-Z)</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Rating (High to Low)</option>
                    </select>
                  </div>
                </div>
              </aside>

              <section className="lg:col-span-9">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Grid size={16} />
                    <span>Grid View</span>
                  </div>
                  <div className="hidden lg:flex items-center gap-2 text-sm text-slate-400">
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
                    <p className="text-slate-400">No games found matching your filters.</p>
                    <button
                      onClick={() => {
                        setSearch('')
                        setGenreFilter('all')
                        setPlatformFilter('all')
                        setPriceFilter(MAX_PRICE)
                      }}
                      className="mt-4 text-indigo-400 font-medium hover:text-indigo-300"
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

### src/pages/ProductDetail.jsx
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