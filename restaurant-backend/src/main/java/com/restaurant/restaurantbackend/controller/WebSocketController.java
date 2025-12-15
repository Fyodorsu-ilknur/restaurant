package com.restaurant.restaurantbackend.controller;

import com.restaurant.restaurantbackend.dto.OrderNotificationDTO;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

/**
 * WebSocket mesajlaşma için controller
 * Frontend'den gelen mesajları işler ve yanıt gönderir
 */
@Controller
public class WebSocketController {

    /**
     * Frontend'den "/app/test" endpoint'ine mesaj geldiğinde çalışır
     * Tüm abonelere "/topic/test" topic'ine mesaj gönderir
     */
    @MessageMapping("/test")
    @SendTo("/topic/test")
    public OrderNotificationDTO testMessage(String message) {
        OrderNotificationDTO response = new OrderNotificationDTO();
        response.setMessage("Backend'den gelen test mesajı: " + message);
        response.setCreatedAt(LocalDateTime.now());
        return response;
    }
}

