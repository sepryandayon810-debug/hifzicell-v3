import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { ROLE_LABELS } from '../config/roles.config'

export const DashboardPage = () => {
  const { role, user } = useAuth()

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Selamat datang, {user?.email}! 👋
        </h1>
        <p className="text-gray-600">Anda login sebagai {ROLE_LABELS[role]}</p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-4xl mb-2">💳</div>
          <h3 className="font-semibold text-gray-800 mb-1">Transaksi</h3>
          <p className="text-2xl font-bold text-blue-600">0</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-4xl mb-2">📦</div>
          <h3 className="font-semibold text-gray-800 mb-1">Produk</h3>
          <p className="text-2xl font-bold text-green-600">0</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-4xl mb-2">💰</div>
          <h3 className="font-semibold text-gray-800 mb-1">Kas</h3>
          <p className="text-2xl font-bold text-purple-600">Rp 0</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-4xl mb-2">📋</div>
          <h3 className="font-semibold text-gray-800 mb-1">Hutang</h3>
          <p className="text-2xl font-bold text-red-600">Rp 0</p>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">🚀 Fitur Segera Datang</h2>
        <p className="text-blue-100">Modul-modul bisnis seperti Kasir, Produk, Kas, Hutang, dan Laporan sedang dalam pengembangan.</p>
      </div>
    </div>
  )
}
