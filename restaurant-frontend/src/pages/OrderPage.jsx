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
  }, [tableId, tableIdFromState])

  const loadTable = async (id) => {
    try {
      const response = await tableAPI.getById(id)
      setTable(response.data)
    } catch (error) {
      toast.error('Masa bilgisi yüklenemedi')
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

      const order = {
        restaurantTable: { id: parseInt(currentTableId) },
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
      toast.error('Sipariş oluşturulurken hata oluştu')
      console.error(error)
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

