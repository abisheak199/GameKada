import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const storedCart = localStorage.getItem('gamekada_cart')
  const initialCart = storedCart ? JSON.parse(storedCart) : []

  const [cartItems, setCartItems] = useState(initialCart)

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('gamekada_cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = useCallback((game) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === game.id)
      if (existing) {
        return prev.map((item) =>
          item.id === game.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...game, quantity: 1 }]
    })
  }, [])

  const removeFromCart = useCallback((id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const updateQuantity = useCallback((id, quantity) => {
    if (quantity < 1) return
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    )
  }, [])

  const clearCart = useCallback(() => {
    setCartItems([])
  }, [])

  // Orders
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

  // Derived values
  const { subtotal, discount, delivery, total, itemCount } = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const discount = subtotal > 100 ? subtotal * 0.1 : 0
    const delivery = subtotal > 0 ? (subtotal > 500 ? 0 : 50) : 0
    const total = subtotal - discount + delivery
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
    return { subtotal, discount, delivery, total, itemCount }
  }, [cartItems])

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    placeOrder,
    orders,
    setOrders,
    subtotal,
    discount,
    delivery,
    total,
    itemCount,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
