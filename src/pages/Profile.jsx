import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { User, Mail, Home, Shield, Clock, LogOut } from 'lucide-react'

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth()
  const { orders } = useCart()
  const [editing, setEditing] = useState(false)

  const userOrders = orders || []
  const totalOrders = userOrders.length
  const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0)
  const latestOrder = userOrders[0]

  const profileData = {
    name: user?.name || 'John Doe',
    email: user?.email || 'john@example.com',
    memberSince: user?.memberSince || '2024',
    totalOrders,
    totalSpent,
    address: user?.address || 'Not set',
    phone: user?.phone || 'Not set',
  }

  const [formData, setFormData] = useState({
    name: profileData.name,
    address: profileData.address,
    phone: profileData.phone,
  })

  const handleSave = (e) => {
    e.preventDefault()
    const updatedUser = { ...user, ...formData }
    localStorage.setItem('gamekada_user', JSON.stringify(updatedUser))
    setEditing(false)
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-900 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <Shield size={64} className="mx-auto text-indigo-400 mb-6" />
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Please Sign In</h1>
          <p className="text-slate-400 mb-6">
            You need to be signed in to view your profile.
          </p>
          <button
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors"
            onClick={() => (window.location.href = '/login')}
          >
            Sign In
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-100">My Profile</h1>
          <button
            onClick={() => setEditing(!editing)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              editing
                ? 'bg-slate-700 text-slate-100 hover:bg-slate-600'
                : 'text-indigo-400 hover:bg-indigo-500/20'
            }`}
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 shadow-sm">
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-slate-100 text-2xl font-bold">
              {profileData.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">{profileData.name}</h2>
              <p className="text-slate-400 text-sm">{profileData.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Member Since</p>
              <p className="text-slate-100">{profileData.memberSince}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Total Orders</p>
              <p className="text-slate-100 font-bold">{profileData.totalOrders}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Total Spent</p>
              <p className="text-slate-100 font-bold">
                ₹{profileData.totalSpent.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {!editing ? (
            <>
              <div className="space-y-4 mb-8">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <User size={16} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-300">Full Name</span>
                  </div>
                  <p className="text-slate-100">{profileData.name}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <Mail size={16} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-300">Email Address</span>
                  </div>
                  <p className="text-slate-100">{profileData.email}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <Home size={16} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-300">Address</span>
                  </div>
                  <p className="text-slate-100">{profileData.address}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <Clock size={16} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-300">Phone</span>
                  </div>
                  <p className="text-slate-100">{profileData.phone}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setEditing(true)}
                  className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors"
                >
                  Edit Profile
                </button>
                <button
                  onClick={logout}
                  className="px-6 py-3 bg-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              <form onSubmit={handleSave} className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-slate-900 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-slate-900 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-slate-900 text-slate-100"
                  />
                </div>
              </form>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-6 py-3 bg-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}