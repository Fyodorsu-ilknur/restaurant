import SockJS from 'sockjs-client'
import { Client } from 'stompjs'

class WebSocketService {
  constructor() {
    this.stompClient = null
    this.connected = false
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        const socket = new SockJS('http://localhost:8080/ws')
        this.stompClient = Client.over(socket)

        this.stompClient.connect(
          {},
          () => {
            this.connected = true
            // WebSocket bağlantısı kuruldu
            resolve()
          },
          (error) => {
            // WebSocket bağlantı hatası - sessizce devam et
            this.connected = false
            // CORS hatası gibi durumlarda sessizce devam et
            resolve() // Hata olsa bile resolve et, uygulama çalışmaya devam etsin
          }
        )
      } catch (error) {
        // SockJS oluşturma hatası - sessizce devam et
        this.connected = false
        resolve() // Hata olsa bile resolve et
      }
    })
  }

  disconnect() {
    if (this.stompClient && this.connected) {
      this.stompClient.disconnect()
      this.connected = false
      // WebSocket bağlantısı kapatıldı
    }
  }

  subscribeToKitchen(callback) {
    if (this.stompClient && this.connected) {
      return this.stompClient.subscribe('/topic/kitchen', (message) => {
        const notification = JSON.parse(message.body)
        callback(notification)
      })
    }
    return null
  }

  subscribeToTable(tableId, callback) {
    if (this.stompClient && this.connected) {
      return this.stompClient.subscribe(`/topic/table/${tableId}`, (message) => {
        const notification = JSON.parse(message.body)
        callback(notification)
      })
    }
    return null
  }

  unsubscribe(subscription) {
    if (subscription) {
      subscription.unsubscribe()
    }
  }
}

export default new WebSocketService()

