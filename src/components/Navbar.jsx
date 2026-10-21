import { Link } from 'react-router-dom'
import { ShoppingCart, Heart } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { itemCount, wishlist } = useCart()
  const wishlistCount = wishlist.length
  return (
    <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-slate-100"
          >
            <span className="bg-indigo-600 text-white px-2 py-1 rounded">GK</span>
            GameKada
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/cart"
              className="relative flex items-center text-slate-400 hover:text-indigo-400 transition-colors"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <Link
              to="/wishlist"
              className="relative flex items-center text-slate-400 hover:text-indigo-400 transition-colors"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
