import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ROLES, ROLE_LABELS, ROLE_COLORS } from '../config/roles.config'

// Demo credentials
const DEMO_ACCOUNTS = {
  OWNER: { email: 'owner@hifzicell.com', password: 'demo123', role: ROLES.OWNER },
  ADMIN: { email: 'admin@hifzicell.com', password: 'demo123', role: ROLES.ADMIN },
  DEVELOPER: { email: 'dev@hifzicell.com', password: 'demo123', role: ROLES.DEVELOPER },
  KASIR: { email: 'kasir@hifzicell.com', password: 'demo123', role: ROLES.KASIR },
}

export const LoginForm = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate credentials
      let foundRole = null
      for (const [, account] of Object.entries(DEMO_ACCOUNTS)) {
        if (account.email === email && account.password === password) {
          foundRole = account.role
          break
        }
      }

      if (!foundRole) {
        setError('Email atau password salah')
        setLoading(false)
        return
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      // Login
      login(
        { id: '1', email, name: email.split('@')[0] },
        foundRole
      )

      navigate('/dashboard')
    } catch (err) {
      setError('Login gagal. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = (role) => {
    const account = DEMO_ACCOUNTS[role]
    setEmail(account.email)
    setPassword(account.password)
    // Trigger login
    setTimeout(() => {
      login(
        { id: '1', email: account.email, name: account.email.split('@')[0] },
        role
      )
      navigate('/dashboard')
    }, 100)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-white mb-2">🏪 WebPOS Firebase</h1>
          <p className="text-blue-100 text-lg">Point of Sale System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Masuk</h2>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 mb-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📧 Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email"
                className="input-field"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🔐 Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="input-field"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? '⏳ Sedang masuk...' : '✓ Masuk'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Atau login dengan demo</span>
            </div>
          </div>

          {/* Demo Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(DEMO_ACCOUNTS).map(([key, account]) => (
              <button
                key={key}
                type="button"
                onClick={() => quickLogin(account.role)}
                className={`py-2 px-3 rounded-lg font-medium text-white text-sm transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1 bg-gradient-to-r ${ROLE_COLORS[account.role]}`}
              >
                {ROLE_LABELS[account.role]}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 text-white animate-fade-in">
          <h3 className="font-semibold mb-3">📝 Demo Accounts:</h3>
          <div className="space-y-2 text-sm">
            {Object.entries(DEMO_ACCOUNTS).map(([, account]) => (
              <div key={account.role}>
                <strong>{ROLE_LABELS[account.role]}</strong>
                <div className="ml-2 text-blue-100">
                  {account.email} / {account.password}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
