import { Link, useNavigate } from 'react-router-dom'
import { Mail, Shield, CreditCard, Truck } from 'lucide-react'
import PaymentForm from '../components/PaymentForm'
import { useCart } from '../context/CartContext'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { cartItems, total, placeOrder } = useCart()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
  })
  const [errors, setErrors] = useState({})
  const [step, setStep] = useState(1) // 1: details, 2: payment, 3: confirmation
  const [isLoading, setIsLoading] = useState(false)
  const [paymentError, setPaymentError] = useState(null)

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
      setIsLoading(true)
      setPaymentError(null)
      setTimeout(() => {
        setIsLoading(false)
        setStep(3)
      }, 1000)
    } else {
      // Order confirmed
      placeOrder({
        customerName: formData.name,
        customerEmail: formData.email,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        phone: formData.phone,
        total,
        paymentStatus: 'Paid',
      })
      navigate('/orders/current')
    }
  }

  const goBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handlePaymentSuccess = (paymentId) => {
    const order = placeOrder({
      customerName: formData.name,
      customerEmail: formData.email,
      address: formData.address,
      city: formData.city,
      postalCode: formData.postalCode,
      phone: formData.phone,
      total,
      paymentStatus: 'Paid',
      paymentId,
    })
    navigate(`/payment-success?paymentId=${paymentId}&orderId=${order.id}&amount=${total}`)
  }

  const handlePaymentCancel = () => {
    navigate(`/payment-cancel?error=${encodeURIComponent('Payment was cancelled. No charges were made.')}`)
  }

  if (step === 3) {
    return (
      <main className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <Shield className="mx-auto h-12 w-12 text-green-400 mb-4" />
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Order Confirmed!</h1>
          <p className="text-slate-400 mb-8">Thank you for your purchase. Your games are ready to download.</p>
          <Link
            to="/orders/current"
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors"
          >
            View Orders
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step >= s
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {s}
              </div>
              {s < 3 && <div className={`h-1 mx-2 ${step > s ? 'bg-indigo-600' : 'bg-slate-700'}`} />}
              <span className={`text-sm font-medium ${step >= s ? 'text-indigo-400' : 'text-slate-500'}`}>
                {s === 1 ? 'Details' : s === 2 ? 'Payment' : 'Complete'}
              </span>
            </div>
          ))}
        </div>

        {step === 1 && (
          <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl border border-slate-700 p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-100 mb-4">Delivery Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    errors.name ? 'border-red-500' : 'border-slate-700'
                  }`}
                  placeholder="John Doe"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    errors.email ? 'border-red-500' : 'border-slate-700'
                  }`}
                  placeholder="you@example.com"
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Delivery Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                  errors.address ? 'border-red-500' : 'border-slate-700'
                }`}
                placeholder="123 Street, Area"
              />
              {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    errors.city ? 'border-red-500' : 'border-slate-700'
                  }`}
                  placeholder="City"
                />
                {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    errors.postalCode ? 'border-red-500' : 'border-slate-700'
                  }`}
                  placeholder="110001"
                />
                {errors.postalCode && <p className="mt-1 text-xs text-red-600">{errors.postalCode}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    errors.phone ? 'border-red-500' : 'border-slate-700'
                  }`}
                  placeholder="+91 98765 43210"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
              </div>
            </div>
            <div className="flex justify-between items-center pt-6 border-t border-slate-700">
              <button
                type="button"
                onClick={goBack}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-3 text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-indigo-600`}
              >
                Continue to Payment
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-100 mb-6">Payment</h2>
            <PaymentForm
              amount={total}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
            {paymentError && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {paymentError}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}