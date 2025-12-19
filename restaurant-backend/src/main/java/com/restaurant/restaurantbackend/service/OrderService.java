package com.restaurant.restaurantbackend.service;

import com.restaurant.restaurantbackend.dto.OrderNotificationDTO;
import com.restaurant.restaurantbackend.model.Order;
import com.restaurant.restaurantbackend.model.RestaurantTable;
import com.restaurant.restaurantbackend.repository.OrderRepository;
import com.restaurant.restaurantbackend.repository.RestaurantTableRepository;
import org.springframework.lang.NonNull;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final RestaurantTableRepository restaurantTableRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public OrderService(OrderRepository orderRepository, 
                       RestaurantTableRepository restaurantTableRepository,
                       SimpMessagingTemplate messagingTemplate) {
        this.orderRepository = orderRepository;
        this.restaurantTableRepository = restaurantTableRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public Order createOrder(Order order) {
        try {
            // RestaurantTable kontrolü
            if (order.getRestaurantTable() == null || order.getRestaurantTable().getId() == null) {
                System.err.println("❌ Sipariş oluşturma hatası: RestaurantTable null veya ID null");
                throw new IllegalArgumentException("Order must have a valid restaurant table");
            }
            
            // Masa ID'sinin veritabanında olup olmadığını kontrol et
            Long tableId = order.getRestaurantTable().getId();
            System.out.println("🔍 Masa ID kontrol ediliyor: " + tableId);
            
            Optional<RestaurantTable> tableOptional = restaurantTableRepository.findById(tableId);
            if (tableOptional.isEmpty()) {
                System.err.println("❌ Masa bulunamadı. Masa ID: " + tableId);
                // Tüm masaları listele (debug için)
                List<RestaurantTable> allTables = restaurantTableRepository.findAll();
                System.out.println("📋 Mevcut masalar: " + allTables.stream()
                    .map(t -> "ID: " + t.getId() + ", Numara: " + t.getTableNumber())
                    .reduce((a, b) -> a + ", " + b)
                    .orElse("Hiç masa yok"));
                throw new IllegalArgumentException("Masa bulunamadı. Masa ID: " + tableId + ". Lütfen geçerli bir masa seçin.");
            }
            
            RestaurantTable table = tableOptional.get();
            System.out.println("✅ Masa bulundu: ID=" + table.getId() + ", Numara=" + table.getTableNumber());
            // Masa bilgisini order'a set et (lazy loading sorunlarını önlemek için)
            order.setRestaurantTable(table);
        } catch (IllegalArgumentException e) {
            // Zaten logladık, tekrar fırlat
            throw e;
        } catch (Exception e) {
            System.err.println("❌ Beklenmeyen hata: " + e.getClass().getName() + " - " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Sipariş oluşturulurken beklenmeyen hata: " + e.getMessage(), e);
        }
        
        // OrderItems null kontrolü
        if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
            throw new IllegalArgumentException("Order must have at least one item");
        }
        
        // Toplam tutarı hesapla
        BigDecimal total = order.getOrderItems().stream()
                .map(item -> {
                    if (item.getUnitPrice() == null) {
                        throw new IllegalArgumentException("Order item must have a unit price");
                    }
                    return item.getUnitPrice().multiply(new BigDecimal(item.getQuantity()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setTotalAmount(total);

        // OrderNumber oluştur (eğer yoksa)
        if (order.getOrderNumber() == null || order.getOrderNumber().isEmpty()) {
            order.setOrderNumber("ORD-" + System.currentTimeMillis());
        }

        order.setCreatedAt(LocalDateTime.now());
        if (order.getStatus() == null || order.getStatus().isEmpty()) {
            order.setStatus("PENDING");
        }
        
        Order savedOrder = orderRepository.save(order);
        
        // WebSocket üzerinden mutfak ekranına bildirim gönder
        sendOrderNotification(savedOrder, "Yeni sipariş geldi!");
        
        return savedOrder;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
    
    public Optional<Order> getOrderById(@NonNull Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Order ID cannot be null");
        }
        return orderRepository.findById(id);
    }

    public List<Order> getOrdersByTableId(@NonNull Long tableId) {
        if (tableId == null) {
            throw new IllegalArgumentException("Table ID cannot be null");
        }
        return orderRepository.findByRestaurantTableId(tableId);
    }
    
    @Transactional
    public Order updateOrderStatus(@NonNull Long orderId, @NonNull String status) {
        if (orderId == null) {
            throw new IllegalArgumentException("Order ID cannot be null");
        }
        if (status == null || status.isEmpty()) {
            throw new IllegalArgumentException("Status cannot be null or empty");
        }
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        
        order.setStatus(status);
        order.setUpdatedAt(LocalDateTime.now());
        
        Order updatedOrder = orderRepository.save(order);
        
        // WebSocket üzerinden sipariş durumu güncellemesi gönder
        // Hem mutfak ekranına hem de müşteri ekranına
        sendOrderNotification(updatedOrder, "Sipariş durumu güncellendi: " + status);
        
        // Müşteri için özel topic'e de gönder (masa bazlı)
        if (updatedOrder.getRestaurantTable() != null) {
            sendOrderStatusUpdateToCustomer(updatedOrder);
        }
        
        return updatedOrder;
    }
    
    /**
     * Mutfak ekranına sipariş bildirimi gönderir
     */
    private void sendOrderNotification(Order order, String message) {
        OrderNotificationDTO notification = new OrderNotificationDTO(
            order.getId(),
            order.getOrderNumber(),
            order.getStatus(),
            order.getTotalAmount(),
            order.getRestaurantTable() != null ? order.getRestaurantTable().getId() : null,
            order.getRestaurantTable() != null ? order.getRestaurantTable().getTableNumber() : null,
            order.getCreatedAt(),
            message
        );
        
        // "/topic/kitchen" topic'ine mesaj gönder (mutfak ekranı bu topic'e abone olacak)
        messagingTemplate.convertAndSend("/topic/kitchen", notification);
    }
    
    /**
     * Müşteri ekranına sipariş durumu güncellemesi gönderir (masa bazlı)
     */
    private void sendOrderStatusUpdateToCustomer(Order order) {
        OrderNotificationDTO notification = new OrderNotificationDTO(
            order.getId(),
            order.getOrderNumber(),
            order.getStatus(),
            order.getTotalAmount(),
            order.getRestaurantTable().getId(),
            order.getRestaurantTable().getTableNumber(),
            order.getCreatedAt(),
            "Sipariş durumunuz güncellendi: " + order.getStatus()
        );
        
        // "/topic/table/{tableId}" topic'ine mesaj gönder (müşteri bu topic'e abone olacak)
        String topic = "/topic/table/" + order.getRestaurantTable().getId();
        messagingTemplate.convertAndSend(topic, notification);
    }
}