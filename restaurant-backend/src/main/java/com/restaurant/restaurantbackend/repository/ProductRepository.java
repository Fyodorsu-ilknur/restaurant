package com.restaurant.restaurantbackend.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.restaurant.restaurantbackend.model.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Spring Data JPA, metot isminden ne yapması gerektiğini anlar.
    // Bu metot, "Verilen categoryId'ye ait tüm ürünleri bul" anlamına gelir.
    List<Product> findByCategoryId(Long categoryId);
}