# Unit 5 - Experiment 1: Testing (Jest + React Testing Library)

## Components
- ProductCard.test.jsx
- ProtectedRoute.test.jsx
- AuthContext.test.jsx
- CartContext.test.jsx

## Code

### jest.config.js
```js
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterSetup: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  testMatch: ['**/__tests__/**/*.test.jsx'],
  collectCoverageFrom: ['src/**/*.{js,jsx}', '!src/main.jsx', '!src/**/*.test.jsx'],
}
```

### jest.setup.js
```js
import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false, media: query, onchange: null,
    addListener: jest.fn(), removeListener: jest.fn(),
    addEventListener: jest.fn(), removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn(),
}))
```

### src/components/__tests__/ProductCard.test.jsx
```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from '../../context/CartContext'
import ProductCard from '../ProductCard'

const mockGame = { id: 1, title: 'Test Game', price: 1000, image: 'test.jpg', genre: 'Action', rating: 4.5, releaseYear: 2023, tags: ['Test'] }

const wrapper = ({ children }) => (
  <BrowserRouter>
    <CartProvider>{children}</CartProvider>
  </BrowserRouter>
)

describe('ProductCard', () => {
  test('renders game title, price, genre, rating', () => {
    render(<ProductCard game={mockGame} />, { wrapper })
    expect(screen.getByText('Test Game')).toBeInTheDocument()
    expect(screen.getByText('₹1,000')).toBeInTheDocument()
    expect(screen.getByText('Action')).toBeInTheDocument()
    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText('2023')).toBeInTheDocument()
  })

  test('navigates to product detail on title click', () => {
    render(<ProductCard game={mockGame} />, { wrapper })
    fireEvent.click(screen.getByText('Test Game'))
    expect(screen.getByRole('link')).toHaveAttribute('href', '/products/1')
  })

  test('adds to cart when button clicked', () => {
    render(<ProductCard game={mockGame} />, { wrapper })
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }))
    expect(screen.getByRole('link', { name: /cart/i })).toHaveTextContent('1')
  })

  test('shows wishlist button', () => {
    render(<ProductCard game={mockGame} />, { wrapper })
    expect(screen.getByRole('button', { name: /add to wishlist/i })).toBeInTheDocument()
  })
})
```

### src/components/__tests__/ProtectedRoute.test.jsx
```jsx
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../context/AuthContext'
import ProtectedRoute from '../ProtectedRoute'

const wrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
)

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.localStorage = { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn(), clear: jest.fn() }
  })

  test('renders children when authenticated', () => {
    global.localStorage.getItem.mockReturnValue('mock-token')
    render(<ProtectedRoute><div data-testid="content">Protected</div></ProtectedRoute>, { wrapper })
    expect(screen.getByTestId('content')).toBeInTheDocument()
  })

  test('redirects to login when not authenticated', () => {
    global.localStorage.getItem.mockReturnValue(null)
    render(<ProtectedRoute><div data-testid="content">Protected</div></ProtectedRoute>, { wrapper })
    expect(screen.getByRole('link')).toHaveAttribute('href', '/login')
  })
})
```

### src/context/__tests__/AuthContext.test.jsx
```jsx
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.localStorage = { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn(), clear: jest.fn() }
  })

  test('initial state is unauthenticated', () => {
    global.localStorage.getItem.mockReturnValue(null)
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  test('logs in with valid credentials', () => {
    global.localStorage.getItem.mockReturnValue(null)
    const { result } = renderHook(() => useAuth(), { wrapper })
    let loginResult
    act(() => { loginResult = result.current.login('admin@gamekada.com', 'admin123') })
    expect(loginResult.success).toBe(true)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual({ name: 'Admin User', email: 'admin@gamekada.com', role: 'admin' })
    expect(localStorage.setItem).toHaveBeenCalledWith('gamekada_token', expect.any(String))
  })

  test('fails login with invalid credentials', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    let loginResult
    act(() => { loginResult = result.current.login('wrong@test.com', 'wrong') })
    expect(loginResult.success).toBe(false)
    expect(result.current.isAuthenticated).toBe(false)
  })

  test('logs out and clears storage', () => {
    global.localStorage.getItem.mockReturnValue('mock-token')
    const { result } = renderHook(() => useAuth(), { wrapper })
    act(() => { result.current.logout() })
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(localStorage.removeItem).toHaveBeenCalledWith('gamekada_token')
    expect(localStorage.removeItem).toHaveBeenCalledWith('gamekada_user')
  })
}
```

### src/context/__tests__/CartContext.test.jsx
```jsx
import { renderHook, act } from '@testing-library/react'
import { CartProvider, useCart } from '../CartContext'

const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>

describe('CartContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.localStorage = { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn(), clear: jest.fn() }
  })

  test('adds item to cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => { result.current.addToCart({ id: 1, title: 'Game', price: 100, image: 'img.jpg', genre: 'Action' }) })
    expect(result.current.cartItems).toHaveLength(1)
    expect(result.current.itemCount).toBe(1)
    expect(localStorage.setItem).toHaveBeenCalled()
  })

  test('increments quantity when adding same item', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    const game = { id: 1, title: 'Game', price: 100, image: 'img.jpg', genre: 'Action' }
    act(() => { result.current.addToCart(game); result.current.addToCart(game) })
    expect(result.current.cartItems[0].quantity).toBe(2)
    expect(result.current.itemCount).toBe(2)
  })

  test('removes item from cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => { result.current.addToCart({ id: 1, title: 'Game', price: 100, image: 'img.jpg', genre: 'Action' }) })
    act(() => { result.current.removeFromCart(1) })
    expect(result.current.cartItems).toHaveLength(0)
  })

  test('updates quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => { result.current.addToCart({ id: 1, title: 'Game', price: 100, image: 'img.jpg', genre: 'Action' }) })
    act(() => { result.current.updateQuantity(1, 5) })
    expect(result.current.cartItems[0].quantity).toBe(5)
  })

  test('calculates totals correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => { result.current.addToCart({ id: 1, title: 'Game', price: 200, image: 'img.jpg', genre: 'Action' }) })
    expect(result.current.subtotal).toBe(200)
    expect(result.current.discount).toBe(20)
    expect(result.current.delivery).toBe(50)
    expect(result.current.total).toBe(230)
  })
})
```