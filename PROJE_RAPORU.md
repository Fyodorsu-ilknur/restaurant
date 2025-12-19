# QR Kod Tabanlı Akıllı Sipariş ve Ödeme Yönetim Sistemi

---

## 📋 Proje Özeti

Bu proje, restoran ve kafeler için modern bir dijital sipariş ve ödeme yönetim sistemidir. Müşteriler QR kod okutarak menüye erişebilir, sipariş verebilir ve siparişlerini canlı olarak takip edebilir. Restoran yönetimi ise kapsamlı bir admin paneli ile tüm işlemleri yönetebilir.

---

## 🎯 Proje Hedefleri

1. **Operasyonel Verimlilik**: Dijital sipariş sistemi ile sipariş süreçlerini hızlandırma
2. **Müşteri Deneyimi**: Modern ve kullanıcı dostu arayüz ile müşteri memnuniyetini artırma
3. **Canlı Takip**: WebSocket teknolojisi ile gerçek zamanlı sipariş takibi
4. **Akıllı Asistan**: Google Gemini AI entegrasyonu ile müşterilere menü önerileri sunma
5. **Yönetim Paneli**: Kapsamlı admin paneli ile restoran yönetimi

---

## 🛠️ Kullanılan Teknolojiler

### Backend
- **Framework**: Spring Boot 3.1.5
- **Programlama Dili**: Java 17
- **Veritabanı**: PostgreSQL (Docker)
- **ORM**: Spring Data JPA / Hibernate
- **Güvenlik**: Spring Security
- **WebSocket**: Spring WebSocket (STOMP Protocol)
- **QR Kod**: ZXing Library
- **AI Entegrasyonu**: Google Gemini API
- **Build Tool**: Maven

### Frontend
- **Framework**: React 18.3.1
- **Build Tool**: Vite 5.0.8
- **Routing**: React Router DOM 6.20.0
- **HTTP Client**: Axios 1.6.2
- **WebSocket**: SockJS + STOMP.js
- **QR Kod Okuma**: html5-qrcode 2.3.8
- **Bildirimler**: React Toastify 9.1.3

---

## 📦 Proje Yapısı

### Backend Yapısı
```
restaurant-backend/
├── src/main/java/com/restaurant/restaurantbackend/
│   ├── config/          # Konfigürasyon sınıfları
│   │   ├── CorsConfig.java
│   │   ├── DataInitializer.java
│   │   ├── JacksonConfig.java
│   │   ├── RestTemplateConfig.java
│   │   ├── SecurityConfig.java
│   │   └── WebSocketConfig.java
│   ├── controller/      # REST API Controller'ları
│   │   ├── CategoryController.java
│   │   ├── ChatbotController.java
│   │   ├── OrderController.java
│   │   ├── ProductController.java
│   │   ├── RestaurantTableController.java
│   │   ├── TableRequestController.java
│   │   └── WebSocketController.java
│   ├── dto/             # Data Transfer Objects
│   │   ├── OrderNotificationDTO.java
│   │   └── StatusUpdateDTO.java
│   ├── model/           # JPA Entity'ler
│   │   ├── Category.java
│   │   ├── Order.java
│   │   ├── OrderItem.java
│   │   ├── Product.java
│   │   ├── RestaurantTable.java
│   │   └── TableRequest.java
│   ├── repository/      # Spring Data JPA Repository'ler
│   │   ├── CategoryRepository.java
│   │   ├── OrderItemRepository.java
│   │   ├── OrderRepository.java
│   │   ├── ProductRepository.java
│   │   ├── RestaurantTableRepository.java
│   │   └── TableRequestRepository.java
│   └── service/          # Business Logic
│       ├── CategoryService.java
│       ├── ChatbotService.java
│       ├── OrderService.java
│       ├── ProductService.java
│       ├── QRCodeService.java
│       ├── RestaurantTableService.java
│       └── TableRequestService.java
└── src/main/resources/
    └── application.properties
```

### Frontend Yapısı
```
restaurant-frontend/
├── src/
│   ├── pages/
│   │   ├── admin/       # Admin Panel Sayfaları
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── MenuManagement.jsx
│   │   │   ├── OrderManagement.jsx
│   │   │   ├── RequestManagement.jsx
│   │   │   └── TableManagement.jsx
│   │   ├── KitchenPage.jsx
│   │   ├── MenuPage.jsx
│   │   ├── OrderPage.jsx
│   │   ├── OrderTrackingPage.jsx
│   │   └── QRScannerPage.jsx
│   ├── services/
│   │   ├── api.js       # API çağrıları
│   │   └── websocket.js # WebSocket bağlantısı
│   ├── App.jsx
│   └── main.jsx
└── package.json
```

---

## ✨ Özellikler

### 1. Müşteri Arayüzü

#### QR Kod Okutma
- ✅ HTML5 QR Kod okuyucu entegrasyonu
- ✅ Manuel masa numarası girişi
- ✅ Masa bilgisi doğrulama

#### Dijital Menü
- ✅ Kategorilere göre ürün listeleme
- ✅ Ürün detayları (fiyat, açıklama, hazırlanma süresi)
- ✅ Alerjen uyarıları (laktoz, gluten, fıstık, vb.)
- ✅ Vegan/Vejetaryen etiketleri
- ✅ Ürün görselleri
- ✅ Sepet yönetimi (ekleme, çıkarma, miktar güncelleme)
- ✅ Sipariş notları ekleme

#### Sipariş İşlemleri
- ✅ Sepet özeti görüntüleme
- ✅ Ödeme yöntemi seçimi (Online/Kasada)
- ✅ Sipariş verme
- ✅ Sipariş numarası oluşturma

#### Canlı Sipariş Takibi
- ✅ WebSocket ile gerçek zamanlı durum güncellemeleri
- ✅ Sipariş durumları: PENDING → PREPARING → READY → DELIVERED
- ✅ Görsel durum göstergeleri

#### Müşteri İstekleri
- ✅ Garson çağırma
- ✅ Dilek/Şikayet gönderme
- ✅ Mutfak ekranına anlık bildirim

#### Akıllı Asistan (Chatbot)
- ✅ Google Gemini AI entegrasyonu
- ✅ Menü sorgulama
- ✅ Alerjen filtreleme ile ürün önerileri
- ✅ Hazırlanma sürelerini gösterme
- ✅ Vegan/Vejetaryen ürün önerileri
- ✅ Kapsamlı menü bilgisi ile akıllı yanıtlar

### 2. Mutfak Ekranı

- ✅ Canlı sipariş listesi (WebSocket)
- ✅ Sipariş detayları görüntüleme
- ✅ Sipariş durumu güncelleme
- ✅ Masa istekleri bildirimleri (Garson çağırma, Dilek/Şikayet)
- ✅ Yatay (grid) sipariş görünümü
- ✅ Durum bazlı filtreleme

### 3. Yönetim Paneli

#### Ana Dashboard
- ✅ İstatistikler (Toplam sipariş, Bekleyen sipariş, Toplam masa, Dolu masa, Bekleyen istekler)
- ✅ Modül navigasyonu

#### Menü Yönetimi
- ✅ Kategori ekleme/düzenleme/silme
- ✅ Ürün ekleme/düzenleme/silme
- ✅ Ürün özellikleri (fiyat, açıklama, görsel, hazırlanma süresi)
- ✅ Alerjen bilgileri ekleme
- ✅ Vegan/Vejetaryen işaretleme
- ✅ Kategori bazlı filtreleme

#### Masa Yönetimi
- ✅ Masa ekleme/düzenleme/silme
- ✅ Masa durumu (Dolu/Boş) yönetimi
- ✅ QR kod oluşturma ve görüntüleme
- ✅ QR kod indirme
- ✅ QR kod yeniden oluşturma
- ✅ Masa bilgileri (kapasite, konum)

#### Sipariş Yönetimi
- ✅ Tüm siparişleri listeleme
- ✅ Sipariş detayları görüntüleme
- ✅ Sipariş durumu güncelleme
- ✅ Durum bazlı filtreleme
- ✅ Sipariş arama

#### İstek/Şikayet Yönetimi
- ✅ Müşteri isteklerini listeleme
- ✅ İstek detayları görüntüleme
- ✅ İstek durumu güncelleme (PENDING → RESOLVED)
- ✅ İstek tipi filtreleme (GARSON_CAĞIR, İSTEK, ŞİKAYET)


---


## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Java 17+
- Node.js 18+
- Maven 3.8+
- PostgreSQL (Docker ile çalıştırılabilir)

### Backend Kurulumu

1. PostgreSQL'i başlat (Docker):
```bash
docker run --name my-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=restaurant_db -p 5432:5432 -d postgres
```

2. Backend'i çalıştır:
```bash
cd restaurant-backend
mvn spring-boot:run
```

Backend: http://localhost:8080

### Frontend Kurulumu

1. Bağımlılıkları yükle:
```bash
cd restaurant-frontend
npm install
```

2. Frontend'i çalıştır:
```bash
npm run dev
```

Frontend: http://localhost:3000

---

## 📊 Test Verileri

Sistem başlatıldığında otomatik olarak test verileri eklenir:

- **8 Kategori**: Çorbalar, Mezeler, Ara Sıcaklar, Ana Yemekler, Salatalar, Sıcak İçecekler, Soğuk İçecekler, Tatlılar
- **51 Ürün**: Her kategoride çeşitli ürünler
- **10 Masa**: Masa 1'den Masa 10'a kadar

---

## 🔐 Güvenlik

- Spring Security entegrasyonu
- CORS yapılandırması
- API endpoint güvenliği
- SQL injection koruması (JPA/Hibernate)

---

## 🎨 Tasarım

- **Renk Paleti**: Kırmızı-Bordo tonları
- **Responsive Design**: Mobil ve masaüstü uyumlu
- **Modern UI**: Kart tabanlı tasarım, animasyonlar
- **Kullanıcı Dostu**: Sezgisel navigasyon, açık geri bildirimler

---

## 📝 Yapılan İyileştirmeler

1. ✅ QR kod oluşturma ve okutma sistemi
2. ✅ WebSocket ile canlı bildirimler
3. ✅ Alerjen ve diyet bilgileri
4. ✅ Google Gemini AI chatbot entegrasyonu
5. ✅ Kapsamlı admin paneli
6. ✅ Müşteri istek/şikayet sistemi
7. ✅ Mutfak ekranı (canlı sipariş takibi)
8. ✅ Sipariş durumu yönetimi
9. ✅ Masa yönetimi ve QR kod yönetimi
10. ✅ Menü yönetimi (kategori ve ürün CRUD)

---

## 🔮 Gelecek Geliştirmeler

- [ ] Ödeme entegrasyonu (İyzico/PayTR/Stripe)
- [ ] Kullanıcı kimlik doğrulama (JWT)
- [ ] Çoklu dil desteği
- [ ] Raporlama ve analitik
- [ ] Mobil uygulama (React Native)
- [ ] Bildirim sistemi (Push notifications)
- [ ] Rezervasyon sistemi
- [ ] Kampanya ve indirim yönetimi

---

## 📞 İletişim ve Destek
İlknur Yüksek
ilknuriremsu@hotmail.com
+90 546 184 7145

---

## 📄 Lisans

Bu proje eğitim amaçlı geliştirilmiştir.
Bana aittir.

---


Rapor;
İlknur Yüksek
