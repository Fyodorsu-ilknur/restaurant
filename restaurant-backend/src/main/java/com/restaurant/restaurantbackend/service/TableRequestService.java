package com.restaurant.restaurantbackend.service;

import com.restaurant.restaurantbackend.model.RestaurantTable;
import com.restaurant.restaurantbackend.model.TableRequest;
import com.restaurant.restaurantbackend.repository.RestaurantTableRepository;
import com.restaurant.restaurantbackend.repository.TableRequestRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.lang.NonNull;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TableRequestService {

    private final TableRequestRepository tableRequestRepository;
    private final RestaurantTableRepository restaurantTableRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public TableRequestService(TableRequestRepository tableRequestRepository,
                              RestaurantTableRepository restaurantTableRepository,
                              SimpMessagingTemplate messagingTemplate) {
        this.tableRequestRepository = tableRequestRepository;
        this.restaurantTableRepository = restaurantTableRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public TableRequest createRequest(@NonNull TableRequest request) {
        if (request.getRestaurantTable() == null || request.getRestaurantTable().getId() == null) {
            throw new IllegalArgumentException("Table request must have a valid restaurant table");
        }
        
        if (request.getRequestType() == null || request.getRequestType().isEmpty()) {
            throw new IllegalArgumentException("Request type cannot be null or empty");
        }

        request.setCreatedAt(LocalDateTime.now());
        request.setStatus("PENDING");
        
        TableRequest savedRequest = tableRequestRepository.save(request);
        
        // WebSocket üzerinden mutfak ekranına bildirim gönder
        sendRequestNotification(savedRequest);
        
        return savedRequest;
    }

    public List<TableRequest> getAllRequests() {
        return tableRequestRepository.findAll();
    }

    public List<TableRequest> getRequestsByTableId(@NonNull Long tableId) {
        return tableRequestRepository.findByRestaurantTableId(tableId);
    }

    public List<TableRequest> getPendingRequests() {
        return tableRequestRepository.findByStatus("PENDING");
    }

    public Optional<TableRequest> getRequestById(@NonNull Long id) {
        return tableRequestRepository.findById(id);
    }

    @Transactional
    public TableRequest updateRequestStatus(@NonNull Long id, @NonNull String status) {
        TableRequest request = tableRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found with id: " + id));
        
        request.setStatus(status);
        if ("RESOLVED".equals(status)) {
            request.setResolvedAt(LocalDateTime.now());
        }
        
        return tableRequestRepository.save(request);
    }

    private void sendRequestNotification(TableRequest request) {
        String message = buildNotificationMessage(request);
        
        // Mutfak ekranına bildirim gönder
        messagingTemplate.convertAndSend("/topic/kitchen", new RequestNotificationDTO(
                request.getId(),
                request.getRestaurantTable().getId(),
                request.getRestaurantTable().getTableNumber(),
                request.getRequestType(),
                request.getMessage(),
                message,
                request.getCreatedAt()
        ));
    }

    private String buildNotificationMessage(TableRequest request) {
        String tableNumber = request.getRestaurantTable().getTableNumber();
        String requestType = request.getRequestType();
        String message = request.getMessage();
        
        switch (requestType) {
            case "GARSON_CAĞIR":
                return String.format("🔔 %s - Garson çağırıldı", tableNumber);
            case "İSTEK":
                return String.format("📋 %s - İstek: %s", tableNumber, message != null ? message : "İstek var");
            case "ŞİKAYET":
                return String.format("⚠️ %s - Şikayet: %s", tableNumber, message != null ? message : "Şikayet var");
            case "YARDIM":
                return String.format("🆘 %s - Yardım istendi: %s", tableNumber, message != null ? message : "Yardım gerekli");
            default:
                return String.format("📢 %s - %s: %s", tableNumber, requestType, message != null ? message : "");
        }
    }

    // DTO for WebSocket notifications
    public static class RequestNotificationDTO {
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
        public Long getRequestId() { return requestId; }
        public void setRequestId(Long requestId) { this.requestId = requestId; }
        public Long getTableId() { return tableId; }
        public void setTableId(Long tableId) { this.tableId = tableId; }
        public String getTableNumber() { return tableNumber; }
        public void setTableNumber(String tableNumber) { this.tableNumber = tableNumber; }
        public String getRequestType() { return requestType; }
        public void setRequestType(String requestType) { this.requestType = requestType; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getNotificationMessage() { return notificationMessage; }
        public void setNotificationMessage(String notificationMessage) { this.notificationMessage = notificationMessage; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }
}

