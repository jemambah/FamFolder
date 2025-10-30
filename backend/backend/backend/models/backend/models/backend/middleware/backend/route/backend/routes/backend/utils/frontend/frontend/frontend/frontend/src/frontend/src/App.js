import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Layout/Navbar'
import Dashboard from './pages/Dashboard'
import FarmData from './pages/FarmData'
import Analytics from './pages/Analytics'
import Login from './pages/Login'
import Register from './pages/Register'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/data" element={<FarmData />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>
          <footer className="bg-green-800 text-white py-8 mt-16">
            <div className="container mx-auto px-4 text-center">
              <p className="text-lg font-semibold">🌱 Farm Folder</p>
              <p className="text-green-200 mt-2">Agricultural Insights Platform by Munyambabazi Mark</p>
              <p className="text-green-300 text-sm mt-4">
                Transforming farm data into actionable insights for modern farmers
              </p>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
