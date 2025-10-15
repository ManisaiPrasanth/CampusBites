import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Menu from './pages/Menu'
import UserOrders from './pages/UserOrders'
import AdminDashboard from './pages/AdminDashboard'
import AdminOrders from './pages/AdminOrders'
import AdminAddMenuItem from './pages/AdminAddMenuItem'
import Profile from './pages/Profile'
import CanteenOwnerDashboard from './pages/CanteenOwnerDashboard'
import CanteenOwnerMenu from './pages/CanteenOwnerMenu'
import CanteenOwnerOrders from './pages/CanteenOwnerOrders'

// Components
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import CanteenOwnerRoute from './components/CanteenOwnerRoute'
import ConnectionStatus from './components/ConnectionStatus'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="app">
            {/* Connection Status Indicator (dev only) */}
            <ConnectionStatus />
            
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Protected Routes */}
              <Route path="/menu" element={
                <ProtectedRoute>
                  <Menu />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute>
                  <UserOrders />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              <Route path="/admin/orders" element={
                <AdminRoute>
                  <AdminOrders />
                </AdminRoute>
              } />
              <Route path="/admin/menu/add" element={
                <AdminRoute>
                  <AdminAddMenuItem />
                </AdminRoute>
              } />
              
              {/* Canteen Owner Routes */}
              <Route path="/canteen-owner" element={
                <CanteenOwnerRoute>
                  <CanteenOwnerDashboard />
                </CanteenOwnerRoute>
              } />
              <Route path="/canteen-owner/menu" element={
                <CanteenOwnerRoute>
                  <CanteenOwnerMenu />
                </CanteenOwnerRoute>
              } />
              <Route path="/canteen-owner/orders" element={
                <CanteenOwnerRoute>
                  <CanteenOwnerOrders />
                </CanteenOwnerRoute>
              } />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App

