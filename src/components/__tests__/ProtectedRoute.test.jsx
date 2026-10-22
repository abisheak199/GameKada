import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../context/AuthContext'
import ProtectedRoute from '../ProtectedRoute'

// ── localStorage mock ─────────────────────────────────────────────
// jsdom provides a real localStorage, so we spy on it rather than
// replacing it wholesale (which breaks .mockReturnValue).
const getItemSpy = jest.spyOn(Storage.prototype, 'getItem')
const setItemSpy = jest.spyOn(Storage.prototype, 'setItem')
const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem')
const clearSpy = jest.spyOn(Storage.prototype, 'clear')

const wrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
)

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Default: no token stored → not authenticated
    getItemSpy.mockReturnValue(null)
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  test('renders protected content when authenticated', () => {
    // Simulate a stored token → AuthProvider reads it on mount → isAuthenticated = true
    getItemSpy.mockImplementation((key) => {
      if (key === 'gamekada_token') return 'mock-jwt-token'
      if (key === 'gamekada_user') return JSON.stringify({ name: 'Test User', email: 'test@gamekada.com', role: 'user' })
      return null
    })

    render(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>,
      { wrapper }
    )

    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })

  test('redirects to login when not authenticated', () => {
    // No token → AuthProvider sets isAuthenticated = false → ProtectedRoute renders <Navigate>
    getItemSpy.mockReturnValue(null)

    render(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>,
      { wrapper }
    )

    // Protected content should NOT be visible
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
  })
})