import { Link } from 'react-router-dom'
import { Clock, Gamepad2, Truck } from 'lucide-react'

export default function OrderCard({ order }) {
  const statusColors = {
    Processing: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    Shipped: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Delivered: 'bg-green-500/10 text-green-400 border-green-500/20',
    Cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 hover:border-slate-600 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">Order ID</h3>
        <span className="text-xs font-mono text-slate-100">{order.id}</span>
      </div>

      <div className="mb-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center space-x-3 mb-2">
            <img
              src={item.image}
              alt={item.title}
              className="w-10 h-10 object-cover rounded-md bg-slate-700"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-100 truncate">{item.title}</p>
              <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase">Date</p>
          <p className="text-sm text-slate-100">
            {new Date(order.date).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase">Total</p>
          <p className="text-sm font-bold text-slate-100">
            ₹{order.total.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || statusColors.Processing}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          {order.status}
        </span>
      </div>

      <Link
        to={`/orders/detail?id=${order.id}`}
        className="mt-4 block text-center px-4 py-2 text-sm font-medium text-indigo-400 bg-indigo-500/10 rounded-lg hover:bg-indigo-500/20 transition-colors"
      >
        <Gamepad2 size={14} className="mr-1" />
        View Details
      </Link>
    </div>
  )
}