import SockJS from 'sockjs-client'
import { Client } from 'stompjs'

class WebSocketService {
  constructor() {
    this.stompClient = null
    this.connected = false
  }

  connect() {
    return new Promise((resolve, reject) => {
      const socket = new SockJS('http://localhost:8080/ws')
      this.stompClient = Client.over(socket)

      this.stompClient.connect(
        {},
        () => {
          this.connected = true
          console.log('WebSocket bağlantısı kuruldu')
          resolve()
        },
        (error) => {
          console.error('WebSocket bağlantı hatası:', error)
          this.connected = false
          reject(error)
        }
      )
    })
  }

  disconnect() {
    if (this.stompClient && this.connected) {
      this.stompClient.disconnect()
      this.connected = false
      console.log('WebSocket bağlantısı kapatıldı')
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

