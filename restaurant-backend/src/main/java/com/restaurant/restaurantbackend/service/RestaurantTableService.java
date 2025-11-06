package com.restaurant.restaurantbackend.service;

import com.restaurant.restaurantbackend.model.RestaurantTable;
import com.restaurant.restaurantbackend.repository.RestaurantTableRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RestaurantTableService {

    private final RestaurantTableRepository restaurantTableRepository;

    public RestaurantTableService(RestaurantTableRepository restaurantTableRepository) {
        this.restaurantTableRepository = restaurantTableRepository;
    }

    public List<RestaurantTable> getAllTables() {
        return restaurantTableRepository.findAll();
    }
    
    public Optional<RestaurantTable> getTableById(Long id) {
        return restaurantTableRepository.findById(id);
    }

    public RestaurantTable createOrUpdateTable(RestaurantTable table) {
        return restaurantTableRepository.save(table);
    }

    public void deleteTable(Long id) {
        restaurantTableRepository.deleteById(id);
    }
}