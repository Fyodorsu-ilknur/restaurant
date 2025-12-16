package com.restaurant.restaurantbackend.model;

import java.math.BigDecimal;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Bu, Product ile Category arasındaki ilişkiyi kurar.
    // "Birçok ürün, tek bir kategoriye aittir."
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    private String name;

    private String description;

    // Fiyat gibi parasal değerler için her zaman BigDecimal kullanılır.
    private BigDecimal price;

    private String imageUrl;

    private boolean isAvailable = true;
    private Boolean isVegan = false;
    private Boolean isVegetarian = false;

    // Hazırlanma süresi (dakika cinsinden)
    private Integer preparationTime;

    private Integer calories;

    // Ürünün alerjenlerini bir liste olarak saklamak için
    @ElementCollection
    @CollectionTable(name="product_allergens", joinColumns=@JoinColumn(name="product_id"))
    private List<String> allergens;
}