package com.restaurant.restaurantbackend.service;

import com.restaurant.restaurantbackend.model.Category;
import com.restaurant.restaurantbackend.repository.CategoryRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Optional<Category> getCategoryById(@NonNull Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Category ID cannot be null");
        }
        return categoryRepository.findById(id);
    }

    public Category createOrUpdateCategory(@NonNull Category category) {
        if (category == null) {
            throw new IllegalArgumentException("Category cannot be null");
        }
        return categoryRepository.save(category);
    }

    public void deleteCategory(@NonNull Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Category ID cannot be null");
        }
        categoryRepository.deleteById(id);
    }
}