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
    <main className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Current Orders</h1>
          <Link
            to="/products"
            className="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <Clock size={14} className="mr-2" /> Browse Games
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-sm font-medium text-gray-500">Order ID</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Date</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Status</th>
                  <th className="pb-3 text-sm font-medium text-gray-500 text-right">Total</th>
                  <th className="pb-3 text-sm font-medium text-gray-500 text-right">Items</th>
                </tr>
              </thead>
              <tbody>
                {mockOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 text-sm font-medium text-slate-900">
                      {order.id}
                    </td>
                    <td className="py-4 text-sm text-gray-600">{order.date}</td>
                    <td className="py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'Processing'
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 text-sm font-medium text-slate-900 text-right">
                      ₹{order.total.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 text-sm text-gray-600 text-right">
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
    <main className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">Order History</h1>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm text-center py-20">
          <Mail className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">No past orders</h2>
          <p className="text-gray-600">Your completed orders will appear here.</p>
        </div>
      </div>
    </main>
  )
}
