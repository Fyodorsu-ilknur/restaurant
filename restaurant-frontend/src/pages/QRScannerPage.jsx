import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { toast } from 'react-toastify'
import './QRScannerPage.css'

function QRScannerPage() {
  const navigate = useNavigate()
  const [scanning, setScanning] = useState(false)
  const [html5QrCode, setHtml5QrCode] = useState(null)

  useEffect(() => {
    // Component unmount olduğunda scanner'ı temizle
    return () => {
      if (html5QrCode) {
        html5QrCode.stop().catch(() => {
          // Hata durumunda sessizce devam et
        })
      }
    }
  }, [html5QrCode])

  const startScanning = async () => {
    try {
      setScanning(true)
      const qrCode = new Html5Qrcode('qr-reader')
      
      await qrCode.start(
        { facingMode: 'environment' }, // Arka kamera
        {
          fps: 10, // Saniyede 10 frame
          qrbox: { width: 250, height: 250 }, // Tarama alanı
          aspectRatio: 1.0
        },
        (decodedText, decodedResult) => {
          // QR kod başarıyla okundu
          handleQRCodeScanned(decodedText)
          // Scanner'ı durdur (navigate zaten handleQRCodeScanned içinde yapılıyor)
          qrCode.stop().catch(() => {
            // Hata durumunda sessizce devam et
          })
          qrCode.clear().catch(() => {
            // Hata durumunda sessizce devam et
          })
          setScanning(false)
          setHtml5QrCode(null)
        },
        (errorMessage) => {
          // Hata mesajı (sürekli çalışır, normal)
          // Sadece gerçek hataları logla
        }
      )
      
      setHtml5QrCode(qrCode)
    } catch (err) {
      // QR kod okutucu başlatılamadı
      toast.error('Kamera erişimi sağlanamadı. Lütfen tarayıcı izinlerini kontrol edin.')
      setScanning(false)
    }
  }

  const stopScanning = async () => {
    if (html5QrCode) {
      try {
        await html5QrCode.stop()
        await html5QrCode.clear()
      } catch (err) {
        // Hata durumunda sessizce devam et
        // QR kod okutucu durduruldu
      } finally {
        setHtml5QrCode(null)
        setScanning(false)
      }
    } else {
      setScanning(false)
    }
  }

  const handleQRCodeScanned = (qrText) => {
    try {
      // QR kod içeriği: http://localhost:3000/menu?tableId=5
      // veya sadece: /menu?tableId=5
      const url = new URL(qrText, window.location.origin)
      const tableId = url.searchParams.get('tableId')
      
      if (tableId) {
        toast.success(`Masa ${tableId} bulundu!`)
        navigate(`/menu?tableId=${tableId}`)
      } else {
        // Eğer QR kod sadece tableId içeriyorsa (alternatif format)
        const tableIdMatch = qrText.match(/tableId[=:](\d+)/i)
        if (tableIdMatch) {
          const tableId = tableIdMatch[1]
          toast.success(`Masa ${tableId} bulundu!`)
          navigate(`/menu?tableId=${tableId}`)
        } else {
          toast.error('Geçersiz QR kod formatı. Lütfen masadaki QR kodu okutun.')
        }
      }
    } catch (err) {
      // URL parse edilemezse, direkt tableId olarak dene
      const tableIdMatch = qrText.match(/(\d+)/)
      if (tableIdMatch) {
        const tableId = tableIdMatch[1]
        toast.success(`Masa ${tableId} bulundu!`)
        navigate(`/menu?tableId=${tableId}`)
      } else {
        // QR kod parse edilemedi
        toast.error('Geçersiz QR kod. Lütfen masadaki QR kodu okutun.')
      }
    }
  }

  const handleManualEntry = () => {
    const tableId = prompt('Masa numarasını girin:')
    if (tableId && tableId.trim()) {
      navigate(`/menu?tableId=${tableId.trim()}`)
    }
  }

  return (
    <div className="qr-scanner-page">
      <div className="qr-scanner-container">
        <h1>QR Kodu Okutun</h1>
        <p className="subtitle">Masadaki QR kodu telefonunuzun kamerasıyla okutun</p>
        
        <div className="qr-reader-wrapper">
          <div id="qr-reader" style={{ width: '100%' }}></div>
          {scanning && <div className="scan-line"></div>}
          {!scanning && (
            <div className="scanning-message">
              <p>QR kod okutucuyu başlatmak için "Taramayı Başlat" butonuna tıklayın</p>
            </div>
          )}
        </div>

        <div className="scanner-controls">
          {!scanning ? (
            <button 
              className="start-scan-btn"
              onClick={startScanning}
            >
              📷 Taramayı Başlat
            </button>
          ) : (
            <button 
              className="stop-scan-btn"
              onClick={stopScanning}
            >
              ⏹️ Taramayı Durdur
            </button>
          )}
          
          <button 
            className="manual-enter-btn"
            onClick={handleManualEntry}
          >
            ⌨️ Manuel Giriş
          </button>
        </div>

        <div className="admin-links">
          <button 
            className="kitchen-link-btn"
            onClick={() => navigate('/kitchen')}
          >
            🍳 Mutfak Ekranı
          </button>
          <button 
            className="admin-panel-btn"
            onClick={() => navigate('/admin')}
          >
            🏢 Yönetim Paneli
          </button>
        </div>
      </div>
    </div>
  )
}

export default QRScannerPage

