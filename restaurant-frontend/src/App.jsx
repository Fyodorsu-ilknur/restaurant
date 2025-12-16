import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import QRScannerPage from './pages/QRScannerPage'
import MenuPage from './pages/MenuPage'
import OrderPage from './pages/OrderPage'
import OrderTrackingPage from './pages/OrderTrackingPage'
import KitchenPage from './pages/KitchenPage'
import TestPage from './pages/TestPage'
import AdminDashboard from './pages/admin/AdminDashboard'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/test" element={<TestPage />} />
          <Route path="/" element={<QRScannerPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/tracking/:orderId" element={<OrderTrackingPage />} />
          <Route path="/kitchen" element={<KitchenPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/menu" element={<AdminDashboard />} />
          <Route path="/admin/tables" element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<AdminDashboard />} />
          <Route path="/admin/requests" element={<AdminDashboard />} />
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

