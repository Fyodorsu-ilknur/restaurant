import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { categoryAPI, productAPI } from '../../services/api'
import { toast } from 'react-toastify'
import './MenuManagement.css'

function MenuManagement() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    preparationTime: '',
    available: true,
    allergens: [],
    isVegan: false,
    isVegetarian: false
  })

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    displayOrder: '',
    active: true
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [categoriesRes, productsRes] = await Promise.all([
        categoryAPI.getAll(),
        productAPI.getAll()
      ])
      setCategories(categoriesRes.data || [])
      setProducts(productsRes.data || [])
    } catch (error) {
      console.error('Veri yükleme hatası:', error)
      toast.error('Veriler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = () => {
    setEditingProduct(null)
    setProductForm({
      name: '',
      description: '',
      price: '',
      categoryId: '',
      preparationTime: '',
      available: true,
      allergens: [],
      isVegan: false,
      isVegetarian: false
    })
    setShowProductModal(true)
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      categoryId: product.category?.id || '',
      preparationTime: product.preparationTime || '',
      available: product.available !== false,
      allergens: product.allergens || [],
      isVegan: product.isVegan || false,
      isVegetarian: product.isVegetarian || false
    })
    setShowProductModal(true)
  }

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price || !productForm.categoryId) {
      toast.error('Lütfen zorunlu alanları doldurun')
      return
    }

    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        preparationTime: productForm.preparationTime ? parseInt(productForm.preparationTime) : null,
        category: { id: parseInt(productForm.categoryId) }
      }

      if (editingProduct) {
        await productAPI.update(editingProduct.id, productData)
        toast.success('Ürün güncellendi')
      } else {
        await productAPI.create(productData)
        toast.success('Ürün eklendi')
      }

      setShowProductModal(false)
      loadData()
    } catch (error) {
      console.error('Ürün kaydetme hatası:', error)
      toast.error('Ürün kaydedilemedi')
    }
  }

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      return
    }

    try {
      await productAPI.delete(id)
      toast.success('Ürün silindi')
      loadData()
    } catch (error) {
      console.error('Ürün silme hatası:', error)
      toast.error('Ürün silinemedi')
    }
  }

  const handleAddCategory = () => {
    setEditingCategory(null)
    setCategoryForm({
      name: '',
      description: '',
      displayOrder: '',
      active: true
    })
    setShowCategoryModal(true)
  }

  const handleEditCategory = (category) => {
    setEditingCategory(category)
    setCategoryForm({
      name: category.name || '',
      description: category.description || '',
      displayOrder: category.displayOrder || '',
      active: category.active !== false
    })
    setShowCategoryModal(true)
  }

  const handleSaveCategory = async () => {
    if (!categoryForm.name) {
      toast.error('Lütfen kategori adını girin')
      return
    }

    try {
      const categoryData = {
        ...categoryForm,
        displayOrder: categoryForm.displayOrder ? parseInt(categoryForm.displayOrder) : 0
      }

      if (editingCategory) {
        await categoryAPI.update(editingCategory.id, categoryData)
        toast.success('Kategori güncellendi')
      } else {
        await categoryAPI.create(categoryData)
        toast.success('Kategori eklendi')
      }

      setShowCategoryModal(false)
      loadData()
    } catch (error) {
      console.error('Kategori kaydetme hatası:', error)
      toast.error('Kategori kaydedilemedi')
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Bu kategoriyi silmek istediğinize emin misiniz? Kategoriye ait ürünler de silinebilir.')) {
      return
    }

    try {
      await categoryAPI.delete(id)
      toast.success('Kategori silindi')
      loadData()
    } catch (error) {
      console.error('Kategori silme hatası:', error)
      toast.error('Kategori silinemedi')
    }
  }

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category?.id === selectedCategory)
    : products

  if (loading) {
    return <div className="admin-loading">Yükleniyor...</div>
  }

  return (
    <div className="menu-management">
      <div className="management-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/admin')}>
            ← Geri
          </button>
          <h1>📋 Menü Yönetimi</h1>
        </div>
        <div className="header-actions">
          <button className="add-btn" onClick={handleAddCategory}>
            + Kategori Ekle
          </button>
          <button className="add-btn primary" onClick={handleAddProduct}>
            + Ürün Ekle
          </button>
        </div>
      </div>

      <div className="management-content">
        <div className="categories-section">
          <h2>Kategoriler</h2>
          <div className="categories-list">
            <button
              className={`category-item ${!selectedCategory ? 'active' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              Tümü ({products.length})
            </button>
            {categories.map(category => (
              <div key={category.id} className="category-item-wrapper">
                <button
                  className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name} ({products.filter(p => p.category?.id === category.id).length})
                </button>
                <div className="category-actions">
                  <button
                    className="edit-btn"
                    onClick={() => handleEditCategory(category)}
                    title="Düzenle"
                  >
                    ✏️
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteCategory(category.id)}
                    title="Sil"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="products-section">
          <h2>Ürünler ({filteredProducts.length})</h2>
          <div className="products-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-header">
                  <h3>{product.name}</h3>
                  <div className="product-badges">
                    {product.isVegan && <span className="badge vegan">🌱 Vegan</span>}
                    {product.isVegetarian && !product.isVegan && <span className="badge vegetarian">🥗 Vejetaryen</span>}
                    {!product.available && <span className="badge unavailable">❌ Mevcut Değil</span>}
                  </div>
                </div>
                <p className="product-description">{product.description}</p>
                <div className="product-details">
                  <p><strong>Fiyat:</strong> {parseFloat(product.price || 0).toFixed(2)} ₺</p>
                  {product.preparationTime && (
                    <p><strong>Hazırlanma Süresi:</strong> {product.preparationTime} dk</p>
                  )}
                  <p><strong>Kategori:</strong> {product.category?.name || 'Kategori yok'}</p>
                </div>
                <div className="product-actions">
                  <button
                    className="edit-btn"
                    onClick={() => handleEditProduct(product)}
                  >
                    ✏️ Düzenle
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    🗑️ Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ürün Modal */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}</h2>
              <button className="modal-close" onClick={() => setShowProductModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Ürün Adı *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Ürün adı"
                />
              </div>
              <div className="form-group">
                <label>Açıklama</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Ürün açıklaması"
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Fiyat (₺) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label>Hazırlanma Süresi (dk)</label>
                  <input
                    type="number"
                    value={productForm.preparationTime}
                    onChange={(e) => setProductForm({ ...productForm, preparationTime: e.target.value })}
                    placeholder="15"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Kategori *</label>
                <select
                  value={productForm.categoryId}
                  onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                >
                  <option value="">Kategori Seçin</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={productForm.available}
                    onChange={(e) => setProductForm({ ...productForm, available: e.target.checked })}
                  />
                  Mevcut
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={productForm.isVegan}
                    onChange={(e) => setProductForm({ ...productForm, isVegan: e.target.checked, isVegetarian: e.target.checked ? true : productForm.isVegetarian })}
                  />
                  🌱 Vegan
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={productForm.isVegetarian}
                    onChange={(e) => setProductForm({ ...productForm, isVegetarian: e.target.checked })}
                    disabled={productForm.isVegan}
                  />
                  🥗 Vejetaryen
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowProductModal(false)}>İptal</button>
              <button className="submit-btn" onClick={handleSaveProduct}>Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* Kategori Modal */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}</h2>
              <button className="modal-close" onClick={() => setShowCategoryModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Kategori Adı *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="Kategori adı"
                />
              </div>
              <div className="form-group">
                <label>Açıklama</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Kategori açıklaması"
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Sıralama</label>
                  <input
                    type="number"
                    value={categoryForm.displayOrder}
                    onChange={(e) => setCategoryForm({ ...categoryForm, displayOrder: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={categoryForm.active}
                    onChange={(e) => setCategoryForm({ ...categoryForm, active: e.target.checked })}
                  />
                  Aktif
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowCategoryModal(false)}>İptal</button>
              <button className="submit-btn" onClick={handleSaveCategory}>Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MenuManagement

