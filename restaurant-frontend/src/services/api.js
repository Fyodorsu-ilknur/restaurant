import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Kategori API'leri
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (category) => api.post('/categories', category),
  update: (id, category) => api.put(`/categories/${id}`, category),
  delete: (id) => api.delete(`/categories/${id}`),
}

// Ürün API'leri
export const productAPI = {
  getAll: (categoryId) => {
    const url = categoryId ? `/products?categoryId=${categoryId}` : '/products'
    return api.get(url)
  },
  getById: (id) => api.get(`/products/${id}`),
  create: (product) => api.post('/products', product),
  update: (id, product) => api.put(`/products/${id}`, product),
  delete: (id) => api.delete(`/products/${id}`),
}

// Masa API'leri
export const tableAPI = {
  getAll: () => api.get('/tables'),
  getById: (id) => api.get(`/tables/${id}`),
  getByNumber: (tableNumber) => api.get(`/tables/by-number/${encodeURIComponent(tableNumber)}`),
  getQRCode: (id) => api.get(`/tables/${id}/qr-code`, { responseType: 'blob' }),
  getQRCodeContent: (id) => api.get(`/tables/${id}/qr-code-content`),
  create: (table) => api.post('/tables', table),
  update: (id, table) => api.put(`/tables/${id}`, table),
  delete: (id) => api.delete(`/tables/${id}`),
  regenerateQR: (id) => api.post(`/tables/${id}/regenerate-qr`),
}

// Sipariş API'leri
export const orderAPI = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (order) => api.post('/orders', order),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
}

// Masa İsteği/Şikayet API'leri
export const tableRequestAPI = {
  getAll: () => api.get('/table-requests'),
  getPending: () => api.get('/table-requests/pending'),
  getByTable: (tableId) => api.get(`/table-requests/table/${tableId}`),
  getById: (id) => api.get(`/table-requests/${id}`),
  create: (request) => api.post('/table-requests', request),
  updateStatus: (id, status) => api.put(`/table-requests/${id}/status`, { status }),
}

export default api

