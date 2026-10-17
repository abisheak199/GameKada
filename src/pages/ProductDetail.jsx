import { useParams } from 'react-router-dom'
import { useGames } from '../hooks/useGames'
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
