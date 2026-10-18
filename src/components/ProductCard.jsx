import { Link } from 'react-router-dom'
import { Star, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function ProductCard({ game }) {
  const { addToCart } = useCart()
  const handleAddToCart = () => addToCart(game)
  return (
    <article className="group flex flex-col h-full rounded-lg border border-slate-700 bg-slate-800 p-4 hover:shadow-lg transition-shadow">
      <div className="aspect-[4/5] overflow-hidden rounded-lg bg-slate-700 mb-3 flex-shrink-0">
        <img
          src={game.image}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
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
