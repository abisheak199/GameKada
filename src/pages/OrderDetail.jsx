import { Link, useSearchParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { Clock, Mail, Gamepad2, Shield, Truck } from 'lucide-react'

export default function OrderDetail() {
  const [searchParams] = useSearchParams()
  const { orders } = useCart()

  const orderId = searchParams.get('id')
  const order = orders.find((o) => o.id === orderId)

  if (!order) {
    return (
      <main className="min-h-screen bg-slate-900 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <Shield size={64} className="mx-auto text-indigo-400 mb-6" />
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Order Not Found</h1>
          <p className="text-slate-400 mb-6">
            The order you are looking for does not exist.
          </p>
          <Link
            to="/orders/current"
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors"
          >
            Back to Orders
          </Link>
        </div>
      </main>
    )
  }

  const statusColors = {
    Processing: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    Shipped: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Delivered: 'bg-green-500/10 text-green-400 border-green-500/20',
    Cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  }

  return (
    <main className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-100">Order #{order.id}</h1>
          <Link
            to="/orders/current"
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors"
          >
            Back to Orders
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-sm font-medium text-slate-400 uppercase mb-4">Order Date</h3>
            <p className="text-slate-100">
              {new Date(order.date).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-sm font-medium text-slate-400 uppercase mb-4">Status</h3>
            <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || statusColors.Processing}`}>
              <span className="w-2 h-2 rounded-full bg-current"></span>
              {order.status}
            </span>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-sm font-medium text-slate-400 uppercase mb-4">Total</h3>
            <p className="text-2xl font-bold text-slate-100">
              ₹{order.total.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-8">
          <h2 className="text-lg font-bold text-slate-100 mb-6">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded-lg bg-slate-700"
                />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-slate-100">{item.title}</h3>
                  <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-medium text-slate-100">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-bold text-slate-100 mb-6">Shipping Address</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Home size={16} className="text-slate-400" />
              <p className="text-slate-100">{order.address}</p>
            </div>
            <div className="flex items-center space-x-3">
              <Mail size={16} className="text-slate-400" />
              <p className="text-slate-100">{order.customerEmail}</p>
            </div>
            <div className="flex items-center space-x-3">
              <Clock size={16} className="text-slate-400" />
              <p className="text-slate-100">{order.phone}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}