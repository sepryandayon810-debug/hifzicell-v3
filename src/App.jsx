import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/Auth/ProtectedRoute'
import { Sidebar } from './components/Layout/Sidebar'
import { Navbar } from './components/Layout/Navbar'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { AccessDeniedPage } from './pages/AccessDeniedPage'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="flex h-screen bg-gray-100">
                  <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                    <main className="flex-1 overflow-auto p-6">
                      <Routes>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/kasir" element={<div className="text-center py-12"><h2 className="text-2xl font-bold">🚧 Modul Kasir - Segera Datang</h2></div>} />
                        <Route path="/produk" element={<div className="text-center py-12"><h2 className="text-2xl font-bold">🚧 Modul Produk - Segera Datang</h2></div>} />
                        <Route path="/kas" element={<div className="text-center py-12"><h2 className="text-2xl font-bold">🚧 Modul Kas - Segera Datang</h2></div>} />
                        <Route path="/hutang" element={<div className="text-center py-12"><h2 className="text-2xl font-bold">🚧 Modul Hutang - Segera Datang</h2></div>} />
                        <Route path="/laporan" element={<div className="text-center py-12"><h2 className="text-2xl font-bold">🚧 Modul Laporan - Segera Datang</h2></div>} />
                        <Route path="/users" element={<div className="text-center py-12"><h2 className="text-2xl font-bold">🚧 Manajemen Users - Segera Datang</h2></div>} />
                        <Route path="/settings" element={<div className="text-center py-12"><h2 className="text-2xl font-bold">🚧 Settings - Segera Datang</h2></div>} />
                        <Route path="/dev-tools" element={<div className="text-center py-12"><h2 className="text-2xl font-bold">🚧 Dev Tools - Segera Datang</h2></div>} />
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
