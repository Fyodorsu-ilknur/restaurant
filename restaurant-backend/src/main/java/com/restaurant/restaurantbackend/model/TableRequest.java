package com.restaurant.restaurantbackend.model;

import java.time.LocalDateTime;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "table_requests")
public class TableRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "table_id")
    private RestaurantTable restaurantTable;

    private String requestType; // "GARSON_CAĞIR", "İSTEK", "ŞİKAYET", "YARDIM"
    
    private String message;
    
    private String status = "PENDING"; // "PENDING", "IN_PROGRESS", "RESOLVED"
    
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime resolvedAt;
}

