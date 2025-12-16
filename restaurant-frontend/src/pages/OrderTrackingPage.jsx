import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { orderAPI } from '../services/api'
import websocketService from '../services/websocket'
import { toast } from 'react-toastify'
import './OrderTrackingPage.css'

function OrderTrackingPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const tableId = location.state?.tableId

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statusHistory, setStatusHistory] = useState([])

  useEffect(() => {
    loadOrder()
    connectWebSocket()

    return () => {
      websocketService.disconnect()
    }
  }, [orderId, tableId])

  const loadOrder = async () => {
    try {
      const response = await orderAPI.getById(orderId)
      setOrder(response.data)
      updateStatusHistory(response.data.status)
    } catch (error) {
      toast.error('Sipariş bilgisi yüklenemedi')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const connectWebSocket = async () => {
    try {
      await websocketService.connect()
      
      if (tableId) {
        const subscription = websocketService.subscribeToTable(tableId, (notification) => {
          if (notification.orderId === parseInt(orderId)) {
            setOrder(prevOrder => ({
              ...prevOrder,
              status: notification.status
            }))
            updateStatusHistory(notification.status)
            toast.info(`Sipariş durumu: ${getStatusText(notification.status)}`)
          }
        })
      }
    } catch (error) {
      console.error('WebSocket bağlantı hatası:', error)
    }
  }

  const updateStatusHistory = (currentStatus) => {
    const statuses = [
      { status: 'PENDING', label: 'Sipariş Alındı', icon: '📝' },
      { status: 'CONFIRMED', label: 'Sipariş Onaylandı', icon: '✅' },
      { status: 'PREPARING', label: 'Hazırlanıyor', icon: '👨‍🍳' },
      { status: 'READY', label: 'Hazır', icon: '🍽️' },
      { status: 'DELIVERED', label: 'Teslim Edildi', icon: '✓' },
      { status: 'COMPLETED', label: 'Tamamlandı', icon: '🎉' }
    ]

    const currentIndex = statuses.findIndex(s => s.status === currentStatus)
    const history = statuses.slice(0, currentIndex + 1)
    setStatusHistory(history)
  }

  const getStatusText = (status) => {
    const statusMap = {
      'PENDING': 'Sipariş Alındı',
      'CONFIRMED': 'Sipariş Onaylandı',
      'PREPARING': 'Hazırlanıyor',
      'READY': 'Hazır',
      'DELIVERED': 'Teslim Edildi',
      'COMPLETED': 'Tamamlandı'
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status) => {
    const colorMap = {
      'PENDING': '#ff9800',
      'CONFIRMED': '#2196f3',
      'PREPARING': '#9c27b0',
      'READY': '#4caf50',
      'DELIVERED': '#8bc34a',
      'COMPLETED': '#c41e3a'
    }
    return colorMap[status] || '#999'
  }

  if (loading) {
    return <div className="loading">Yükleniyor...</div>
  }

  if (!order) {
    return (
      <div className="error-page">
        <h2>Sipariş bulunamadı</h2>
        <button onClick={() => navigate('/')}>Ana Sayfaya Dön</button>
      </div>
    )
  }

  return (
    <div className="order-tracking-page">
      <div className="tracking-container">
        <div className="tracking-header">
          <h1>Sipariş Takibi</h1>
          <p className="order-number">Sipariş No: {order.orderNumber}</p>
        </div>

        <div className="status-timeline">
          <h2>Sipariş Durumu</h2>
          <div className="timeline">
            {statusHistory.map((item, index) => (
              <div
                key={index}
                className={`timeline-item ${index === statusHistory.length - 1 ? 'active' : 'completed'}`}
              >
                <div className="timeline-icon">{item.icon}</div>
                <div className="timeline-content">
                  <h3>{item.label}</h3>
                  {index === statusHistory.length - 1 && (
                    <p className="current-status">Şu anki durum</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="order-details">
          <h2>Sipariş Detayları</h2>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Masa:</span>
              <span className="detail-value">{order.restaurantTable?.tableNumber || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Toplam Tutar:</span>
              <span className="detail-value">{parseFloat(order.totalAmount).toFixed(2)} ₺</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Ödeme Yöntemi:</span>
              <span className="detail-value">
                {order.paymentMethod === 'online' ? 'Online Ödeme' : 'Kasada Ödeme'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Ödeme Durumu:</span>
              <span className="detail-value">{order.paymentStatus || 'Beklemede'}</span>
            </div>
          </div>

          {order.orderItems && order.orderItems.length > 0 && (
            <div className="order-items-section">
              <h3>Sipariş İçeriği</h3>
              <div className="order-items-list">
                {order.orderItems.map((item, index) => (
                  <div key={index} className="tracking-order-item">
                    <div className="item-info">
                      <h4>{item.product?.name || 'Ürün'}</h4>
                      <p>Adet: {item.quantity}</p>
                      {item.notes && <p className="item-notes">Not: {item.notes}</p>}
                    </div>
                    <div className="item-price">
                      {parseFloat(item.subtotal).toFixed(2)} ₺
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {order.customerNotes && (
            <div className="customer-notes">
              <h3>Müşteri Notları</h3>
              <p>{order.customerNotes}</p>
            </div>
          )}
        </div>

        <div className="tracking-actions">
          <button onClick={() => navigate('/')} className="home-btn">
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderTrackingPage

