import { useSearchParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'

export default function PaymentCancel() {
  const [searchParams] = useSearchParams()
  const error = searchParams.get('error') || null

  return (
    <main className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto text-center">
        <AlertCircle size={64} className="mx-auto text-red-400 mb-6" />
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Payment Cancelled</h1>
        {error && (
          <p className="text-slate-400 mb-8">{error}</p>
        )}
        {!error && (
          <p className="text-slate-400 mb-8">
            Your payment was not completed. No charges were made to your card.
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors"
          >
            Try Again
          </button>
          <Link
            to="/cart"
            className="px-6 py-3 text-slate-400 hover:text-indigo-400 font-medium transition-colors"
          >
            Back to Cart
          </Link>
        </div>
      </div>
    </main>
  )
}