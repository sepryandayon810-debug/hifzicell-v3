import React from 'react'
import { useNavigate } from 'react-router-dom'

export const NoAccess = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600">
      <div className="text-center text-white">
        <div className="text-8xl mb-4">🚫</div>
        <h1 className="text-4xl font-bold mb-2">Access Denied</h1>
        <p className="text-xl text-red-100 mb-8">Anda tidak memiliki akses ke halaman ini</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-white text-red-600 font-semibold px-6 py-3 rounded-lg hover:bg-red-50 transition-colors"
        >
          ← Kembali ke Dashboard
        </button>
      </div>
    </div>
  )
}
