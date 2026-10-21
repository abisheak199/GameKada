import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const storedToken = localStorage.getItem('gamekada_token')
  const storedUser = localStorage.getItem('gamekada_user')
  const defaultUser = {
    name: 'Guest User',
    email: 'guest@example.com',
    memberSince: new Date().getFullYear().toString(),
    totalOrders: 0,
    totalSpent: 0,
    address: 'Not set',
    phone: 'Not set',
  }
  const [user, setUser] = useState(
    storedUser ? JSON.parse(storedUser) : defaultUser
  )
  const [isAuthenticated, setIsAuthenticated] = useState(!!storedToken)

  const login = (userData, token) => {
    localStorage.setItem('gamekada_token', token)
    localStorage.setItem('gamekada_user', JSON.stringify(userData))
    setUser(userData)
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('gamekada_token')
    localStorage.removeItem('gamekada_user')
    setUser(null)
    setIsAuthenticated(false)
  }

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
