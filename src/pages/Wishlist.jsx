import { Link } from 'react-router-dom'
import { Mail, Gamepad2, Heart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'

export default function Wishlist() {
  const { wishlist, removeFromWishlist, addToCart } = useCart()

  return (
    <main className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-100">Wishlist</h1>
          {wishlist.length > 0 && (
            <button
              className="px-4 py-2 text-sm font-medium text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"
              onClick={() => {
                // Clear wishlist via context
                window.location.reload()
              }}
            >
              Clear All
            </button>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-sm text-center py-20">
            <Heart size={48} className="mx-auto text-slate-500 mb-6" />
            <h2 className="text-lg font-bold text-slate-100 mb-2">Your wishlist is empty</h2>
            <p className="text-slate-400 mb-6">
              Add games to your wishlist to keep track of them.
            </p>
            <Link
              to="/products"
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors"
            >
              Browse Games
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((game) => (
              <div key={game.id} className="group relative">
                <ProductCard game={game} />
                <button
                  onClick={() => removeFromWishlist(game.id)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center transition-all hover:bg-red-400"
                  aria-label="Remove from wishlist"
                >
                  <Heart size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}