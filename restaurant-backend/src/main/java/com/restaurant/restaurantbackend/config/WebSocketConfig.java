package com.restaurant.restaurantbackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry config) {
        // "/topic" prefix'i ile başlayan mesajlar tüm abonelere broadcast edilir
        config.enableSimpleBroker("/topic");
        
        // "/app" prefix'i ile başlayan mesajlar @MessageMapping ile işlenir
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
   public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
    registry.addEndpoint("/ws")
            .setAllowedOrigins("http://localhost:3000") // patterns yerine bunu deneyelim
            .setAllowedOriginPatterns("http://localhost:3000") 
            .withSockJS();
    }
}