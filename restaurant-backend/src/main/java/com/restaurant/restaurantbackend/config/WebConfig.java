package com.restaurant.restaurantbackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")  // Tüm endpointlere (api/products, api/tables vs.) izin ver
                .allowedOrigins("http://localhost:3000") // Sadece senin React projenden gelen isteklere kapıyı aç
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // İzin verilen işlemler
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}