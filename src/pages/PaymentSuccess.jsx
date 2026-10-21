import { useSearchParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { CheckCircle2, Truck, Gamepad2 } from 'lucide-react'

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const paymentId = searchParams.get('paymentId') || 'N/A'
  const orderId = searchParams.get('orderId') || 'N/A'
  const amount = parseInt(searchParams.get('amount') || '0', 10)

  return (
    <main className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto text-center">
        <CheckCircle2 size={64} className="mx-auto text-green-400 mb-6" />
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Payment Successful!</h1>
        <p className="text-slate-400 mb-8">
          Your payment of ₹{amount.toLocaleString('en-IN')} has been processed successfully.
        </p>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-slate-400">Order ID</span>
            <span className="text-sm font-medium text-slate-100">{orderId}</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-slate-400">Payment ID</span>
            <span className="text-sm font-medium text-slate-100">{paymentId}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Amount Paid</span>
            <span className="text-sm font-bold text-slate-100">
              ₹{amount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Link
            to="/orders/current"
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2"
          >
            <Gamepad2 size={16} className="mr-2" />
            View Orders
          </Link>
          <Link
            to="/products"
            className="px-6 py-3 text-slate-400 hover:text-indigo-400 font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Truck size={16} className="mr-2" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  )
}