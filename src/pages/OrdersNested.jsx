import { Link, useNavigate, Outlet } from 'react-router-dom'
import { Clock, Mail } from 'lucide-react'
import OrderCard from '../components/OrderCard'
import { useCart } from '../context/CartContext'

export default function OrdersPage() {
  return <Outlet />
}

export function OrdersCurrent() {
  const navigate = useNavigate()
  const { orders } = useCart()

  const currentOrders = orders.filter(
    (o) => o.status !== 'Delivered' && o.status !== 'Cancelled'
  )

  return (
    <main className="min-h-screen bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-100">Current Orders</h1>
          <Link
            to="/products"
            className="px-4 py-2 text-sm font-medium text-indigo-400 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Clock size={14} className="mr-2" /> Browse Games
          </Link>
        </div>

        {currentOrders.length === 0 ? (
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-sm text-center py-20">
            <Clock className="mx-auto h-12 w-12 text-slate-500 mb-4" />
            <h2 className="text-lg font-bold text-slate-100 mb-2">No current orders</h2>
            <p className="text-slate-400">
              Your placed orders will appear here once you complete checkout.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export function OrdersHistory() {
  const { orders } = useCart()

  const historyOrders = orders.filter(
    (o) => o.status === 'Delivered' || o.status === 'Cancelled'
  )

  return (
    <main className="min-h-screen bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-100 mb-8">Order History</h1>

        {historyOrders.length === 0 ? (
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-sm text-center py-20">
            <Mail className="mx-auto h-12 w-12 text-slate-500 mb-4" />
            <h2 className="text-lg font-bold text-slate-100 mb-2">No past orders</h2>
            <p className="text-slate-400">
              Your completed orders will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {historyOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}