import { Link, useNavigate } from 'react-router-dom'
import { Mail, Shield, CreditCard, Truck } from 'lucide-react'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  })
  const [errors, setErrors] = useState({})
  const [step, setStep] = useState(1) // 1: details, 2: payment, 3: confirmation
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const validateStep = (currentStep) => {
    const newErrors = {}
    if (currentStep === 1) {
      if (!formData.name) newErrors.name = 'Full name is required'
      if (!formData.email) newErrors.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email address'
      }
      if (!formData.address) newErrors.address = 'Delivery address is required'
      if (!formData.city) newErrors.city = 'City is required'
      if (!formData.postalCode) newErrors.postalCode = 'Postal code is required'
      if (!formData.phone) newErrors.phone = 'Phone number is required'
    }
    if (currentStep === 2) {
      if (!formData.cardNumber) newErrors.cardNumber = 'Card number is required'
      if (!formData.expiry) newErrors.expiry = 'Expiry date is required'
      if (!formData.cvv) newErrors.cvv = 'CVV is required'
    }
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (step === 1) {
      const validationErrors = validateStep(1)
      setErrors(validationErrors)
      if (Object.keys(validationErrors).length === 0) {
        setStep(2)
      }
    } else if (step === 2) {
      const validationErrors = validateStep(2)
      setErrors(validationErrors)
      if (Object.keys(validationErrors).length === 0) {
        setIsLoading(true)
        setTimeout(() => {
          setIsLoading(false)
          setStep(3)
        }, 1000)
      }
    } else {
      // Order confirmed
      navigate('/orders/current')
    }
  }

  const goBack = () => {
    if (step > 1) setStep(step - 1)
  }

  if (step === 3) {
    return (
      <main className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <Shield className="mx-auto h-12 w-12 text-green-600 mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Order Confirmed!</h1>
          <p className="text-slate-600 mb-8">Thank you for your purchase. Your games are ready to download.</p>
          <Link
            to="/orders/current"
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            View Orders
          </Link>
        </div>
      </main>
    )
  }

  const isStep1 = step === 1
  const isStep2 = step === 2

  return (
    <main className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step >= s
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {s}
              </div>
              {s < 3 && <div className={`h-1 mx-2 ${step > s ? 'bg-indigo-600' : 'bg-slate-300'}`} />}
              <span className={`text-sm font-medium ${step >= s ? 'text-indigo-600' : 'text-slate-500'}`}>
                {s === 1 ? 'Details' : s === 2 ? 'Payment' : 'Complete'}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-300 p-8 shadow-sm space-y-6">
          {/* Step 1: Customer Details */}
          <div className={`space-y-4 ${isStep1 ? '' : 'hidden'}`}>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Delivery Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    errors.name ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="John Doe"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    errors.email ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="you@example.com"
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Delivery Address
              </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    errors.address ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="123 Street, Area"
                />
                {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    errors.city ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="City"
                />
                {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    errors.postalCode ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="110001"
                />
                {errors.postalCode && (
                  <p className="mt-1 text-xs text-red-600">{errors.postalCode}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    errors.phone ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="+91 98765 43210"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Step 2: Payment */}
          <div className={`space-y-4 ${isStep2 ? '' : 'hidden'}`}>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Payment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    errors.cardNumber ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="1234 5678 9012 3456"
                />
                {errors.cardNumber && (
                  <p className="mt-1 text-xs text-red-600">{errors.cardNumber}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Expiry
                  </label>
                  <input
                    type="text"
                    name="expiry"
                    value={formData.expiry}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                      errors.expiry ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="MM/YY"
                  />
                  {errors.expiry && <p className="mt-1 text-xs text-red-600">{errors.expiry}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                      errors.cvv ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="123"
                  />
                  {errors.cvv && <p className="mt-1 text-xs text-red-600">{errors.cvv}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-300">
            {step > 1 && (
              <button
                type="button"
                onClick={goBack}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-3 text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                step < 3 ? 'bg-indigo-600' : 'bg-green-600'
              }`}
            >
              {isLoading ? 'Processing...' : step < 3 ? 'Continue to Payment' : 'Confirm Order'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

import { useState } from 'react'
