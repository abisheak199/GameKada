import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || ''

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const createPaymentIntent = async (amount, currency = 'INR') => {
  // Mock payment intent creation - replace with real Stripe/Razorpay integration
  const response = await api.post('/payments/create-intent', {
    amount,
    currency,
  })
  return response.data
}

export const confirmPayment = async (paymentIntentId, paymentMethodId) => {
  // Mock payment confirmation - replace with real gateway confirmation
  const response = await api.post('/payments/confirm', {
    payment_intent_id: paymentIntentId,
    payment_method_id: paymentMethodId,
  })
  return response.data
}

export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData)
  return response.data
}

export const fetchOrder = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`)
  return response.data
}

// Mock payment processing (simulates gateway redirect/confirmation)
export const processMockPayment = async (amount, currency = 'INR') => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Simulate 90% success rate for demo purposes
  const success = Math.random() < 0.9

  return {
    success,
    paymentId: `pay_${Date.now()}`,
    amount,
    currency,
    timestamp: new Date().toISOString(),
    ...(success ? {} : { error: 'Payment declined by bank' }),
  }
}

export const isPaymentConfigured = () => {
  return !!(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || import.meta.env.VITE_RAZORPAY_KEY_ID)
}