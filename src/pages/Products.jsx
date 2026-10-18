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
    <main className="min-h-screen bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <header className="mb-8">
              <h1 className="text-2xl font-bold text-slate-100">All Games</h1>
              <p className="text-slate-400 mt-1">
                {filteredGames.length} games found
              </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Sidebar Filters */}
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

              {/* Product Grid */}
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
