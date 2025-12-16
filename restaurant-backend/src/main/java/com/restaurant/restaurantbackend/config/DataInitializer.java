package com.restaurant.restaurantbackend.config;

import com.restaurant.restaurantbackend.model.Category;
import com.restaurant.restaurantbackend.model.Product;
import com.restaurant.restaurantbackend.model.RestaurantTable;
import com.restaurant.restaurantbackend.repository.CategoryRepository;
import com.restaurant.restaurantbackend.repository.ProductRepository;
import com.restaurant.restaurantbackend.repository.RestaurantTableRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final RestaurantTableRepository tableRepository;

    public DataInitializer(CategoryRepository categoryRepository, 
                          ProductRepository productRepository,
                          RestaurantTableRepository tableRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.tableRepository = tableRepository;
    }

    @Override
    public void run(String... args) {
        // Her zaman test verilerini yeniden ekle (geliştirme için)
        long categoryCount = categoryRepository.count();
        long productCount = productRepository.count();
        
        System.out.println("📊 Mevcut veri durumu:");
        System.out.println("   Kategoriler: " + categoryCount);
        System.out.println("   Ürünler: " + productCount);
        
        // Mevcut verileri temizle ve yeniden ekle
        System.out.println("🔄 Mevcut veriler temizleniyor ve test verileri ekleniyor...");
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        tableRepository.deleteAll();
        
        initializeData();
    }

    private void initializeData() {
        // Kategoriler oluştur
        Category corbalar = createCategory("Çorbalar", "Sıcak ve lezzetli çorbalarımız", 1);
        Category anaYemekler = createCategory("Ana Yemekler", "Doyurucu ana yemeklerimiz", 2);
        Category salatalar = createCategory("Salatalar", "Taze ve sağlıklı salatalarımız", 3);
        Category tatlılar = createCategory("Tatlılar", "Lezzetli tatlılarımız", 4);
        Category icecekler = createCategory("İçecekler", "Soğuk ve sıcak içeceklerimiz", 5);

        // Çorbalar
        createProduct(corbalar, "Mercimek Çorbası", "Geleneksel mercimek çorbası", new BigDecimal("45.00"), 15, null);
        createProduct(corbalar, "Yayla Çorbası", "Yoğurtlu yayla çorbası", new BigDecimal("50.00"), 15, null);
        createProduct(corbalar, "Domates Çorbası", "Taze domates çorbası", new BigDecimal("48.00"), 15, null);

        // Ana Yemekler
        createProduct(anaYemekler, "Adana Kebap", "Acılı adana kebap, pilav ve salata ile", new BigDecimal("180.00"), 25, null);
        createProduct(anaYemekler, "Urfa Kebap", "Urfa kebap, pilav ve salata ile", new BigDecimal("175.00"), 25, null);
        createProduct(anaYemekler, "Döner Tabağı", "Döner, pilav ve salata ile", new BigDecimal("160.00"), 20, null);
        createProduct(anaYemekler, "Lahmacun", "İnce hamurlu lahmacun", new BigDecimal("35.00"), 10, null);
        createProduct(anaYemekler, "Pide", "Kaşarlı pide", new BigDecimal("70.00"), 15, null);

        // Salatalar
        createProduct(salatalar, "Çoban Salata", "Domates, salatalık, soğan, maydanoz", new BigDecimal("45.00"), 5, Arrays.asList("Gluten içermez"));
        createProduct(salatalar, "Mevsim Salata", "Karışık mevsim salatası", new BigDecimal("50.00"), 5, Arrays.asList("Gluten içermez"));
        createProduct(salatalar, "Roka Salatası", "Roka, ceviz, parmesan", new BigDecimal("55.00"), 5, Arrays.asList("Gluten içermez"));

        // Tatlılar
        createProduct(tatlılar, "Baklava", "Cevizli baklava, 6 dilim", new BigDecimal("120.00"), 10, null);
        createProduct(tatlılar, "Künefe", "Sıcak künefe", new BigDecimal("110.00"), 15, null);
        createProduct(tatlılar, "Sütlaç", "Ev yapımı sütlaç", new BigDecimal("45.00"), 5, null);
        createProduct(tatlılar, "Kazandibi", "Geleneksel kazandibi", new BigDecimal("50.00"), 5, null);

        // İçecekler
        createProduct(icecekler, "Ayran", "Ev yapımı ayran", new BigDecimal("25.00"), 2, Arrays.asList("Laktoz içerir"));
        createProduct(icecekler, "Kola", "Soğuk kola", new BigDecimal("30.00"), 1, null);
        createProduct(icecekler, "Çay", "Türk çayı", new BigDecimal("15.00"), 3, null);
        createProduct(icecekler, "Kahve", "Türk kahvesi", new BigDecimal("40.00"), 5, null);
        createProduct(icecekler, "Meyve Suyu", "Portakal suyu", new BigDecimal("35.00"), 2, null);

        // Masalar oluştur
        for (int i = 1; i <= 10; i++) {
            RestaurantTable table = new RestaurantTable();
            table.setTableNumber("Masa " + i);
            table.setCapacity(4);
            table.setLocation("Salon");
            table.setOccupied(false);
            tableRepository.save(table);
        }

        System.out.println("✅ Test verileri başarıyla eklendi!");
    }

    private Category createCategory(String name, String description, Integer displayOrder) {
        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        category.setDisplayOrder(displayOrder);
        category.setActive(true);
        return categoryRepository.save(category);
    }

    private void createProduct(Category category, String name, String description, 
                               BigDecimal price, Integer prepTime, java.util.List<String> allergens) {
        Product product = new Product();
        product.setCategory(category);
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setPreparationTime(prepTime);
        product.setAvailable(true);
        if (allergens != null) {
            product.setAllergens(allergens);
        }
        productRepository.save(product);
    }
}

