import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Sayfalar
import QRScannerPage from './pages/QRScannerPage'
import MenuPage from './pages/MenuPage'
import OrderPage from './pages/OrderPage'
import OrderTrackingPage from './pages/OrderTrackingPage'
import KitchenPage from './pages/KitchenPage'
import TestPage from './pages/TestPage'
import LoginPage from './pages/LoginPage' // Yeni ekledik

// Admin Sayfaları
import AdminDashboard from './pages/admin/AdminDashboard'
import MenuManagement from './pages/admin/MenuManagement'
import TableManagement from './pages/admin/TableManagement'
import OrderManagement from './pages/admin/OrderManagement'
import RequestManagement from './pages/admin/RequestManagement'

// Güvenlik Bileşeni
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Herkese Açık Sayfalar */}
          <Route path="/" element={<QRScannerPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/tracking/:orderId" element={<OrderTrackingPage />} />
          <Route path="/test" element={<TestPage />} />

          {/* Mutfak Ekranı (Sadece ADMIN ve KITCHEN görebilir) */}
          <Route 
            path="/kitchen" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'KITCHEN']}>
                <KitchenPage />
              </ProtectedRoute>
            } 
          />

          {/* Admin Paneli (Sadece ADMIN görebilir) */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}> <AdminDashboard /> </ProtectedRoute>
          } />
          <Route path="/admin/menu" element={
            <ProtectedRoute allowedRoles={['ADMIN']}> <MenuManagement /> </ProtectedRoute>
          } />
          <Route path="/admin/tables" element={
            <ProtectedRoute allowedRoles={['ADMIN']}> <TableManagement /> </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute allowedRoles={['ADMIN']}> <OrderManagement /> </ProtectedRoute>
          } />
          <Route path="/admin/requests" element={
            <ProtectedRoute allowedRoles={['ADMIN']}> <RequestManagement /> </ProtectedRoute>
          } />

        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  )
}

export default App