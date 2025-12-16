import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import './QRScannerPage.css'

function QRScannerPage() {
  const navigate = useNavigate()

  const handleManualEntry = () => {
    const tableId = prompt('Masa numarasını girin:')
    if (tableId) {
      navigate(`/menu?tableId=${tableId}`)
    }
  }

  return (
    <div className="qr-scanner-page">
      <div className="qr-scanner-container">
        <h1>QR Kodu Okutun</h1>
        <p className="subtitle">Masadaki QR kodu telefonunuzun kamerasıyla okutun</p>
        
        <div className="qr-reader-wrapper" style={{ 
          width: '100%', 
          maxWidth: '400px', 
          minHeight: '300px',
          background: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '10px',
          margin: '20px auto'
        }}>
          <p style={{ color: '#666' }}>QR Kod Okutucu yakında eklenecek</p>
        </div>

        <button 
          className="manual-enter-btn"
          onClick={handleManualEntry}
        >
          Manuel Giriş
        </button>
      </div>
    </div>
  )
}

export default QRScannerPage

