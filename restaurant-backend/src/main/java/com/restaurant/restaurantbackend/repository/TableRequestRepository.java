package com.restaurant.restaurantbackend.repository;

import com.restaurant.restaurantbackend.model.TableRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TableRequestRepository extends JpaRepository<TableRequest, Long> {
    List<TableRequest> findByRestaurantTableId(Long tableId);
    List<TableRequest> findByStatus(String status);
    List<TableRequest> findByRequestType(String requestType);
}

