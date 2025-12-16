import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { orderAPI } from '../../services/api'
import { toast } from 'react-toastify'
import './OrderManagement.css'

function OrderManagement() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [dateFilter, setDateFilter] = useState('ALL')

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchTerm, statusFilter, dateFilter])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await orderAPI.getAll()
      const ordersData = response.data || []
      
      // Siparişleri tarihe göre sırala (yeni → eski)
      const sortedOrders = [...ordersData].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0)
        const dateB = new Date(b.createdAt || 0)
        return dateB - dateA
      })
      
      setOrders(sortedOrders)
    } catch (error) {
      console.error('Siparişler yüklenemedi:', error)
      toast.error('Siparişler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = [...orders]

    // Arama filtresi
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(order => 
        order.orderNumber?.toLowerCase().includes(term) ||
        order.restaurantTable?.tableNumber?.toLowerCase().includes(term) ||
        order.id?.toString().includes(term)
      )
    }

    // Durum filtresi
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(order => 
        order.status?.toUpperCase() === statusFilter.toUpperCase()
      )
    }

    // Tarih filtresi
    if (dateFilter !== 'ALL') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      filtered = filtered.filter(order => {
        if (!order.createdAt) return false
        const orderDate = new Date(order.createdAt)
        orderDate.setHours(0, 0, 0, 0)
        
        switch (dateFilter) {
          case 'TODAY':
            return orderDate.getTime() === today.getTime()
          case 'WEEK':
            const weekAgo = new Date(today)
            weekAgo.setDate(weekAgo.getDate() - 7)
            return orderDate >= weekAgo
          case 'MONTH':
            const monthAgo = new Date(today)
            monthAgo.setMonth(monthAgo.getMonth() - 1)
            return orderDate >= monthAgo
          default:
            return true
        }
      })
    }

    setFilteredOrders(filtered)
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus)
      toast.success('Sipariş durumu güncellendi')
      loadOrders()
      if (selectedOrder && selectedOrder.id === orderId) {
        const response = await orderAPI.getById(orderId)
        setSelectedOrder(response.data)
      }
    } catch (error) {
      console.error('Sipariş durumu güncellenemedi:', error)
      toast.error('Sipariş durumu güncellenemedi')
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return '#ff9800'
      case 'PREPARING':
      case 'HAZIRLANIYOR':
        return '#2196f3'
      case 'READY':
      case 'HAZIR':
        return '#4caf50'
      case 'DELIVERED':
      case 'TESLİM EDİLDİ':
        return '#9e9e9e'
      default:
        return '#666'
    }
  }

  const getStatusLabel = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'Beklemede'
      case 'PREPARING':
      case 'HAZIRLANIYOR':
        return 'Hazırlanıyor'
      case 'READY':
      case 'HAZIR':
        return 'Hazır'
      case 'DELIVERED':
      case 'TESLİM EDİLDİ':
        return 'Teslim Edildi'
      default:
        return status || 'Bilinmeyen'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTotalRevenue = () => {
    return filteredOrders.reduce((total, order) => {
      return total + parseFloat(order.totalAmount || 0)
    }, 0)
  }

  if (loading) {
    return <div className="admin-loading">Yükleniyor...</div>
  }

  return (
    <div className="order-management">
      <div className="management-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/admin')}>
            ← Geri
          </button>
          <h1>📦 Sipariş Yönetimi</h1>
        </div>
        <button className="refresh-btn" onClick={loadOrders}>
          🔄 Yenile
        </button>
      </div>

      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-label">Toplam Sipariş:</span>
          <span className="stat-value">{filteredOrders.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Toplam Gelir:</span>
          <span className="stat-value">{getTotalRevenue().toFixed(2)} ₺</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Bekleyen:</span>
          <span className="stat-value warning">
            {filteredOrders.filter(o => o.status === 'PENDING').length}
          </span>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>🔍 Arama</label>
          <input
            type="text"
            placeholder="Sipariş no, masa no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <label>📊 Durum</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">Tümü</option>
            <option value="PENDING">Beklemede</option>
            <option value="PREPARING">Hazırlanıyor</option>
            <option value="READY">Hazır</option>
            <option value="DELIVERED">Teslim Edildi</option>
          </select>
        </div>
        <div className="filter-group">
          <label>📅 Tarih</label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">Tümü</option>
            <option value="TODAY">Bugün</option>
            <option value="WEEK">Son 7 Gün</option>
            <option value="MONTH">Son 30 Gün</option>
          </select>
        </div>
      </div>

      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <p>📭 Sipariş bulunamadı</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div
              key={order.id}
              className={`order-card ${selectedOrder?.id === order.id ? 'selected' : ''}`}
              onClick={() => {
                orderAPI.getById(order.id)
                  .then(response => setSelectedOrder(response.data))
                  .catch(error => {
                    console.error('Sipariş detayı yüklenemedi:', error)
                    toast.error('Sipariş detayı yüklenemedi')
                  })
              }}
            >
              <div className="order-header">
                <div className="order-info">
                  <h3>{order.orderNumber || `Sipariş #${order.id}`}</h3>
                  <p className="table-info">Masa: {order.restaurantTable?.tableNumber || 'Bilinmiyor'}</p>
                </div>
                <div
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {getStatusLabel(order.status)}
                </div>
              </div>
              
              <div className="order-details">
                <p className="order-time">⏰ {formatDate(order.createdAt)}</p>
                <p className="order-total">💰 {parseFloat(order.totalAmount || 0).toFixed(2)} ₺</p>
                {order.orderItems && (
                  <p className="order-items-count">📦 {order.orderItems.length} ürün</p>
                )}
              </div>

              <div className="order-actions">
                <select
                  value={order.status || 'PENDING'}
                  onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="status-select"
                  style={{ borderColor: getStatusColor(order.status) }}
                >
                  <option value="PENDING">Beklemede</option>
                  <option value="PREPARING">Hazırlanıyor</option>
                  <option value="READY">Hazır</option>
                  <option value="DELIVERED">Teslim Edildi</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sipariş Detay Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content order-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Sipariş Detayı - {selectedOrder.orderNumber || `#${selectedOrder.id}`}</h2>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Genel Bilgiler</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Masa:</span>
                    <span className="detail-value">{selectedOrder.restaurantTable?.tableNumber || 'Bilinmiyor'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Durum:</span>
                    <span
                      className="detail-value"
                      style={{ color: getStatusColor(selectedOrder.status) }}
                    >
                      {getStatusLabel(selectedOrder.status)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Tarih:</span>
                    <span className="detail-value">{formatDate(selectedOrder.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Toplam:</span>
                    <span className="detail-value">{parseFloat(selectedOrder.totalAmount || 0).toFixed(2)} ₺</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ödeme Yöntemi:</span>
                    <span className="detail-value">
                      {selectedOrder.paymentMethod === 'online' ? 'Online Ödeme' : 'Kasada Ödeme'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ödeme Durumu:</span>
                    <span className="detail-value">{selectedOrder.paymentStatus || 'Beklemede'}</span>
                  </div>
                </div>
              </div>

              {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 && (
                <div className="detail-section">
                  <h3>Ürünler</h3>
                  <div className="items-list">
                    {selectedOrder.orderItems.map((item, index) => (
                      <div key={index} className="order-item-detail">
                        <div className="item-info">
                          <p className="item-name">{item.product?.name || 'Ürün adı bulunamadı'}</p>
                          <p className="item-quantity">Adet: {item.quantity}</p>
                          {item.notes && (
                            <p className="item-notes">📝 Not: {item.notes}</p>
                          )}
                        </div>
                        <p className="item-price">
                          {parseFloat(item.subtotal || item.unitPrice * item.quantity || 0).toFixed(2)} ₺
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedOrder.customerNotes && (
                <div className="detail-section">
                  <h3>Müşteri Notu</h3>
                  <p>{selectedOrder.customerNotes}</p>
                </div>
              )}

              <div className="detail-actions">
                <select
                  value={selectedOrder.status || 'PENDING'}
                  onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                  className="status-select-large"
                  style={{ borderColor: getStatusColor(selectedOrder.status) }}
                >
                  <option value="PENDING">Beklemede</option>
                  <option value="PREPARING">Hazırlanıyor</option>
                  <option value="READY">Hazır</option>
                  <option value="DELIVERED">Teslim Edildi</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderManagement

