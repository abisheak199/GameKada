import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { itemCount } = useCart()
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-300">
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
              className="relative flex items-center text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
