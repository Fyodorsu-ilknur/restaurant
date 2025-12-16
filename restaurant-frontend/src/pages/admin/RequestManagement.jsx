import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { tableRequestAPI } from '../../services/api'
import { toast } from 'react-toastify'
import './RequestManagement.css'

function RequestManagement() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [filteredRequests, setFilteredRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')

  useEffect(() => {
    loadRequests()
  }, [])

  useEffect(() => {
    filterRequests()
  }, [requests, statusFilter, typeFilter])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const response = await tableRequestAPI.getAll()
      const requestsData = response.data || []
      
      // İstekleri tarihe göre sırala (yeni → eski)
      const sortedRequests = [...requestsData].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0)
        const dateB = new Date(b.createdAt || 0)
        return dateB - dateA
      })
      
      setRequests(sortedRequests)
    } catch (error) {
      console.error('İstekler yüklenemedi:', error)
      toast.error('İstekler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const filterRequests = () => {
    let filtered = [...requests]

    // Durum filtresi
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(request => 
        request.status?.toUpperCase() === statusFilter.toUpperCase()
      )
    }

    // Tip filtresi
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(request => 
        request.requestType?.toUpperCase() === typeFilter.toUpperCase()
      )
    }

    setFilteredRequests(filtered)
  }

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await tableRequestAPI.updateStatus(requestId, newStatus)
      toast.success('İstek durumu güncellendi')
      loadRequests()
      if (selectedRequest && selectedRequest.id === requestId) {
        const response = await tableRequestAPI.getById(requestId)
        setSelectedRequest(response.data)
      }
    } catch (error) {
      console.error('İstek durumu güncellenemedi:', error)
      toast.error('İstek durumu güncellenemedi')
    }
  }

  const getTypeIcon = (type) => {
    switch (type?.toUpperCase()) {
      case 'GARSON_CAĞIR':
        return '🛎️'
      case 'İSTEK':
        return '📋'
      case 'ŞİKAYET':
        return '⚠️'
      case 'YARDIM':
        return '🆘'
      default:
        return '📢'
    }
  }

  const getTypeLabel = (type) => {
    switch (type?.toUpperCase()) {
      case 'GARSON_CAĞIR':
        return 'Garson Çağır'
      case 'İSTEK':
        return 'İstek'
      case 'ŞİKAYET':
        return 'Şikayet'
      case 'YARDIM':
        return 'Yardım'
      default:
        return type || 'Bilinmeyen'
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return '#ff9800'
      case 'IN_PROGRESS':
        return '#2196f3'
      case 'RESOLVED':
        return '#4caf50'
      default:
        return '#666'
    }
  }

  const getStatusLabel = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'Beklemede'
      case 'IN_PROGRESS':
        return 'İşlemde'
      case 'RESOLVED':
        return 'Çözüldü'
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

  if (loading) {
    return <div className="admin-loading">Yükleniyor...</div>
  }

  return (
    <div className="request-management">
      <div className="management-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/admin')}>
            ← Geri
          </button>
          <h1>🔔 İstek/Şikayet Yönetimi</h1>
        </div>
        <button className="refresh-btn" onClick={loadRequests}>
          🔄 Yenile
        </button>
      </div>

      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-label">Toplam İstek:</span>
          <span className="stat-value">{filteredRequests.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Bekleyen:</span>
          <span className="stat-value warning">
            {filteredRequests.filter(r => r.status === 'PENDING').length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Çözülen:</span>
          <span className="stat-value success">
            {filteredRequests.filter(r => r.status === 'RESOLVED').length}
          </span>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>📊 Durum</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">Tümü</option>
            <option value="PENDING">Beklemede</option>
            <option value="IN_PROGRESS">İşlemde</option>
            <option value="RESOLVED">Çözüldü</option>
          </select>
        </div>
        <div className="filter-group">
          <label>📋 Tip</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">Tümü</option>
            <option value="GARSON_CAĞIR">Garson Çağır</option>
            <option value="İSTEK">İstek</option>
            <option value="ŞİKAYET">Şikayet</option>
            <option value="YARDIM">Yardım</option>
          </select>
        </div>
      </div>

      <div className="requests-list">
        {filteredRequests.length === 0 ? (
          <div className="no-requests">
            <p>📭 İstek bulunamadı</p>
          </div>
        ) : (
          filteredRequests.map(request => (
            <div
              key={request.id}
              className={`request-card ${selectedRequest?.id === request.id ? 'selected' : ''} ${request.status === 'PENDING' ? 'pending' : ''}`}
              onClick={() => {
                tableRequestAPI.getById(request.id)
                  .then(response => setSelectedRequest(response.data))
                  .catch(error => {
                    console.error('İstek detayı yüklenemedi:', error)
                    toast.error('İstek detayı yüklenemedi')
                  })
              }}
            >
              <div className="request-header">
                <div className="request-info">
                  <div className="request-type-badge">
                    {getTypeIcon(request.requestType)} {getTypeLabel(request.requestType)}
                  </div>
                  <p className="table-info">Masa: {request.restaurantTable?.tableNumber || 'Bilinmiyor'}</p>
                </div>
                <div
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(request.status) }}
                >
                  {getStatusLabel(request.status)}
                </div>
              </div>
              
              <div className="request-message">
                {request.message ? (
                  <p>{request.message}</p>
                ) : (
                  <p className="no-message">Mesaj yok</p>
                )}
              </div>

              <div className="request-footer">
                <span className="request-time">⏰ {formatDate(request.createdAt)}</span>
                <select
                  value={request.status || 'PENDING'}
                  onChange={(e) => handleStatusUpdate(request.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="status-select"
                  style={{ borderColor: getStatusColor(request.status) }}
                >
                  <option value="PENDING">Beklemede</option>
                  <option value="IN_PROGRESS">İşlemde</option>
                  <option value="RESOLVED">Çözüldü</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      {/* İstek Detay Modal */}
      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal-content request-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {getTypeIcon(selectedRequest.requestType)} {getTypeLabel(selectedRequest.requestType)}
              </h2>
              <button className="modal-close" onClick={() => setSelectedRequest(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Genel Bilgiler</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Masa:</span>
                    <span className="detail-value">
                      {selectedRequest.restaurantTable?.tableNumber || 'Bilinmiyor'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Tip:</span>
                    <span className="detail-value">
                      {getTypeIcon(selectedRequest.requestType)} {getTypeLabel(selectedRequest.requestType)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Durum:</span>
                    <span
                      className="detail-value"
                      style={{ color: getStatusColor(selectedRequest.status) }}
                    >
                      {getStatusLabel(selectedRequest.status)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Oluşturulma:</span>
                    <span className="detail-value">{formatDate(selectedRequest.createdAt)}</span>
                  </div>
                  {selectedRequest.resolvedAt && (
                    <div className="detail-item">
                      <span className="detail-label">Çözülme:</span>
                      <span className="detail-value">{formatDate(selectedRequest.resolvedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedRequest.message && (
                <div className="detail-section">
                  <h3>Mesaj</h3>
                  <div className="message-box">
                    <p>{selectedRequest.message}</p>
                  </div>
                </div>
              )}

              <div className="detail-actions">
                <select
                  value={selectedRequest.status || 'PENDING'}
                  onChange={(e) => handleStatusUpdate(selectedRequest.id, e.target.value)}
                  className="status-select-large"
                  style={{ borderColor: getStatusColor(selectedRequest.status) }}
                >
                  <option value="PENDING">Beklemede</option>
                  <option value="IN_PROGRESS">İşlemde</option>
                  <option value="RESOLVED">Çözüldü</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RequestManagement

