import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { categoryAPI, productAPI, tableRequestAPI, tableAPI } from '../services/api'
import { toast } from 'react-toastify'
import './MenuPage.css'

function MenuPage() {
  const [searchParams] = useSearchParams()
  const tableId = searchParams.get('tableId')
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestType, setRequestType] = useState('GARSON_CAĞIR')
  const [requestMessage, setRequestMessage] = useState('')
  const [table, setTable] = useState(null)

  const allergenBadges = (product) => {
    const allergens = product.allergens || []
    const tags = []

    // Backend'den gelen alerjen bilgilerini kullan
    allergens.forEach(allergen => {
      const allergenLower = allergen.toLowerCase()
      
      // Yüksek riskli alerjenler
      if (allergenLower.includes('fıstık') || allergenLower.includes('yer fıstığı') || allergenLower.includes('peanut')) {
        tags.push({ label: '⚠️ Fıstık', type: 'danger' })
      } else if (allergenLower.includes('susam') || allergenLower.includes('tahin')) {
        tags.push({ label: '⚠️ Susam', type: 'danger' })
      } else if (allergenLower.includes('mantar')) {
        tags.push({ label: '⚠️ Mantar', type: 'danger' })
      } else if (allergenLower.includes('yumurta') || allergenLower.includes('egg')) {
        tags.push({ label: '⚠️ Yumurta', type: 'danger' })
      } else if (allergenLower.includes('laktoz') || allergenLower.includes('süt') || allergenLower.includes('dairy')) {
        tags.push({ label: '⚠️ Laktoz/Süt', type: 'danger' })
      } else if (allergenLower.includes('ceviz') || allergenLower.includes('fındık') || allergenLower.includes('badem')) {
        tags.push({ label: '⚠️ Kuruyemiş', type: 'danger' })
      } else if (allergenLower.includes('deniz') || allergenLower.includes('balık') || allergenLower.includes('karides') || allergenLower.includes('kalamar')) {
        tags.push({ label: '⚠️ Deniz Ürünü', type: 'danger' })
      } else if (allergenLower.includes('gluten')) {
        // Gluten bilgi amaçlı
        if (allergenLower.includes('içermez') || allergenLower.includes('içermez')) {
          tags.push({ label: '✓ Glutensiz', type: 'info' })
        } else {
          tags.push({ label: '⚠️ Gluten', type: 'danger' })
        }
      } else if (allergenLower && allergenLower.trim() !== '') {
        // Diğer alerjenler
        tags.push({ label: `⚠️ ${allergen}`, type: 'warning' })
      }
    })

    // Tekrar eden badge'leri kaldır
    const uniqueTags = tags.filter((tag, index, self) =>
      index === self.findIndex(t => t.label === tag.label)
    )

    return uniqueTags
  }

  const dietBadge = (product) => {
    // Backend'den gelen vegan/vejetaryen bilgilerini kullan
    if (product.isVegan === true) {
      return { label: '🌱 Vegan', type: 'success' }
    } else if (product.isVegetarian === true) {
      return { label: '🥗 Vejetaryen', type: 'success' }
    }
    return null
  }

  useEffect(() => {
    if (!tableId) {
      toast.error('Masa bilgisi bulunamadı')
      navigate('/')
      return
    }

    loadData()
    loadTable()
  }, [tableId])

  const loadTable = async () => {
    try {
      // Önce ID olarak dene
      const tableIdNum = parseInt(tableId)
      if (!isNaN(tableIdNum)) {
        try {
          const response = await tableAPI.getById(tableIdNum)
          setTable(response.data)
          return
        } catch (idError) {
          // ID ile bulunamazsa tableNumber olarak dene
        }
      }
      
      // tableNumber olarak dene
      const response = await tableAPI.getByNumber(tableId)
      setTable(response.data)
    } catch (error) {
      console.error('Masa yükleme hatası:', error)
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const [categoriesRes, productsRes] = await Promise.all([
        categoryAPI.getAll(),
        productAPI.getAll()
      ])
      
      console.log('Categories Response:', categoriesRes)
      console.log('Products Response:', productsRes)
      
      // Backend'den gelen verileri düzelt
      const categoriesData = categoriesRes.data || []
      const productsData = productsRes.data || []
      
      const categories = categoriesData
        .filter(c => c && (c.isActive !== false && c.active !== false))
        .map(c => ({
          id: c.id,
          name: c.name || 'Kategori',
          description: c.description || '',
          displayOrder: c.displayOrder || 0,
          isActive: c.isActive !== false
        }))
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      
      const products = productsData
        .filter(p => {
          if (!p) return false
          // isAvailable veya available kontrolü
          const available = p.isAvailable !== false && p.available !== false
          return available
        })
        .map(p => {
          // Price'ı düzelt - BigDecimal farklı formatlarda gelebilir
          let price = 0
          if (p.price !== null && p.price !== undefined) {
            if (typeof p.price === 'string') {
              price = parseFloat(p.price) || 0
            } else if (typeof p.price === 'number') {
              price = p.price
            } else if (typeof p.price === 'object') {
              // BigDecimal object olabilir
              price = parseFloat(p.price.toString()) || 0
            }
          }
          
          // Category bilgisini düzelt
          let category = null
          if (p.category) {
            category = {
              id: p.category.id || null,
              name: p.category.name || 'Kategori'
            }
          }
          
          return {
            id: p.id,
            name: p.name || 'İsimsiz Ürün',
            description: p.description || '',
            price: price,
            imageUrl: p.imageUrl || null,
            category: category,
            isAvailable: p.isAvailable !== false,
            available: p.isAvailable !== false,
            preparationTime: p.preparationTime || null,
            allergens: p.allergens || [],
            isVegan: p.isVegan === true,
            isVegetarian: p.isVegetarian === true
          }
        })
      
      console.log('Processed Categories:', categories)
      console.log('Processed Products:', products)
      
      setCategories(categories)
      setProducts(products)
      
      if (categories.length > 0) {
        setSelectedCategory(categories[0].id)
      }
    } catch (error) {
      toast.error('Menü yüklenirken hata oluştu: ' + (error.message || 'Bilinmeyen hata'))
      console.error('Hata detayı:', error)
      console.error('Response:', error.response?.data)
    } finally {
      setLoading(false)
    }
  }

  // --- Yardımcılar ---
  const normalizeText = (product) => {
    const parts = [
      product.name || '',
      product.description || '',
      ...(product.allergens || [])
    ]
    return parts.join(' ').toLowerCase()
  }

  const getAllergenBadges = (product) => {
    const badges = []
    const allergens = product.allergens || []

    // Backend'den gelen alerjen bilgilerini kullan
    allergens.forEach(allergen => {
      const allergenLower = allergen.toLowerCase()
      
      // Yüksek riskli alerjenler
      if (allergenLower.includes('fıstık') || allergenLower.includes('yer fıstığı') || allergenLower.includes('peanut')) {
        badges.push({ label: '⚠️ Fıstık', type: 'danger' })
      } else if (allergenLower.includes('susam') || allergenLower.includes('tahin')) {
        badges.push({ label: '⚠️ Susam', type: 'danger' })
      } else if (allergenLower.includes('mantar')) {
        badges.push({ label: '⚠️ Mantar', type: 'danger' })
      } else if (allergenLower.includes('yumurta') || allergenLower.includes('egg')) {
        badges.push({ label: '⚠️ Yumurta', type: 'danger' })
      } else if (allergenLower.includes('laktoz') || allergenLower.includes('süt') || allergenLower.includes('dairy')) {
        badges.push({ label: '⚠️ Laktoz/Süt', type: 'danger' })
      } else if (allergenLower.includes('ceviz') || allergenLower.includes('fındık') || allergenLower.includes('badem')) {
        badges.push({ label: '⚠️ Kuruyemiş', type: 'danger' })
      } else if (allergenLower.includes('gluten')) {
        // Gluten bilgi amaçlı
        if (allergenLower.includes('içermez') || allergenLower.includes('içermez')) {
          badges.push({ label: '✓ Glutensiz', type: 'info' })
        } else {
          badges.push({ label: '⚠️ Gluten', type: 'danger' })
        }
      } else {
        // Diğer alerjenler
        badges.push({ label: `⚠️ ${allergen}`, type: 'warning' })
      }
    })

    // Tekrar eden badge'leri kaldır
    const uniqueBadges = badges.filter((badge, index, self) =>
      index === self.findIndex(b => b.label === badge.label)
    )

    return uniqueBadges
  }

  const getDietaryBadges = (product) => {
    const badges = []
    
    // Backend'den gelen vegan/vejetaryen bilgilerini kullan
    if (product.isVegan === true) {
      badges.push({ label: '🌱 Vegan', type: 'success' })
    } else if (product.isVegetarian === true) {
      badges.push({ label: '🥗 Vejetaryen', type: 'success' })
    }

    return badges
  }

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product.id === product.id)
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { product, quantity: 1, notes: '' }])
    }
    
    toast.success(`${product.name} sepete eklendi`)
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product.id !== productId))
    toast.info('Ürün sepetten çıkarıldı')
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    
    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, quantity }
        : item
    ))
  }

  const updateNotes = (productId, notes) => {
    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, notes }
        : item
    ))
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      return total + (parseFloat(item.product.price) * item.quantity)
    }, 0)
  }

  const handleRequestGarson = async () => {
    if (!table || !table.id) {
      toast.error('Masa bilgisi bulunamadı')
      return
    }

    try {
      const request = {
        restaurantTable: { id: table.id },
        requestType: 'GARSON_CAĞIR',
        message: 'Garson çağırıldı'
      }
      await tableRequestAPI.create(request)
      toast.success('Garson çağrıldı! En kısa sürede yanınızda olacak.')
    } catch (error) {
      console.error('Garson çağırma hatası:', error)
      toast.error('Garson çağrılırken hata oluştu')
    }
  }

  const handleOpenRequestModal = (type) => {
    setRequestType(type)
    setRequestMessage('')
    setShowRequestModal(true)
  }

  const handleSubmitRequest = async () => {
    if (!table || !table.id) {
      toast.error('Masa bilgisi bulunamadı')
      return
    }

    if (requestMessage.trim() === '' && requestType !== 'GARSON_CAĞIR') {
      toast.error('Lütfen mesajınızı yazın')
      return
    }

    try {
      const request = {
        restaurantTable: { id: table.id },
        requestType: requestType,
        message: requestMessage.trim() || (requestType === 'GARSON_CAĞIR' ? 'Garson çağırıldı' : '')
      }
      await tableRequestAPI.create(request)
      
      const typeLabels = {
        'GARSON_CAĞIR': 'Garson çağrıldı',
        'İSTEK': 'İsteğiniz alındı',
        'ŞİKAYET': 'Şikayetiniz alındı',
        'YARDIM': 'Yardım talebiniz alındı'
      }
      
      toast.success(typeLabels[requestType] + '! En kısa sürede yanınızda olacak.')
      setShowRequestModal(false)
      setRequestMessage('')
    } catch (error) {
      console.error('İstek gönderme hatası:', error)
      toast.error('İstek gönderilirken hata oluştu')
    }
  }

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category?.id === selectedCategory)
    : products

  if (loading) {
    return <div className="loading">Yükleniyor...</div>
  }

  return (
    <div className="menu-page">
      <header className="menu-header">
        <div className="header-content">
          <div>
            <h1>Menü</h1>
            <p className="table-info">Masa: {table?.tableNumber || tableId}</p>
          </div>
          <div className="header-actions">
            <button 
              className="request-btn garson-btn"
              onClick={handleRequestGarson}
              title="Garson Çağır"
            >
              🛎️ Garson Çağır
            </button>
            <button 
              className="request-btn help-btn"
              onClick={() => handleOpenRequestModal('İSTEK')}
              title="Dilek/Şikayet"
            >
              💬 Dilek/Şikayet
            </button>
          </div>
        </div>
      </header>

      <div className="menu-content">
        <div className="menu-main">
          <div className="categories">
            <button
              className={`category-btn ${!selectedCategory ? 'active' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              Tümü
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="products-grid">
            {filteredProducts.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#666' }}>
                <p>Bu kategoride ürün bulunamadı.</p>
              </div>
            ) : (
              filteredProducts.map(product => (
                <div key={product.id} className="product-card">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="product-image" />
                  ) : (
                    <div className="product-image" style={{ 
                      background: 'linear-gradient(135deg, #c41e3a 0%, #8b0000 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '24px'
                    }}>
                      🍽️
                    </div>
                  )}
                  <div className="product-info">
                    <h3>{product.name || 'İsimsiz Ürün'}</h3>
                    <p className="product-description">{product.description || 'Lezzetli bir seçim'}</p>
                    {product.preparationTime && (
                      <p style={{ fontSize: '12px', color: '#999', margin: '5px 0' }}>
                        ⏱️ {product.preparationTime} dakika
                      </p>
                    )}
                    <div className="badges">
                      {dietBadge(product) && (
                        <span className={`badge ${dietBadge(product).type}`}>{dietBadge(product).label}</span>
                      )}
                      {allergenBadges(product).map((badge, idx) => (
                        <span key={idx} className={`badge ${badge.type}`}>{badge.label}</span>
                      ))}
                    </div>
                    <div className="product-footer">
                      <span className="product-price">
                        {typeof product.price === 'number' 
                          ? product.price.toFixed(2) 
                          : (parseFloat(product.price) || 0).toFixed(2)} ₺
                      </span>
                      <button
                        className="add-to-cart-btn"
                        onClick={() => addToCart(product)}
                      >
                        Sepete Ekle
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="cart-sidebar">
          <h2>Sepet ({cart.length})</h2>
          
          {cart.length === 0 ? (
            <p className="empty-cart">Sepetiniz boş</p>
          ) : (
            <>
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.product.id} className="cart-item">
                    <div className="cart-item-header">
                      <h4>{item.product.name}</h4>
                      <button
                        className="remove-btn"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        ×
                      </button>
                    </div>
                    <div className="cart-item-controls">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>+</button>
                    </div>
                    <input
                      type="text"
                      placeholder="Not ekle (örn: acılı, soğansız)"
                      value={item.notes}
                      onChange={(e) => updateNotes(item.product.id, e.target.value)}
                      className="notes-input"
                    />
                    <div className="cart-item-price">
                      {(parseFloat(item.product.price) * item.quantity).toFixed(2)} ₺
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="cart-footer">
                <div className="cart-total">
                  <strong>Toplam: {getTotalPrice().toFixed(2)} ₺</strong>
                </div>
                <button
                  className="checkout-btn"
                  onClick={() => navigate(`/order?tableId=${tableId}`, { state: { cart, tableId } })}
                >
                  Sipariş Ver
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* İstek/Şikayet Modal */}
      {showRequestModal && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {requestType === 'İSTEK' && '📋 Dilek/İstek Gönder'}
                {requestType === 'ŞİKAYET' && '⚠️ Şikayet Bildir'}
                {requestType === 'YARDIM' && '🆘 Yardım İste'}
              </h2>
              <button className="modal-close" onClick={() => setShowRequestModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="request-type-selector">
                <button
                  className={`type-btn ${requestType === 'İSTEK' ? 'active' : ''}`}
                  onClick={() => setRequestType('İSTEK')}
                >
                  📋 İstek
                </button>
                <button
                  className={`type-btn ${requestType === 'ŞİKAYET' ? 'active' : ''}`}
                  onClick={() => setRequestType('ŞİKAYET')}
                >
                  ⚠️ Şikayet
                </button>
                <button
                  className={`type-btn ${requestType === 'YARDIM' ? 'active' : ''}`}
                  onClick={() => setRequestType('YARDIM')}
                >
                  🆘 Yardım
                </button>
                <button
                  className={`type-btn ${requestType === 'DİLEK' ? 'active' : ''}`}
                  onClick={() => setRequestType('İSTEK')}
                  style={{ display: 'none' }}
                >
                  📋 Dilek
                </button>
              </div>
              <textarea
                className="request-textarea"
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder={
                  requestType === 'İSTEK' ? 'Dilek veya isteğinizi yazın...' :
                  requestType === 'ŞİKAYET' ? 'Şikayetinizi yazın...' :
                  'Yardım talebinizi yazın...'
                }
                rows="5"
              />
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowRequestModal(false)}>
                İptal
              </button>
              <button className="submit-btn" onClick={handleSubmitRequest}>
                Gönder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MenuPage

