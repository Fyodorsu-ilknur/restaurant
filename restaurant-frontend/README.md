# Restoran Sipariş Sistemi - Frontend

QR Kod Tabanlı Akıllı Sipariş ve Ödeme Yönetim Sistemi - Müşteri Arayüzü

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Backend'in çalıştığından emin olun (http://localhost:8080)

3. Frontend'i başlatın:
```bash
npm run dev
```

4. Tarayıcıda açın: http://localhost:3000

## Özellikler

- ✅ QR Kod Okutma
- ✅ Dijital Menü (Kategoriler, Ürünler)
- ✅ Sepet Yönetimi
- ✅ Sipariş Verme
- ✅ Canlı Sipariş Takibi (WebSocket)
- ✅ Ödeme Seçenekleri (Online/Kasada)

## Teknolojiler

- React 18
- React Router DOM
- Axios (API istekleri)
- SockJS + STOMP (WebSocket)
- React QR Reader
- React Toastify
- Vite (Build tool)

## API Endpoint'leri

Backend API'leri `src/services/api.js` dosyasında tanımlıdır.

## WebSocket

WebSocket bağlantısı `src/services/websocket.js` dosyasında yönetilir.

