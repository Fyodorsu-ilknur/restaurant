package com.restaurant.restaurantbackend.service;

import com.restaurant.restaurantbackend.dto.RequestNotificationDTO;
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
        
        RequestNotificationDTO notification = new RequestNotificationDTO(
                request.getId(),
                request.getRestaurantTable().getId(),
                request.getRestaurantTable().getTableNumber(),
                request.getRequestType(),
                request.getMessage(),
                message,
                request.getCreatedAt()
        );
        
        // Mutfak ekranına bildirim gönder
        messagingTemplate.convertAndSend("/topic/kitchen", notification);
        
        // Debug: Bildirimin gönderildiğini logla
        System.out.println("🔔 Mutfak ekranına bildirim gönderildi: " + notification.getRequestType() + " - " + notification.getNotificationMessage());
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

}

