import { renderHook, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AuthProvider, useAuth } from '../../context/AuthContext'
import { CartProvider, useCart } from '../../context/CartContext'

// ── localStorage mock via spyOn ────────────────────────────────────────────
// We spy on Storage.prototype so both the test code and the module under test
// use the same mock — avoiding ordering issues with global.localStorage replacement.
const getItemSpy    = jest.spyOn(Storage.prototype, 'getItem')
const setItemSpy    = jest.spyOn(Storage.prototype, 'setItem')
const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem')
const clearSpy      = jest.spyOn(Storage.prototype, 'clear')

afterAll(() => {
  jest.restoreAllMocks()
})

// ─────────────────────────────────────────────────────────────────
// AuthContext tests
// ─────────────────────────────────────────────────────────────────
describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Default: no token/user in storage → not authenticated
    getItemSpy.mockReturnValue(null)
  })

  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>

  test('provides default user when not authenticated', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toEqual({
      name: 'Guest User',
      email: 'guest@example.com',
      memberSince: expect.any(String),
      totalOrders: 0,
      totalSpent: 0,
      address: 'Not set',
      phone: 'Not set',
    })
  })

  test('sets authenticated user on login with valid credentials', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    let loginResult
    act(() => {
      loginResult = result.current.login('admin@gamekada.com', 'admin123')
    })

    expect(loginResult.success).toBe(true)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual({
      name: 'Admin User',
      email: 'admin@gamekada.com',
      role: 'admin',
    })
    expect(setItemSpy).toHaveBeenCalledWith('gamekada_token', expect.any(String))
    expect(setItemSpy).toHaveBeenCalledWith(
      'gamekada_user',
      JSON.stringify({ name: 'Admin User', email: 'admin@gamekada.com', role: 'admin' })
    )
  })

  test('fails login with invalid credentials', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    let loginResult
    act(() => {
      loginResult = result.current.login('wrong@email.com', 'wrongpassword')
    })

    expect(loginResult.success).toBe(false)
    expect(loginResult.message).toMatch(/invalid/i)
    expect(result.current.isAuthenticated).toBe(false)
  })

  test('clears authentication on logout', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    // First login
    act(() => {
      result.current.login('admin@gamekada.com', 'admin123')
    })
    expect(result.current.isAuthenticated).toBe(true)

    // Then logout
    act(() => {
      result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(removeItemSpy).toHaveBeenCalledWith('gamekada_token')
    expect(removeItemSpy).toHaveBeenCalledWith('gamekada_user')
  })
})

// ─────────────────────────────────────────────────────────────────
// CartContext tests
// ─────────────────────────────────────────────────────────────────
describe('CartContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Empty cart in storage
    getItemSpy.mockReturnValue(null)
  })

  const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>

  test('starts with empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    expect(result.current.cartItems).toEqual([])
    expect(result.current.itemCount).toBe(0)
    expect(result.current.subtotal).toBe(0)
    expect(result.current.total).toBe(0)
  })

  test('adds game to cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    const game = { id: 1, title: 'Test Game', price: 1000, image: 'test.jpg', genre: 'Action' }

    act(() => { result.current.addToCart(game) })

    expect(result.current.cartItems).toHaveLength(1)
    expect(result.current.cartItems[0]).toMatchObject({ id: 1, title: 'Test Game', quantity: 1 })
    expect(result.current.itemCount).toBe(1)
    expect(result.current.subtotal).toBe(1000)
  })

  test('increments quantity when adding same game', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    const game = { id: 1, title: 'Test Game', price: 1000, image: 'test.jpg', genre: 'Action' }

    act(() => { result.current.addToCart(game) })
    act(() => { result.current.addToCart(game) })

    expect(result.current.cartItems).toHaveLength(1)
    expect(result.current.cartItems[0].quantity).toBe(2)
    expect(result.current.itemCount).toBe(2)
    expect(result.current.subtotal).toBe(2000)
  })

  test('removes item from cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    const game = { id: 1, title: 'Test Game', price: 1000, image: 'test.jpg', genre: 'Action' }

    act(() => { result.current.addToCart(game) })
    act(() => { result.current.removeFromCart(1) })

    expect(result.current.cartItems).toHaveLength(0)
    expect(result.current.itemCount).toBe(0)
  })

  test('updates item quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    const game = { id: 1, title: 'Test Game', price: 1000, image: 'test.jpg', genre: 'Action' }

    act(() => { result.current.addToCart(game) })
    act(() => { result.current.updateQuantity(1, 3) })

    expect(result.current.cartItems[0].quantity).toBe(3)
    expect(result.current.itemCount).toBe(3)
    expect(result.current.subtotal).toBe(3000)
  })

  test('calculates discount for orders over ₹100', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    // Subtotal = 200 → discount = 10% = 20, delivery = 50 (subtotal ≤ 500)
    const game = { id: 1, title: 'Test Game', price: 200, image: 'test.jpg', genre: 'Action' }

    act(() => { result.current.addToCart(game) })

    expect(result.current.subtotal).toBe(200)
    expect(result.current.discount).toBe(20)   // 10% of 200
    expect(result.current.delivery).toBe(50)   // subtotal ≤ 500 → ₹50 delivery
    expect(result.current.total).toBe(230)     // 200 - 20 + 50
  })

  test('calculates delivery fee for orders under ₹500', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    // Subtotal = 150 → discount = 10% = 15 (subtotal > 100), delivery = 50 (subtotal ≤ 500)
    const game = { id: 1, title: 'Test Game', price: 150, image: 'test.jpg', genre: 'Action' }

    act(() => { result.current.addToCart(game) })

    expect(result.current.subtotal).toBe(150)
    expect(result.current.discount).toBe(15)   // 10% of 150 (subtotal > 100)
    expect(result.current.delivery).toBe(50)   // subtotal ≤ 500 → ₹50 delivery
    expect(result.current.total).toBe(185)     // 150 - 15 + 50
  })

  test('free delivery for orders over ₹500', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    // Subtotal = 600 → discount = 60, delivery = 0
    const game = { id: 1, title: 'Test Game', price: 600, image: 'test.jpg', genre: 'Action' }

    act(() => { result.current.addToCart(game) })

    expect(result.current.subtotal).toBe(600)
    expect(result.current.delivery).toBe(0)    // subtotal > 500 → free
    expect(result.current.discount).toBe(60)   // 10% of 600
    expect(result.current.total).toBe(540)     // 600 - 60 + 0
  })

  test('clears cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    const game = { id: 1, title: 'Test Game', price: 1000, image: 'test.jpg', genre: 'Action' }

    act(() => { result.current.addToCart(game) })
    act(() => { result.current.clearCart() })

    expect(result.current.cartItems).toHaveLength(0)
    expect(result.current.itemCount).toBe(0)
    expect(result.current.subtotal).toBe(0)
  })
})