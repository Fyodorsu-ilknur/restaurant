import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { orderAPI, tableAPI, tableRequestAPI } from '../../services/api'
import { toast } from 'react-toastify'
import './AdminDashboard.css'

function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalTables: 0,
    occupiedTables: 0,
    pendingRequests: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const [ordersRes, tablesRes, requestsRes] = await Promise.all([
        orderAPI.getAll(),
        tableAPI.getAll(),
        tableRequestAPI.getPending()
      ])

      const orders = ordersRes.data || []
      const tables = tablesRes.data || []
      const requests = requestsRes.data || []

      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'PENDING' || o.status === 'PREPARING').length,
        totalTables: tables.length,
        occupiedTables: tables.filter(t => t.occupied).length,
        pendingRequests: requests.length
      })
    } catch (error) {
      console.error('İstatistikler yüklenemedi:', error)
      toast.error('İstatistikler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="admin-loading">Yükleniyor...</div>
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>🏢 Yönetim Paneli</h1>
        <button className="refresh-btn" onClick={loadStats}>
          🔄 Yenile
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>Toplam Sipariş</h3>
            <p className="stat-value">{stats.totalOrders}</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>Bekleyen Siparişler</h3>
            <p className="stat-value">{stats.pendingOrders}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🪑</div>
          <div className="stat-info">
            <h3>Toplam Masa</h3>
            <p className="stat-value">{stats.totalTables}</p>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Dolu Masa</h3>
            <p className="stat-value">{stats.occupiedTables}</p>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon">🔔</div>
          <div className="stat-info">
            <h3>Bekleyen İstekler</h3>
            <p className="stat-value">{stats.pendingRequests}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <h2>Hızlı Erişim</h2>
        <div className="action-buttons">
          <button 
            className="action-btn"
            onClick={() => navigate('/admin/menu')}
          >
            📋 Menü Yönetimi
          </button>
          <button 
            className="action-btn"
            onClick={() => navigate('/admin/tables')}
          >
            🪑 Masa Yönetimi
          </button>
          <button 
            className="action-btn"
            onClick={() => navigate('/admin/orders')}
          >
            📦 Sipariş Yönetimi
          </button>
          <button 
            className="action-btn"
            onClick={() => navigate('/admin/requests')}
          >
            🔔 İstek/Şikayet Yönetimi
          </button>
          <button 
            className="action-btn"
            onClick={() => navigate('/kitchen')}
          >
            🍳 Mutfak Ekranı
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

