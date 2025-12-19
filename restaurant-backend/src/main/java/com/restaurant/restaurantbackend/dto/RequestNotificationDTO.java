package com.restaurant.restaurantbackend.dto;

import java.time.LocalDateTime;

public class RequestNotificationDTO {
    private Long requestId;
    private Long tableId;
    private String tableNumber;
    private String requestType;
    private String message;
    private String notificationMessage;
    private LocalDateTime createdAt;

    public RequestNotificationDTO() {
    }

    public RequestNotificationDTO(Long requestId, Long tableId, String tableNumber, 
                                 String requestType, String message, String notificationMessage,
                                 LocalDateTime createdAt) {
        this.requestId = requestId;
        this.tableId = tableId;
        this.tableNumber = tableNumber;
        this.requestType = requestType;
        this.message = message;
        this.notificationMessage = notificationMessage;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
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

    public String getRequestType() {
        return requestType;
    }

    public void setRequestType(String requestType) {
        this.requestType = requestType;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getNotificationMessage() {
        return notificationMessage;
    }

    public void setNotificationMessage(String notificationMessage) {
        this.notificationMessage = notificationMessage;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

