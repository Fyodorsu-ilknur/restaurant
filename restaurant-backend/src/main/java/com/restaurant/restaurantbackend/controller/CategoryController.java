package com.restaurant.restaurantbackend.controller;

import com.restaurant.restaurantbackend.model.Category;
import com.restaurant.restaurantbackend.service.CategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    // Constructor'ı elle ekliyoruz
    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // Tüm kategorileri getiren endpoint (HTTP GET isteği)
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        List<Category> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    // ID'ye göre tek bir kategori getiren endpoint
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable @NonNull Long id) {
        return categoryService.getCategoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Yeni bir kategori oluşturan endpoint (HTTP POST isteği)
    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestBody @NonNull Category category) {
        Category newCategory = categoryService.createOrUpdateCategory(category);
        return new ResponseEntity<>(newCategory, HttpStatus.CREATED);
    }

    // Mevcut bir kategoriyi güncelleyen endpoint (HTTP PUT isteği)
    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable @NonNull Long id, @RequestBody @NonNull Category category) {
        category.setId(id); // Gelen ID'yi nesneye set ediyoruz
        Category updatedCategory = categoryService.createOrUpdateCategory(category);
        return ResponseEntity.ok(updatedCategory);
    }

    // Bir kategoriyi silen endpoint (HTTP DELETE isteği)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable @NonNull Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}