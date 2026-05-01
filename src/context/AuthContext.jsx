import React, { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const savedRole = localStorage.getItem('role')
    
    if (savedUser && savedRole) {
      setUser(JSON.parse(savedUser))
      setRole(savedRole)
    }
    
    setLoading(false)
  }, [])

  const login = (userData, userRole) => {
    setUser(userData)
    setRole(userRole)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('role', userRole)
    setError(null)
  }

  const logout = () => {
    setUser(null)
    setRole(null)
    localStorage.removeItem('user')
    localStorage.removeItem('role')
  }

  const value = {
    user,
    role,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
