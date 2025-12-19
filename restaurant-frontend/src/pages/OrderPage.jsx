import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { orderAPI, tableAPI } from '../services/api'
import { toast } from 'react-toastify'
import './OrderPage.css'

function OrderPage() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  
  const tableId = searchParams.get('tableId')
  const cart = location.state?.cart || []
  const tableIdFromState = location.state?.tableId

  const [table, setTable] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('online')
  const [customerNotes, setCustomerNotes] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!tableId && !tableIdFromState) {
      toast.error('Masa bilgisi bulunamadı')
      navigate('/')
      return
    }

    const currentTableId = tableId || tableIdFromState
    loadTable(currentTableId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableId, tableIdFromState])

  const loadTable = async (id) => {
    if (!id) return
    
    try {
      // Önce ID olarak dene
      const tableIdNum = parseInt(id)
      if (!isNaN(tableIdNum) && tableIdNum > 0) {
        try {
          const response = await tableAPI.getById(tableIdNum)
          if (response.data && response.data.id) {
            setTable(response.data)
            return
          }
        } catch (idError) {
          // ID ile bulunamazsa tableNumber olarak dene
        }
      }
      
      // tableNumber olarak dene (örn: "Masa 10" veya sadece "10")
      let tableNumberToSearch = id
      
      // Eğer id sayısal bir değerse, "Masa {numara}" formatında dene
      if (!isNaN(parseInt(id))) {
        tableNumberToSearch = `Masa ${id}`
      }
      
      try {
        const response = await tableAPI.getByNumber(tableNumberToSearch)
        if (response.data && response.data.id) {
          setTable(response.data)
          return
        }
      } catch (numberError) {
        // "Masa X" formatı da çalışmazsa, sadece sayıyı dene
        if (tableNumberToSearch.startsWith('Masa ')) {
          const justNumber = tableNumberToSearch.replace('Masa ', '')
          try {
            const response = await tableAPI.getByNumber(justNumber)
            if (response.data && response.data.id) {
              setTable(response.data)
              return
            }
          } catch (finalError) {
            // Son deneme de başarısız - sessizce devam et
          }
        }
      }
      
      // Hiçbir yöntemle masa bulunamadı - sessizce devam et
      // Masa bilgisi yüklenemedi ama sipariş oluşturulabilir
    } catch (error) {
      // Masa yükleme hatası - sessizce devam et
    }
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      return total + (parseFloat(item.product.price) * item.quantity)
    }, 0)
  }

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      toast.error('Sepetiniz boş')
      return
    }

    const currentTableId = tableId || tableIdFromState
    if (!currentTableId) {
      toast.error('Masa bilgisi bulunamadı')
      return
    }

    setLoading(true)

    try {
      const orderItems = cart.map(item => ({
        product: { id: item.product.id },
        quantity: item.quantity,
        unitPrice: parseFloat(item.product.price),
        subtotal: parseFloat(item.product.price) * item.quantity,
        notes: item.notes
      }))

      // Masa bilgisini al (table veya tableId'den)
      let tableIdForOrder
      if (table && table.id) {
        tableIdForOrder = table.id
      } else {
        // table yüklenemediyse, tekrar yükle
        await loadTable(currentTableId)
        
        // Yükleme sonrası tekrar kontrol et
        if (table && table.id) {
          tableIdForOrder = table.id
        } else {
          // Hala bulunamadıysa, tableId'yi parse et
          const parsedId = parseInt(currentTableId)
          if (isNaN(parsedId)) {
            // Sayısal değilse, masa numarası olarak tekrar yükle
            try {
              const tableResponse = await tableAPI.getByNumber(currentTableId)
              if (tableResponse.data && tableResponse.data.id) {
                tableIdForOrder = tableResponse.data.id
                setTable(tableResponse.data)
              } else {
                toast.error('Masa bulunamadı. Lütfen QR kodu tekrar tarayın.')
                setLoading(false)
                return
              }
            } catch (tableError) {
              // "Masa X" formatını dene
              try {
                const tableResponse = await tableAPI.getByNumber(`Masa ${currentTableId}`)
                if (tableResponse.data && tableResponse.data.id) {
                  tableIdForOrder = tableResponse.data.id
                  setTable(tableResponse.data)
                } else {
                  toast.error('Masa bulunamadı. Lütfen QR kodu tekrar tarayın.')
                  setLoading(false)
                  return
                }
              } catch (finalError) {
                toast.error('Masa bulunamadı. Lütfen QR kodu tekrar tarayın.')
                setLoading(false)
                return
              }
            }
          } else {
            // Sayısal değer, ID olarak kullan ama önce kontrol et
            try {
              const tableResponse = await tableAPI.getById(parsedId)
              if (tableResponse.data && tableResponse.data.id) {
                tableIdForOrder = tableResponse.data.id
                setTable(tableResponse.data)
              } else {
                // ID ile bulunamadı, "Masa X" formatında dene
                try {
                  const tableResponse2 = await tableAPI.getByNumber(`Masa ${parsedId}`)
                  if (tableResponse2.data && tableResponse2.data.id) {
                    tableIdForOrder = tableResponse2.data.id
                    setTable(tableResponse2.data)
                  } else {
                    toast.error('Masa bulunamadı. Lütfen QR kodu tekrar tarayın.')
                    setLoading(false)
                    return
                  }
                } catch (tableError2) {
                  toast.error('Masa bulunamadı. Lütfen QR kodu tekrar tarayın.')
                  setLoading(false)
                  return
                }
              }
            } catch (idError) {
              // ID ile bulunamadı, "Masa X" formatında dene
              try {
                const tableResponse = await tableAPI.getByNumber(`Masa ${parsedId}`)
                if (tableResponse.data && tableResponse.data.id) {
                  tableIdForOrder = tableResponse.data.id
                  setTable(tableResponse.data)
                } else {
                  toast.error('Masa bulunamadı. Lütfen QR kodu tekrar tarayın.')
                  setLoading(false)
                  return
                }
              } catch (tableError) {
                toast.error('Masa bulunamadı. Lütfen QR kodu tekrar tarayın.')
                setLoading(false)
                return
              }
            }
          }
        }
      }
      
      // Masa ID'sinin geçerli olduğundan emin ol
      if (!tableIdForOrder || tableIdForOrder <= 0) {
        toast.error('Geçersiz masa bilgisi')
        setLoading(false)
        return
      }

      const order = {
        restaurantTable: { id: tableIdForOrder },
        orderItems: orderItems,
        totalAmount: getTotalPrice(),
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'online' ? 'PENDING' : 'CASH_PENDING',
        customerNotes: customerNotes,
        status: 'PENDING'
      }

      const response = await orderAPI.create(order)
      const orderId = response.data.id

      toast.success('Siparişiniz alındı!')

      if (paymentMethod === 'online') {
        // Online ödeme için ödeme sayfasına yönlendir (ileride eklenecek)
        toast.info('Online ödeme özelliği yakında eklenecek')
      }

      // Sipariş takip sayfasına yönlendir
      navigate(`/tracking/${orderId}`, { state: { tableId: currentTableId } })
    } catch (error) {
      // Sipariş oluşturma hatası toast ile gösteriliyor
      let errorMessage = 'Sipariş oluşturulurken hata oluştu'
      
      if (error.response) {
        // Backend'den gelen hata mesajı
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      error.response.statusText || 
                      errorMessage
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
      
      // Console'a detaylı hata logla (debug için)
      console.error('Sipariş oluşturma hatası:', {
        error,
        response: error.response,
        order,
        tableIdForOrder
      })
    } finally {
      setLoading(false)
    }
  }

  if (!table && !tableId && !tableIdFromState) {
    return <div className="loading">Yükleniyor...</div>
  }

  return (
    <div className="order-page">
      <div className="order-container">
        <h1>Sipariş Özeti</h1>

        <div className="order-section">
          <h2>Masa Bilgisi</h2>
          <p>Masa: {table?.tableNumber || tableId || tableIdFromState}</p>
        </div>

        <div className="order-section">
          <h2>Sipariş Detayları</h2>
          <div className="order-items">
            {cart.map((item, index) => (
              <div key={index} className="order-item">
                <div className="order-item-info">
                  <h4>{item.product.name}</h4>
                  <p className="quantity">Adet: {item.quantity}</p>
                  {item.notes && <p className="notes">Not: {item.notes}</p>}
                </div>
                <div className="order-item-price">
                  {(parseFloat(item.product.price) * item.quantity).toFixed(2)} ₺
                </div>
              </div>
            ))}
          </div>
          <div className="order-total">
            <strong>Toplam: {getTotalPrice().toFixed(2)} ₺</strong>
          </div>
        </div>

        <div className="order-section">
          <h2>Ödeme Yöntemi</h2>
          <div className="payment-options">
            <label className="payment-option">
              <input
                type="radio"
                value="online"
                checked={paymentMethod === 'online'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>Online Ödeme (Kredi Kartı, Yemek Kartı)</span>
            </label>
            <label className="payment-option">
              <input
                type="radio"
                value="cash"
                checked={paymentMethod === 'cash'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>Kasada Ödeme</span>
            </label>
          </div>
        </div>

        <div className="order-section">
          <h2>Ek Notlar</h2>
          <textarea
            value={customerNotes}
            onChange={(e) => setCustomerNotes(e.target.value)}
            placeholder="Siparişinizle ilgili ek notlarınızı buraya yazabilirsiniz..."
            className="notes-textarea"
            rows="4"
          />
        </div>

        <div className="order-actions">
          <button
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            Geri Dön
          </button>
          <button
            className="submit-btn"
            onClick={handleSubmitOrder}
            disabled={loading || cart.length === 0}
          >
            {loading ? 'Gönderiliyor...' : 'Siparişi Onayla'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderPage

