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
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
