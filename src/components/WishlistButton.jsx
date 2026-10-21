import { Heart } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function WishlistButton({ game }) {
  const { wishlist, addToWishlist, removeFromWishlist } = useCart()
  const isWishlisted = wishlist.some((item) => item.id === game.id)

  const handleToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(game.id)
    } else {
      addToWishlist(game)
    }
  }

  return (
    <button
      onClick={handleToggle}
      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
        isWishlisted
          ? 'bg-indigo-500 text-indigo-50 hover:bg-indigo-400'
          : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-slate-200'
      }`}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart size={16} className={isWishlisted ? 'fill-current' : ''} />
    </button>
  )
}