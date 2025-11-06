package com.restaurant.restaurantbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.restaurant.restaurantbackend.model.RestaurantTable;

import java.util.Optional;

@Repository
public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {
    // Masa numarasına göre bir masa bulmak için.
    Optional<RestaurantTable> findByTableNumber(String tableNumber);
}