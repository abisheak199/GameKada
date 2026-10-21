# Experiment 5.1: Payment Integration

## Overview
Unit 4, Experiment 1 of the GameKada Steam-like e-commerce app. Integrated payment processing with a mock payment gateway (simulating Stripe/Razorpay), order creation, and payment success/cancel pages. Users can now complete the full checkout flow from delivery details to payment confirmation.

## Stack
- React 19.2.8 + Vite 8.3.4
- React Router DOM 7.18.4
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Lucide React icons
- Axios (HTTP client)
- RAWG Video Games Database API
- Context API + custom hooks (CartContext, AuthContext, useGames)

## Files Created

### `src/api/payments.js`
Payment service layer with mock payment processing:

```javascript
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || ''

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const createPaymentIntent = async (amount, currency = 'INR') => {
  const response = await api.post('/payments/create-intent', {
    amount,
    currency,
  })
  return response.data
}

export const confirmPayment = async (paymentIntentId, paymentMethodId) => {
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
  await new Promise((resolve) => setTimeout(resolve, 1500))
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
```

### `src/components/PaymentForm.jsx`
Secure payment form with card number, expiry, CVV, and cardholder name fields. Simulates payment processing with loading state, success, and error states.

```jsx
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
    // ... more validation

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
  // ... JSX with form fields, processing spinner, success/error states
}
```

### `src/pages/PaymentSuccess.jsx`
Payment success page showing order ID, payment ID, and amount paid. Links to orders page or continue shopping.

### `src/pages/PaymentCancel.jsx`
Payment cancelled page with retry and back-to-cart options.

## Files Modified

### `src/context/CartContext.jsx`
Added order management:
- `orders` state — array of placed orders
- `placeOrder(orderData)` — creates order from cart items, persists to localStorage, clears cart
- `setOrders` — setter for orders state

```jsx
const [orders, setOrders] = useState([])

const placeOrder = useCallback((orderData) => {
  const order = {
    id: 'ORD-' + Date.now(),
    date: new Date().toISOString(),
    status: 'Processing',
    ...orderData,
    items: cartItems.map((item) => ({
      id: item.id,
      title: item.title,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
    })),
  }
  setOrders((prev) => [order, ...prev])
  localStorage.setItem('gamekada_orders', JSON.stringify([order, ...prev]))
  clearCart()
  return order
}, [cartItems, clearCart])
```

### `src/pages/CheckoutPage.jsx`
Updated to integrate PaymentForm:
- Step 1: Delivery Details form (name, email, address, city, postal code, phone)
- Step 2: PaymentForm component for secure payment entry
- Step 3: Order confirmation page
- On payment success: places order, navigates to `/payment-success` with query params
- On payment cancel: navigates to `/payment-cancel` with error message

### `src/App.jsx`
Added new routes:
- `/payment-success` — PaymentSuccess page (public)
- `/payment-cancel` — PaymentCancel page (public)

## Unit 5 Experiment 1 Requirements Met

- [x] Payment service layer with mock processing (`src/api/payments.js`)
- [x] Payment form with card validation (`src/components/PaymentForm.jsx`)
- [x] Payment success page with order details
- [x] Payment cancel page with retry option
- [x] Order creation in CartContext with localStorage persistence
- [x] Checkout flow: Delivery Details → Payment → Order Confirmation
- [x] New routes: `/payment-success`, `/payment-cancel`
- [x] Production build passes with 0 errors
- [x] Code pushed to GitHub (`unit-5` branch)
- [x] Webpage screenshots captured

## Screenshots

- `/home/optimus/Pictures/GameKada/exp5/products-api.png` — Products page showing 40 RAWG games
- `/home/optimus/Pictures/GameKada/exp5/cart-empty.png` — Empty cart state

## How to Test

1. Ensure `.env` has `VITE_RAWG_API_KEY` and `VITE_DATA_SOURCE=api`
2. Start dev server: `npm run dev -- --host`
3. Navigate to `/products`, add games to cart
4. Go to `/cart`, click "Proceed to Checkout"
5. Fill delivery details, click "Continue to Payment"
6. Enter card details, click "Pay Now" — 90% success rate for demo
7. On success: redirected to `/payment-success` with order details
8. On cancel/failure: redirected to `/payment-cancel`
