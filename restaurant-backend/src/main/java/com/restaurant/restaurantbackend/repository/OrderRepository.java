package com.restaurant.restaurantbackend.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.restaurant.restaurantbackend.model.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // Belirli bir masaya ait tüm siparişleri bulmak için.
    List<Order> findByRestaurantTableId(Long tableId);

    // Belirli bir duruma sahip tüm siparişleri bulmak için (örn: "HAZIRLANIYOR").
    List<Order> findByStatus(String status);
}