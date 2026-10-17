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
