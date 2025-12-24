import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { toast } from 'react-toastify'
import './QRScannerPage.css'

function QRScannerPage() {
  const navigate = useNavigate()
  const [scanning, setScanning] = useState(false)
  
  // State yerine useRef kullanıyoruz (Böylece gereksiz render ve döngü oluşmaz)
  const scannerRef = useRef(null)

  useEffect(() => {
    // Component kapanırken (sayfa değişirse) temizlik yap
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Scanner temizleme hatası:", error);
        });
        scannerRef.current = null;
      }
    }
  }, [])

  const startScanning = async () => {
    try {
      setScanning(true)
      // Eğer eski bir instance kaldıysa temizle
      if (scannerRef.current) {
        await scannerRef.current.clear().catch(() => {});
      }

      const qrCode = new Html5Qrcode('qr-reader')
      scannerRef.current = qrCode
      
      await qrCode.start(
        { facingMode: 'environment' }, 
        {
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          handleQRCodeScanned(decodedText)
          // Başarılı okumadan sonra durdur
          stopScanning()
        },
        (errorMessage) => {
          // Okuma hatalarını yoksay (kamera odaklanırken vs. sürekli hata fırlatır)
        }
      )
    } catch (err) {
      console.error(err);
      toast.error('Kamera başlatılamadı. İzinleri kontrol edin.')
      setScanning(false)
    }
  }

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop().catch(() => {});
        await scannerRef.current.clear().catch(() => {});
      } catch (err) {
        console.log("Durdurma hatası:", err);
      }
      scannerRef.current = null;
    }
    setScanning(false)
  }

  const handleQRCodeScanned = (qrText) => {
    try {
      const url = new URL(qrText, window.location.origin)
      const tableId = url.searchParams.get('tableId')
      
      if (tableId) {
        toast.success(`Masa ${tableId} bulundu!`)
        navigate(`/menu?tableId=${tableId}`)
      } else {
        const tableIdMatch = qrText.match(/tableId[=:](\d+)/i) || qrText.match(/(\d+)/)
        if (tableIdMatch) {
          const id = tableIdMatch[1]
          toast.success(`Masa ${id} bulundu!`)
          navigate(`/menu?tableId=${id}`)
        } else {
          toast.error('Geçersiz QR kod formatı.')
        }
      }
    } catch (err) {
      const tableIdMatch = qrText.match(/(\d+)/)
      if (tableIdMatch) {
        navigate(`/menu?tableId=${tableIdMatch[1]}`)
      } else {
        toast.error('QR kod okunamadı.')
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
            <button className="start-scan-btn" onClick={startScanning}>
              📷 Taramayı Başlat
            </button>
          ) : (
            <button className="stop-scan-btn" onClick={stopScanning}>
              ⏹️ Taramayı Durdur
            </button>
          )}
          
          <button className="manual-enter-btn" onClick={handleManualEntry}>
            ⌨️ Manuel Giriş
          </button>
        </div>

        <div className="admin-links">
          {/* Linkleri login kontrolüne göre yönlendireceğiz, şimdilik böyle kalsın */}
          <button className="kitchen-link-btn" onClick={() => navigate('/kitchen')}>
            🍳 Mutfak Ekranı
          </button>
          <button className="admin-panel-btn" onClick={() => navigate('/admin')}>
            🏢 Yönetim Paneli
          </button>
        </div>
      </div>
    </div>
  )
}

export default QRScannerPage