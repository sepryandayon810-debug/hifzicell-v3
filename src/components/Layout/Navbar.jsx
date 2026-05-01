import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { ROLE_LABELS, ROLE_COLORS } from '../config/roles.config'

export const Navbar = ({ onMenuClick }) => {
  const { role, user } = useAuth()

  return (
    <header className={`h-16 bg-gradient-to-r ${ROLE_COLORS[role]} text-white shadow-lg`}>
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">WebPOS Firebase</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-100">{ROLE_LABELS[role]}</p>
            <p className="font-semibold">{user?.email}</p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg">
            👤
          </div>
        </div>
      </div>
    </header>
  )
}
