import React, { useEffect, useState } from 'react'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'
import { toast } from 'react-toastify'
import axios from 'axios'
import './KitchenPage.css'

const API_BASE_URL = 'http://localhost:8080/api'

function KitchenPage() {
  const [orders, setOrders] = useState([])
  const [stompClient, setStompClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [notifications, setNotifications] = useState([])

  // WebSocket bağlantısı kur
  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws')
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        // WebSocket bağlantısı kuruldu
        toast.success('Mutfak ekranı bağlandı', { autoClose: 2000 })
        
        // Mutfak ekranına bildirimler için abone ol
        client.subscribe('/topic/kitchen', (message) => {
          try {
            const notification = JSON.parse(message.body)
            // Yeni bildirim alındı - Debug için
            console.log('🔔 Mutfak ekranına bildirim geldi:', notification)
            
            // Sipariş bildirimi mi yoksa istek bildirimi mi?
            if (notification.orderId !== undefined && notification.orderId !== null) {
              // Sipariş bildirimi
              toast.info(notification.message || 'Yeni sipariş geldi!', {
                position: 'top-right',
                autoClose: 3000
              })
              loadOrders()
            } else if (notification.requestId !== undefined && notification.requestId !== null) {
              // İstek/Şikayet bildirimi
              const messageText = notification.notificationMessage || notification.message || 'Yeni istek/şikayet geldi!'
              
              // Bildirimi listeye ekle
              const newNotification = {
                id: Date.now(),
                requestId: notification.requestId,
                tableId: notification.tableId,
                tableNumber: notification.tableNumber,
                requestType: notification.requestType,
                message: messageText,
                createdAt: new Date()
              }
              setNotifications(prev => [newNotification, ...prev])
              
              // Toast bildirimi göster
              toast.warning(messageText, {
                position: 'top-right',
                autoClose: 5000,
                icon: '🔔'
              })
              // İstek/Şikayet bildirimi gösterildi
            } else {
              // Bilinmeyen bildirim formatı
              console.warn('⚠️ Bilinmeyen bildirim formatı:', notification)
              toast.info('Yeni bildirim geldi', {
                position: 'top-right',
                autoClose: 3000
              })
            }
          } catch (error) {
            // Bildirim parse hatası
            console.error('❌ Bildirim parse hatası:', error, message.body)
            toast.error('Bildirim işlenirken hata oluştu')
          }
        })
      },
      onStompError: (frame) => {
        // WebSocket hatası
        console.error('❌ WebSocket hatası:', frame)
        toast.error('WebSocket bağlantı hatası')
      }
    })

    client.activate()
    setStompClient(client)

    return () => {
      if (client) {
        client.deactivate()
      }
    }
  }, [])

  // Siparişleri yükle
  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/orders`)
      setOrders(response.data || [])
    } catch (error) {
      // Siparişler yükleme hatası toast ile gösteriliyor
      toast.error('Siparişler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/orders/${orderId}/status`, {
        status: newStatus
      })
      toast.success('Sipariş durumu güncellendi')
      loadOrders()
      if (selectedOrder && selectedOrder.id === orderId) {
        // Seçili siparişin detayını güncelle
        const response = await axios.get(`${API_BASE_URL}/orders/${orderId}`)
        setSelectedOrder(response.data)
      }
    } catch (error) {
      // Sipariş durumu güncelleme hatası toast ile gösteriliyor
      toast.error('Sipariş durumu güncellenemedi')
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return '#ff9800' // Turuncu
      case 'PREPARING':
      case 'HAZIRLANIYOR':
        return '#2196f3' // Mavi
      case 'READY':
      case 'HAZIR':
        return '#4caf50' // Yeşil
      case 'DELIVERED':
      case 'TESLİM EDİLDİ':
        return '#9e9e9e' // Gri
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

  const getNextStatus = (currentStatus) => {
    const status = currentStatus?.toUpperCase()
    if (status === 'PENDING') return 'PREPARING'
    if (status === 'PREPARING' || status === 'HAZIRLANIYOR') return 'READY'
    if (status === 'READY' || status === 'HAZIR') return 'DELIVERED'
    return null
  }

  const getNextStatusLabel = (currentStatus) => {
    const next = getNextStatus(currentStatus)
    if (next === 'PREPARING') return 'Hazırlamaya Başla'
    if (next === 'READY') return 'Hazır Olarak İşaretle'
    if (next === 'DELIVERED') return 'Teslim Edildi Olarak İşaretle'
    return null
  }

  const filteredOrders = orders.filter(order => {
    const status = order.status?.toUpperCase()
    return status !== 'DELIVERED' && status !== 'TESLİM EDİLDİ'
  })

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
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

  if (loading) {
    return <div className="kitchen-loading">Yükleniyor...</div>
  }

  return (
    <div className="kitchen-page">
      <header className="kitchen-header">
        <h1>🍳 Mutfak Ekranı</h1>
        <div className="header-right">
          {notifications.length > 0 && (
            <div className="notifications-badge">
              🔔 {notifications.length}
            </div>
          )}
          <button className="refresh-btn" onClick={loadOrders}>
            🔄 Yenile
          </button>
        </div>
      </header>

      {/* Bildirimler Listesi */}
      {notifications.length > 0 && (
        <div className="notifications-panel">
          <div className="notifications-header">
            <h3>🔔 Bildirimler ({notifications.length})</h3>
            <button className="clear-notifications-btn" onClick={() => setNotifications([])}>
              Temizle
            </button>
          </div>
          <div className="notifications-list">
            {notifications.map(notif => (
              <div key={notif.id} className={`notification-item ${notif.requestType === 'GARSON_CAĞIR' ? 'garson-call' : ''}`}>
                <div className="notification-content">
                  <div className="notification-icon">
                    {notif.requestType === 'GARSON_CAĞIR' ? '🛎️' : 
                     notif.requestType === 'İSTEK' ? '📋' : 
                     notif.requestType === 'ŞİKAYET' ? '⚠️' : '🔔'}
                  </div>
                  <div className="notification-text">
                    <p className="notification-message">{notif.message}</p>
                    <p className="notification-time">
                      {notif.createdAt.toLocaleTimeString('tr-TR')}
                    </p>
                  </div>
                </div>
                <button 
                  className="notification-close"
                  onClick={() => removeNotification(notif.id)}
                  title="Kapat"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="kitchen-content">
        <div className="orders-list">
          <h2>Aktif Siparişler ({filteredOrders.length})</h2>
          
          {filteredOrders.length === 0 ? (
            <div className="no-orders">
              <p>📭 Henüz aktif sipariş yok</p>
            </div>
          ) : (
            <div className="orders-grid">
              {filteredOrders.map(order => (
                <div 
                  key={order.id} 
                  className={`order-card ${selectedOrder?.id === order.id ? 'selected' : ''}`}
                  onClick={() => {
                    // Sipariş detayını yükle
                    axios.get(`${API_BASE_URL}/orders/${order.id}`)
                      .then(response => setSelectedOrder(response.data))
                      .catch(error => {
                        // Sipariş detayı yükleme hatası
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
                    <p className="order-time">
                      ⏰ {formatDate(order.createdAt)}
                    </p>
                    
                    {order.orderItems && (
                      <p className="order-items-count">
                        📦 {order.orderItems.length} ürün
                      </p>
                    )}
                  </div>

                  {getNextStatus(order.status) && (
                    <button
                      className="status-update-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        updateOrderStatus(order.id, getNextStatus(order.status))
                      }}
                    >
                      {getNextStatusLabel(order.status)}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedOrder && (
          <div className="order-detail-panel">
            <div className="detail-header">
              <h2>Sipariş Detayı</h2>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}>
                ✕
              </button>
            </div>
            
            <div className="detail-content">
              <div className="detail-section">
                <h3>Genel Bilgiler</h3>
                <p><strong>Sipariş No:</strong> {selectedOrder.orderNumber || `#${selectedOrder.id}`}</p>
                <p><strong>Masa:</strong> {selectedOrder.restaurantTable?.tableNumber || 'Bilinmiyor'}</p>
                <p><strong>Durum:</strong> 
                  <span 
                    className="status-text"
                    style={{ color: getStatusColor(selectedOrder.status) }}
                  >
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </p>
                <p><strong>Tarih:</strong> {formatDate(selectedOrder.createdAt)}</p>
                
              </div>

              {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 && (
                <div className="detail-section">
                  <h3>Ürünler</h3>
                  <div className="items-list">
                    {selectedOrder.orderItems.map((item, index) => (
                      <div key={index} className="order-item">
                        <div className="item-info">
                          <p className="item-name">
                            {item.product?.name || 'Ürün adı bulunamadı'}
                          </p>
                          <p className="item-quantity">Adet: {item.quantity}</p>
                          {item.notes && (
                            <p className="item-notes">📝 Not: {item.notes}</p>
                          )}
                        </div>

                        {/*kazancı mutfak personelinin görmesine bence gerek yok yoruma alıyomum
                        <p className="item-price">
                          {parseFloat(item.subtotal || item.unitPrice * item.quantity || 0).toFixed(2)} ₺
                        </p>*/}

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
                {getNextStatus(selectedOrder.status) && (
                  <button
                    className="action-btn primary"
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, getNextStatus(selectedOrder.status))
                    }}
                  >
                    {getNextStatusLabel(selectedOrder.status)}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default KitchenPage