package com.restaurant.restaurantbackend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OrderNotificationDTO {
    private Long orderId;
    private String orderNumber;
    private String status;
    private BigDecimal totalAmount;
    private Long tableId;
    private String tableNumber;
    private LocalDateTime createdAt;
    private String message;

    // Constructor'lar
    public OrderNotificationDTO() {
    }

    public OrderNotificationDTO(Long orderId, String orderNumber, String status, 
                                BigDecimal totalAmount, Long tableId, String tableNumber, 
                                LocalDateTime createdAt, String message) {
        this.orderId = orderId;
        this.orderNumber = orderNumber;
        this.status = status;
        this.totalAmount = totalAmount;
        this.tableId = tableId;
        this.tableNumber = tableNumber;
        this.createdAt = createdAt;
        this.message = message;
    }

    // Getter ve Setter'lar
    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Long getTableId() {
        return tableId;
    }

    public void setTableId(Long tableId) {
        this.tableId = tableId;
    }

    public String getTableNumber() {
        return tableNumber;
    }

    public void setTableNumber(String tableNumber) {
        this.tableNumber = tableNumber;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}

