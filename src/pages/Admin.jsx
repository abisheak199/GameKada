import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { Shield, Gamepad2, Users, Settings, CreditCard, Mail } from 'lucide-react'

export default function Admin() {
  const { orders, cartItems, placeOrder, clearCart } = useCart()
  const [activeTab, setActiveTab] = useState('dashboard')

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Shield },
    { id: 'orders', label: 'Orders', icon: Mail },
    { id: 'games', label: 'Games', icon: Gamepad2 },
  ]

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
  const totalOrders = orders.length
  const pendingOrders = orders.filter((o) => o.status === 'Processing').length

  return (
    <main className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-100">Admin Panel</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab('games')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'games'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Games
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <div className="flex items-center space-x-3">
                <Shield size={20} className="text-indigo-400" />
                <span className="text-sm font-medium text-slate-400 uppercase">Total Revenue</span>
              </div>
              <p className="text-2xl font-bold text-slate-100 mt-2">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <div className="flex items-center space-x-3">
                <CreditCard size={20} className="text-indigo-400" />
                <span className="text-sm font-medium text-slate-400 uppercase">Total Orders</span>
              </div>
              <p className="text-2xl font-bold text-slate-100 mt-2">{totalOrders}</p>
            </div>
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <div className="flex items-center space-x-3">
                <Clock size={20} className="text-indigo-400" />
                <span className="text-sm font-medium text-slate-400 uppercase">Pending Orders</span>
              </div>
              <p className="text-2xl font-bold text-slate-100 mt-2">{pendingOrders}</p>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-100 mb-6">All Orders</h2>
            {orders.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                No orders yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="pb-3 text-sm font-medium text-slate-400">Order ID</th>
                      <th className="pb-3 text-sm font-medium text-slate-400">Customer</th>
                      <th className="pb-3 text-sm font-medium text-slate-400">Date</th>
                      <th className="pb-3 text-sm font-medium text-slate-400 text-right">Total</th>
                      <th className="pb-3 text-sm font-medium text-slate-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-slate-800 hover:bg-slate-700">
                        <td className="py-4 text-sm font-medium text-slate-100">
                          {order.id}
                        </td>
                        <td className="py-4 text-sm text-slate-400">
                          {order.customerName}
                        </td>
                        <td className="py-4 text-sm text-slate-400">
                          {new Date(order.date).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-4 text-sm font-medium text-slate-100 text-right">
                          ₹{order.total.toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'Processing'
                              ? 'bg-indigo-500/20 text-indigo-400'
                              : order.status === 'Shipped'
                              ? 'bg-blue-500/20 text-blue-400'
                              : order.status === 'Delivered'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-slate-700 text-slate-400'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'games' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-100 mb-6">Manage Games</h2>
            <div className="text-center py-10 text-slate-400">
              <Gamepad2 size={32} className="mx-auto mb-3 text-slate-500" />
              <p>Game management coming soon. Connect RAWG API for live game data.</p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}