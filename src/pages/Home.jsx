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
