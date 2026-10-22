import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Heart, LogIn, LogOut, User } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { itemCount, wishlist } = useCart()
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const wishlistCount = wishlist.length

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-slate-100">
            <span className="bg-indigo-600 text-white px-2 py-1 rounded">GK</span>
            GameKada
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-3">

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative flex items-center text-slate-400 hover:text-indigo-400 transition-colors p-1"
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex items-center text-slate-400 hover:text-indigo-400 transition-colors p-1"
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* ─── Login / User Button ─────────────────────────── */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 ml-1">
                {/* User pill */}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:border-indigo-500 hover:text-indigo-400 transition-all text-sm"
                  aria-label="Profile"
                >
                  <User size={15} />
                  <span className="hidden sm:inline max-w-[100px] truncate">{user?.name}</span>
                </Link>
                {/* Logout button */}
                <button
                  id="navbar-logout-btn"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 hover:border-red-400 transition-all text-sm font-medium"
                  aria-label="Log out"
                >
                  <LogOut size={15} />
                  <span className="hidden sm:inline">Log Out</span>
                </button>
              </div>
            ) : (
              /* ─── Separate Log In Button ─────────────────────── */
              <Link
                id="navbar-login-btn"
                to="/login"
                className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 active:scale-95 transition-all text-sm font-semibold ml-1"
                aria-label="Log in"
              >
                <LogIn size={15} />
                Log In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
