import { Link, useNavigate, Outlet } from 'react-router-dom'
import { Clock, Mail } from 'lucide-react'
import { useState } from 'react'

export default function OrdersPage() {
  return <Outlet />
}

export function OrdersCurrent() {
  const navigate = useNavigate()

  const mockOrders = [
    {
      id: 'ORD-001',
      date: 'Today',
      status: 'Processing',
      total: 4999.0,
      items: 1,
    },
  ]

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

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="pb-3 text-sm font-medium text-slate-400">Order ID</th>
                  <th className="pb-3 text-sm font-medium text-slate-400">Date</th>
                  <th className="pb-3 text-sm font-medium text-slate-400">Status</th>
                  <th className="pb-3 text-sm font-medium text-slate-400 text-right">Total</th>
                  <th className="pb-3 text-sm font-medium text-slate-400 text-right">Items</th>
                </tr>
              </thead>
              <tbody>
                {mockOrders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-800 hover:bg-slate-700">
                    <td className="py-4 text-sm font-medium text-slate-100">
                      {order.id}
                    </td>
                    <td className="py-4 text-sm text-slate-400">{order.date}</td>
                    <td className="py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'Processing'
                            ? 'bg-indigo-500/20 text-indigo-400'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 text-sm font-medium text-slate-100 text-right">
                      ₹{order.total.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 text-sm text-slate-400 text-right">
                      {order.items}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}

export function OrdersHistory() {
  return (
    <main className="min-h-screen bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-100 mb-8">Order History</h1>
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-sm text-center py-20">
          <Mail className="mx-auto h-12 w-12 text-slate-500 mb-4" />
          <h2 className="text-lg font-bold text-slate-100 mb-2">No past orders</h2>
          <p className="text-slate-400">Your completed orders will appear here.</p>
        </div>
      </div>
    </main>
  )
}
