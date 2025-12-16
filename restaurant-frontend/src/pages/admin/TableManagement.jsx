import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { tableAPI } from '../../services/api'
import { toast } from 'react-toastify'
import './TableManagement.css'

function TableManagement() {
  const navigate = useNavigate()
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTableModal, setShowTableModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedTable, setSelectedTable] = useState(null)
  const [qrCodeImage, setQrCodeImage] = useState(null)
  const [editingTable, setEditingTable] = useState(null)

  const [tableForm, setTableForm] = useState({
    tableNumber: '',
    capacity: 4,
    location: 'Salon',
    occupied: false
  })

  useEffect(() => {
    loadTables()
  }, [])

  const loadTables = async () => {
    try {
      setLoading(true)
      const response = await tableAPI.getAll()
      const tablesData = response.data || []
      
      // Masaları ID'ye göre sırala (küçükten büyüğe)
      const sortedTables = [...tablesData].sort((a, b) => {
        // Önce ID'ye göre sırala
        if (a.id !== b.id) {
          return a.id - b.id
        }
        // ID eşitse (olmayacak ama yine de) tableNumber'a göre sırala
        return (a.tableNumber || '').localeCompare(b.tableNumber || '')
      })
      
      setTables(sortedTables)
    } catch (error) {
      console.error('Masalar yüklenemedi:', error)
      toast.error('Masalar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTable = () => {
    setEditingTable(null)
    setTableForm({
      tableNumber: '',
      capacity: 4,
      location: 'Salon',
      occupied: false
    })
    setShowTableModal(true)
  }

  const handleEditTable = (table) => {
    setEditingTable(table)
    setTableForm({
      tableNumber: table.tableNumber || '',
      capacity: table.capacity || 4,
      location: table.location || 'Salon',
      occupied: table.occupied || false
    })
    setShowTableModal(true)
  }

  const handleSaveTable = async () => {
    if (!tableForm.tableNumber) {
      toast.error('Lütfen masa numarasını girin')
      return
    }

    try {
      const tableId = editingTable?.id
      if (editingTable && tableId) {
        console.log('Güncellenecek masa ID:', tableId, 'Masa:', editingTable.tableNumber)
        await tableAPI.update(tableId, { ...tableForm, id: tableId })
        toast.success('Masa güncellendi')
      } else {
        await tableAPI.create(tableForm)
        toast.success('Masa eklendi')
      }

      setShowTableModal(false)
      setEditingTable(null)
      setTableForm({
        tableNumber: '',
        capacity: 4,
        location: 'Salon',
        occupied: false
      })
      loadTables()
    } catch (error) {
      console.error('Masa kaydetme hatası:', error)
      console.error('Hata detayı:', error.response?.data)
      toast.error('Masa kaydedilemedi')
    }
  }

  const handleDeleteTable = async (id) => {
    if (!window.confirm('Bu masayı silmek istediğinize emin misiniz?')) {
      return
    }

    try {
      await tableAPI.delete(id)
      toast.success('Masa silindi')
      loadTables()
    } catch (error) {
      console.error('Masa silme hatası:', error)
      toast.error('Masa silinemedi')
    }
  }

  const handleViewQR = async (table) => {
    try {
      setSelectedTable(table)
      const response = await tableAPI.getQRCode(table.id)
      const imageUrl = URL.createObjectURL(response.data)
      setQrCodeImage(imageUrl)
      setShowQRModal(true)
    } catch (error) {
      console.error('QR kod yükleme hatası:', error)
      toast.error('QR kod yüklenemedi')
    }
  }

  const handleDownloadQR = async (table) => {
    try {
      const response = await tableAPI.getQRCode(table.id)
      const url = window.URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = `qr-code-${table.tableNumber.replace(/\s+/g, '-')}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('QR kod indirildi')
    } catch (error) {
      console.error('QR kod indirme hatası:', error)
      toast.error('QR kod indirilemedi')
    }
  }

  const handleRegenerateQR = async (table) => {
    try {
      await tableAPI.regenerateQR(table.id)
      toast.success('QR kod yeniden oluşturuldu')
      loadTables()
    } catch (error) {
      console.error('QR kod yeniden oluşturma hatası:', error)
      toast.error('QR kod yeniden oluşturulamadı')
    }
  }

  const handleToggleOccupied = async (table) => {
    try {
      await tableAPI.update(table.id, {
        ...table,
        occupied: !table.occupied
      })
      toast.success(`Masa ${!table.occupied ? 'dolu' : 'boş'} olarak işaretlendi`)
      loadTables()
    } catch (error) {
      console.error('Masa durumu güncelleme hatası:', error)
      toast.error('Masa durumu güncellenemedi')
    }
  }

  if (loading) {
    return <div className="admin-loading">Yükleniyor...</div>
  }

  return (
    <div className="table-management">
      <div className="management-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/admin')}>
            ← Geri
          </button>
          <h1>🪑 Masa Yönetimi</h1>
        </div>
        <button className="add-btn primary" onClick={handleAddTable}>
          + Masa Ekle
        </button>
      </div>

      <div className="tables-grid">
        {tables.map(table => (
          <div key={table.id} className={`table-card ${table.occupied ? 'occupied' : ''}`}>
            <div className="table-header">
              <div>
                <h3>{table.tableNumber}</h3>
                <span className="table-id">ID: {table.id}</span>
              </div>
              <div className={`status-badge ${table.occupied ? 'occupied' : 'available'}`}>
                {table.occupied ? '🟢 Dolu' : '⚪ Boş'}
              </div>
            </div>
            
            <div className="table-details">
              <p><strong>Kapasite:</strong> {table.capacity} kişi</p>
              <p><strong>Konum:</strong> {table.location || 'Belirtilmemiş'}</p>
              {table.qrCode && (
                <p className="qr-info">✅ QR Kod mevcut</p>
              )}
            </div>

            <div className="table-actions">
              <button
                className="action-btn view-qr"
                onClick={() => handleViewQR(table)}
                title="QR Kodu Görüntüle"
              >
                📱 QR Kod
              </button>
              <button
                className="action-btn download-qr"
                onClick={() => handleDownloadQR(table)}
                title="QR Kodu İndir"
              >
                ⬇️ İndir
              </button>
              <button
                className="action-btn regenerate-qr"
                onClick={() => handleRegenerateQR(table)}
                title="QR Kodu Yeniden Oluştur"
              >
                🔄 Yenile
              </button>
              <button
                className={`action-btn toggle-status ${table.occupied ? 'free' : 'occupy'}`}
                onClick={() => handleToggleOccupied(table)}
                title={table.occupied ? 'Boş Yap' : 'Dolu Yap'}
              >
                {table.occupied ? '🟢 Boş Yap' : '🔴 Dolu Yap'}
              </button>
              <button
                className="action-btn edit"
                onClick={() => handleEditTable(table)}
                title="Düzenle"
              >
                ✏️ Düzenle
              </button>
              <button
                className="action-btn delete"
                onClick={() => handleDeleteTable(table.id)}
                title="Sil"
              >
                🗑️ Sil
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Masa Modal */}
      {showTableModal && (
        <div className="modal-overlay" onClick={() => {
          setShowTableModal(false)
          setEditingTable(null)
          setTableForm({
            tableNumber: '',
            capacity: 4,
            location: 'Salon',
            occupied: false
          })
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTable ? `Masa Düzenle (ID: ${editingTable.id})` : 'Yeni Masa Ekle'}</h2>
              <button className="modal-close" onClick={() => {
                setShowTableModal(false)
                setEditingTable(null)
                setTableForm({
                  tableNumber: '',
                  capacity: 4,
                  location: 'Salon',
                  occupied: false
                })
              }}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Masa Numarası *</label>
                <input
                  type="text"
                  value={tableForm.tableNumber}
                  onChange={(e) => setTableForm({ ...tableForm, tableNumber: e.target.value })}
                  placeholder="Masa 1"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Kapasite (kişi) *</label>
                  <input
                    type="number"
                    min="1"
                    value={tableForm.capacity}
                    onChange={(e) => setTableForm({ ...tableForm, capacity: parseInt(e.target.value) || 4 })}
                  />
                </div>
                <div className="form-group">
                  <label>Konum</label>
                  <input
                    type="text"
                    value={tableForm.location}
                    onChange={(e) => setTableForm({ ...tableForm, location: e.target.value })}
                    placeholder="Salon"
                  />
                </div>
              </div>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={tableForm.occupied}
                  onChange={(e) => setTableForm({ ...tableForm, occupied: e.target.checked })}
                />
                Dolu
              </label>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowTableModal(false)}>İptal</button>
              <button className="submit-btn" onClick={handleSaveTable}>Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* QR Kod Modal */}
      {showQRModal && selectedTable && (
        <div className="modal-overlay" onClick={() => setShowQRModal(false)}>
          <div className="modal-content qr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedTable.tableNumber} - QR Kod</h2>
              <button className="modal-close" onClick={() => setShowQRModal(false)}>✕</button>
            </div>
            <div className="modal-body qr-body">
              {qrCodeImage && (
                <div className="qr-code-container">
                  <img src={qrCodeImage} alt="QR Code" className="qr-code-image" />
                  <p className="qr-info-text">
                    Bu QR kodu müşteriler masadaki QR kodu okutarak menüye erişebilir.
                  </p>
                  <div className="qr-actions">
                    <button
                      className="download-btn"
                      onClick={() => handleDownloadQR(selectedTable)}
                    >
                      ⬇️ QR Kodu İndir
                    </button>
                    <button
                      className="regenerate-btn"
                      onClick={() => {
                        handleRegenerateQR(selectedTable)
                        setShowQRModal(false)
                      }}
                    >
                      🔄 QR Kodu Yeniden Oluştur
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TableManagement

