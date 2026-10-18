import { useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatINR } from '../utils/helpers'

export default function CartPage() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discount,
    delivery,
    total,
    itemCount,
  } = useCart()
  const navigate = useNavigate()
  const handleRemove = (id) => removeFromCart(id)
  const handleUpdate = (id, qty) => updateQuantity(id, qty)

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto text-center">
          <ShoppingCart size={64} className="mx-auto text-slate-300 mb-6" />
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Your cart is empty</h1>
          <p className="text-slate-400 mb-8">Looks like you haven't added any games yet.</p>
          <button
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors"
            onClick={() => navigate('/products')}
          >
            Browse Games
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-100">Cart ({itemCount})</h1>
          <button
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            onClick={clearCart}
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 items-start rounded-lg border border-slate-700 bg-slate-800 p-4 hover:shadow-lg transition-shadow">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-24 h-32 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-100">{item.title}</h3>
                  <span className="text-sm font-medium text-indigo-600">{item.genre}</span>
                  <span className="block mt-1 text-sm text-slate-400">
                    {formatINR(item.price)} each
                  </span>
                  <div className="mt-4 flex items-center gap-4">
                    <button
                      onClick={() => handleUpdate(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 rounded border border-slate-700 flex items-center justify-center hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-medium text-slate-100">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdate(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded border border-slate-700 flex items-center justify-center hover:bg-slate-700"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="ml-4 text-sm text-red-600 hover:underline"
                      aria-label={`Remove ${item.title}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <span className="mt-2 text-lg font-bold text-slate-100 block">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <aside className="lg:col-span-1 rounded-lg border border-slate-700 bg-slate-800 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-100 mb-6">Order Summary</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="font-medium text-slate-100">{formatINR(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Discount (10%)</span>
                  <span className="font-medium text-green-400">-{formatINR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Delivery</span>
                <span className="font-medium text-slate-100">
                  {delivery === 0 ? 'FREE' : formatINR(delivery)}
                </span>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-700">
              <div className="flex justify-between text-lg font-bold text-slate-100">
                <span>Total</span>
                <span>{formatINR(total)}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Orders over ₹100 get 10% off. Free delivery on orders over ₹500.
              </p>
            </div>
            <button
              className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors mt-4"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </button>
          </aside>
        </div>
      </div>
    </main>
  )
}
