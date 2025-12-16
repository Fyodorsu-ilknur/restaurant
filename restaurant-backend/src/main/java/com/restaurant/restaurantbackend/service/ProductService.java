package com.restaurant.restaurantbackend.service;

import com.restaurant.restaurantbackend.model.Product;
import com.restaurant.restaurantbackend.repository.ProductRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    // Constructor'ı elle ekliyoruz
    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    
    public Optional<Product> getProductById(@NonNull Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Product ID cannot be null");
        }
        return productRepository.findById(id);
    }
    
    public List<Product> getProductsByCategoryId(@NonNull Long categoryId) {
        if (categoryId == null) {
            throw new IllegalArgumentException("Category ID cannot be null");
        }
        return productRepository.findByCategoryId(categoryId);
    }

    public Product createOrUpdateProduct(@NonNull Product product) {
        if (product == null) {
            throw new IllegalArgumentException("Product cannot be null");
        }
        return productRepository.save(product);
    }

    public void deleteProduct(@NonNull Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Product ID cannot be null");
        }
        productRepository.deleteById(id);
    }
}