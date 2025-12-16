import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { categoryAPI, productAPI } from '../services/api'
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

  useEffect(() => {
    if (!tableId) {
      toast.error('Masa bilgisi bulunamadı')
      navigate('/')
      return
    }

    loadData()
  }, [tableId])

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
            allergens: p.allergens || []
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

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category?.id === selectedCategory)
    : products

  if (loading) {
    return <div className="loading">Yükleniyor...</div>
  }

  return (
    <div className="menu-page">
      <header className="menu-header">
        <h1>Menü</h1>
        <p className="table-info">Masa: {tableId}</p>
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
    </div>
  )
}

export default MenuPage

