package com.restaurant.restaurantbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.restaurant.restaurantbackend.model.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

}   