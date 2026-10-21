import { useState } from 'react'
import { Lock, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react'
import { processMockPayment } from '../api/payments'

export default function PaymentForm({ amount, onSuccess, onCancel }) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [step, setStep] = useState('form') // 'form' | 'processing' | 'success' | 'error'

  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardName, setCardName] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Basic validation
    if (!cardNumber.replace(/\s/g, '').match(/^\d{13,16}$/)) {
      setError('Please enter a valid card number')
      return
    }
    if (!expiry.match(/^\d{2}\/\d{2}$/)) {
      setError('Please enter a valid expiry date (MM/YY)')
      return
    }
    if (!cvv.match(/^\d{3,4}$/)) {
      setError('Please enter a valid CVV')
      return
    }
    if (!cardName.trim()) {
      setError('Please enter cardholder name')
      return
    }

    setIsProcessing(true)
    setStep('processing')

    try {
      const result = await processMockPayment(amount)

      if (result.success) {
        setStep('success')
        onSuccess(result.paymentId)
      } else {
        setStep('error')
        setError(result.error || 'Payment failed')
      }
    } catch (err) {
      setStep('error')
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatCardNumber = (value) => {
    const v = value.replace(/\s/g, '').replace(/[^0-9]/gi, '')
    const groups = v.match(/.{1,4}/g) || []
    return groups.join(' ')
  }

  const formatExpiry = (value) => {
    const v = value.replace(/\D/g, '')
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4)
    }
    return v
  }

  if (step === 'success') {
    return (
      <div className="text-center py-12">
        <CheckCircle2 size={64} className="mx-auto text-green-400 mb-6" />
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Payment Successful!</h2>
        <p className="text-slate-400 mb-6">
          Your payment of ₹{amount.toLocaleString('en-IN')} has been processed.
        </p>
        <div className="flex items-center justify-center gap-2 text-slate-500 text-sm mb-8">
          <Lock size={14} /> Secure transaction
        </div>
        <button
          onClick={() => {
            setStep('form')
            setError(null)
          }}
          className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors"
        >
          Make Another Payment
        </button>
        <button
          onClick={onCancel}
          className="ml-4 px-6 py-3 text-slate-400 hover:text-indigo-400 font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="text-center py-12">
        <AlertCircle size={64} className="mx-auto text-red-400 mb-6" />
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Payment Failed</h2>
        <p className="text-slate-400 mb-4">{error}</p>
        <button
          onClick={() => {
            setStep('form')
            setError(null)
          }}
          className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors mr-4"
        >
          Try Again
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-3 text-slate-400 hover:text-indigo-400 font-medium transition-colors"
        >
          Cancel Order
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 shadow-sm">
        <div className="text-center mb-8">
          <CreditCard size={48} className="mx-auto text-indigo-400 mb-4" />
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Payment</h2>
          <p className="text-slate-400 mb-6">
            Securely pay ₹{amount.toLocaleString('en-IN')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Card Number
            </label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              maxLength="19"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-slate-900 text-slate-100"
              autoComplete="cc-number"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Expiry Date
              </label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                maxLength="5"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-slate-900 text-slate-100"
                autoComplete="cc-exp"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                CVV
              </label>
              <input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                placeholder="123"
                maxLength="4"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-slate-900 text-slate-100"
                autoComplete="cc-csc"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Cardholder Name
            </label>
            <input
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-slate-900 text-slate-100"
              autoComplete="cc-name"
            />
          </div>

          <div className="pt-4 border-t border-slate-700">
            <div className="flex justify-between text-sm mb-4">
              <span className="text-slate-400">Amount</span>
              <span className="font-medium text-slate-100">
                ₹{amount.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className={`w-full py-3 text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                isProcessing ? 'bg-slate-600' : 'bg-indigo-600'
              }`}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Pay Now'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}