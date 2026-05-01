import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ROLE_FEATURES, ROLE_LABELS, ROLE_COLORS } from '../config/roles.config'

export const Sidebar = ({ isOpen, onClose }) => {
  const { role, user, logout } = useAuth()
  const location = useLocation()
  const features = ROLE_FEATURES[role] || []

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 w-64 bg-white shadow-lg z-50
        transform lg:transform-none transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className={`h-20 flex items-center px-6 bg-gradient-to-r ${ROLE_COLORS[role]}`}>
          <div className="text-white">
            <h1 className="text-2xl font-bold">🏪 POS</h1>
            <p className="text-xs text-gray-100">{ROLE_LABELS[role]}</p>
          </div>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-200">
          <p className="text-sm text-gray-600">Logged in as</p>
          <p className="font-semibold text-gray-800">{user?.email}</p>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {features.map((feature) => (
            <Link
              key={feature.path}
              to={feature.path}
              className={`
                flex items-center px-4 py-3 rounded-lg transition-colors duration-200
                ${isActive(feature.path)
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <span className="text-xl mr-3">{feature.icon}</span>
              <span>{feature.name}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors duration-200"
          >
            🚪 Logout
          </button>
        </div>
      </aside>
    </>
  )
}
