package com.restaurant.restaurantbackend.service;

import com.restaurant.restaurantbackend.dto.OrderNotificationDTO;
import com.restaurant.restaurantbackend.model.Order;
import com.restaurant.restaurantbackend.repository.OrderRepository;
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
    private final SimpMessagingTemplate messagingTemplate;

    public OrderService(OrderRepository orderRepository, SimpMessagingTemplate messagingTemplate) {
        this.orderRepository = orderRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public Order createOrder(Order order) {
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
    
    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }
    
    @Transactional
    public Order updateOrderStatus(Long orderId, String status) {
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