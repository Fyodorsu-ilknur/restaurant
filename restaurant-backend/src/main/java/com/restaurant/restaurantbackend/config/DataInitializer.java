package com.restaurant.restaurantbackend.config;

import com.restaurant.restaurantbackend.model.Category;
import com.restaurant.restaurantbackend.model.Product;
import com.restaurant.restaurantbackend.model.RestaurantTable;
import com.restaurant.restaurantbackend.repository.CategoryRepository;
import com.restaurant.restaurantbackend.repository.OrderItemRepository;
import com.restaurant.restaurantbackend.repository.OrderRepository;
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
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    public DataInitializer(CategoryRepository categoryRepository, 
                          ProductRepository productRepository,
                          RestaurantTableRepository tableRepository,
                          OrderRepository orderRepository,
                          OrderItemRepository orderItemRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.tableRepository = tableRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
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
        // ÖNEMLİ: Foreign key constraint'ler nedeniyle sıralama önemli!
        // 1. Önce order_items'ı sil (Product'a foreign key var)
        // 2. Sonra orders'ı sil
        // 3. Sonra products'ı sil
        // 4. Sonra categories ve tables'ı sil
        System.out.println("🔄 Mevcut veriler temizleniyor ve test verileri ekleniyor...");
        orderItemRepository.deleteAll(); // Önce order_items'ı sil
        orderRepository.deleteAll(); // Sonra orders'ı sil
        productRepository.deleteAll(); // Sonra products'ı sil
        categoryRepository.deleteAll(); // Sonra categories'ı sil
        tableRepository.deleteAll(); // Son olarak tables'ı sil
        
        initializeData();
    }

    private void initializeData() {
        // Kategoriler oluştur
        Category corbalar = createCategory("Çorbalar", "Sıcak ve lezzetli çorbalarımız", 1);
        Category mezeler = createCategory("Mezeler", "Lezzetli mezelerimiz", 2);
        Category araSicaklar = createCategory("Ara Sıcaklar", "Sıcak ara yemeklerimiz", 3);
        Category anaYemekler = createCategory("Ana Yemekler", "Doyurucu ana yemeklerimiz", 4);
        Category salatalar = createCategory("Salatalar", "Taze ve sağlıklı salatalarımız", 5);
        Category sicakIcecekler = createCategory("Sıcak İçecekler", "Sıcak içeceklerimiz", 6);
        Category sogukIcecekler = createCategory("Soğuk İçecekler", "Soğuk içeceklerimiz", 7);
        Category tatlılar = createCategory("Tatlılar", "Lezzetli tatlılarımız", 8);

        // Çorbalar
        createProduct(corbalar, "Mercimek Çorbası", "Geleneksel mercimek çorbası", new BigDecimal("45.00"), 15, null, true, true);
        createProduct(corbalar, "Yayla Çorbası", "Yoğurtlu yayla çorbası", new BigDecimal("50.00"), 15, Arrays.asList("Laktoz içerir"), false, true);
        createProduct(corbalar, "Domates Çorbası", "Taze domates çorbası", new BigDecimal("48.00"), 15, null, true, true);
        createProduct(corbalar, "Ezogelin Çorbası", "Geleneksel ezogelin çorbası", new BigDecimal("52.00"), 15, null, true, true);
        createProduct(corbalar, "Tavuk Çorbası", "Ev yapımı tavuk çorbası", new BigDecimal("55.00"), 20, null, false, false);
        
        // Mezeler
        createProduct(mezeler, "Humus", "Nohut ezmesi, zeytinyağı ve tahin ile", new BigDecimal("65.00"), 10, Arrays.asList("Susam içerir"), true, true);
        createProduct(mezeler, "Haydari", "Yoğurtlu haydari", new BigDecimal("55.00"), 8, Arrays.asList("Laktoz içerir"), false, true);
        createProduct(mezeler, "Cacık", "Yoğurtlu cacık", new BigDecimal("50.00"), 5, Arrays.asList("Laktoz içerir"), false, true);
        createProduct(mezeler, "Patlıcan Ezmesi", "Közlü patlıcan ezmesi", new BigDecimal("60.00"), 12, null, true, true);
        createProduct(mezeler, "Zeytinyağlı Enginar", "Taze enginar, zeytinyağı ile", new BigDecimal("85.00"), 15, null, true, true);
        createProduct(mezeler, "Zeytinyağlı Taze Fasulye", "Taze fasulye, zeytinyağı ile", new BigDecimal("70.00"), 15, null, true, true);
        createProduct(mezeler, "Beyaz Peynir", "Taze beyaz peynir", new BigDecimal("75.00"), 5, Arrays.asList("Laktoz içerir"), false, true);
        createProduct(mezeler, "Kaşar Peyniri", "Taze kaşar peyniri", new BigDecimal("80.00"), 5, Arrays.asList("Laktoz içerir"), false, true);
        createProduct(mezeler, "Zeytin Tabağı", "Karışık zeytin tabağı", new BigDecimal("45.00"), 3, null, true, true);
        
        // Ara Sıcaklar
        createProduct(araSicaklar, "Köfte", "Izgara köfte, pilav ve salata ile", new BigDecimal("140.00"), 20, null, false, false);
        createProduct(araSicaklar, "Tavuk Şiş", "Izgara tavuk şiş, pilav ve salata ile", new BigDecimal("130.00"), 18, null, false, false);
        createProduct(araSicaklar, "Kuzu Şiş", "Izgara kuzu şiş, pilav ve salata ile", new BigDecimal("150.00"), 20, null, false, false);
        createProduct(araSicaklar, "Tavuk Kanat", "Baharatlı tavuk kanat", new BigDecimal("95.00"), 15, null, false, false);
        createProduct(araSicaklar, "Köfte Tava", "Köfte tava, pilav ve salata ile", new BigDecimal("145.00"), 20, null, false, false);
        createProduct(araSicaklar, "Tavuk Sote", "Tavuk sote, pilav ile", new BigDecimal("125.00"), 18, null, false, false);

        // Ana Yemekler
        createProduct(anaYemekler, "Adana Kebap", "Acılı adana kebap, pilav ve salata ile", new BigDecimal("180.00"), 25, null, false, false);
        createProduct(anaYemekler, "Urfa Kebap", "Urfa kebap, pilav ve salata ile", new BigDecimal("175.00"), 25, null, false, false);
        createProduct(anaYemekler, "Döner Tabağı", "Döner, pilav ve salata ile", new BigDecimal("160.00"), 20, null, false, false);
        createProduct(anaYemekler, "Lahmacun", "İnce hamurlu lahmacun", new BigDecimal("35.00"), 10, null, false, false);
        createProduct(anaYemekler, "Pide", "Kaşarlı pide", new BigDecimal("70.00"), 15, Arrays.asList("Laktoz içerir", "Gluten içerir"), false, true);

        // Salatalar
        createProduct(salatalar, "Çoban Salata", "Domates, salatalık, soğan, maydanoz", new BigDecimal("45.00"), 5, null, true, true);
        createProduct(salatalar, "Mevsim Salata", "Karışık mevsim salatası", new BigDecimal("50.00"), 5, null, true, true);
        createProduct(salatalar, "Roka Salatası", "Roka, ceviz, parmesan", new BigDecimal("55.00"), 5, Arrays.asList("Laktoz içerir", "Ceviz içerir"), false, true);

        // Tatlılar
        createProduct(tatlılar, "Baklava", "Cevizli baklava, 6 dilim", new BigDecimal("120.00"), 10, Arrays.asList("Ceviz içerir", "Gluten içerir"), false, true);
        createProduct(tatlılar, "Künefe", "Sıcak künefe", new BigDecimal("110.00"), 15, Arrays.asList("Laktoz içerir", "Gluten içerir"), false, true);
        createProduct(tatlılar, "Sütlaç", "Ev yapımı sütlaç", new BigDecimal("45.00"), 5, Arrays.asList("Laktoz içerir"), false, true);
        createProduct(tatlılar, "Kazandibi", "Geleneksel kazandibi", new BigDecimal("50.00"), 5, Arrays.asList("Laktoz içerir"), false, true);

        // Sıcak İçecekler
        createProduct(sicakIcecekler, "Türk Çayı", "Geleneksel Türk çayı", new BigDecimal("15.00"), 3, null, true, true);
        createProduct(sicakIcecekler, "Türk Kahvesi", "Geleneksel Türk kahvesi", new BigDecimal("40.00"), 5, null, true, true);
        createProduct(sicakIcecekler, "Espresso", "Espresso kahve", new BigDecimal("45.00"), 5, null, true, true);
        createProduct(sicakIcecekler, "Cappuccino", "Cappuccino", new BigDecimal("50.00"), 6, Arrays.asList("Laktoz içerir"), false, true);
        createProduct(sicakIcecekler, "Latte", "Latte", new BigDecimal("55.00"), 6, Arrays.asList("Laktoz içerir"), false, true);
        createProduct(sicakIcecekler, "Sıcak Çikolata", "Sıcak çikolata", new BigDecimal("45.00"), 5, Arrays.asList("Laktoz içerir"), false, true);
        createProduct(sicakIcecekler, "Salep", "Geleneksel salep", new BigDecimal("35.00"), 5, Arrays.asList("Laktoz içerir"), false, true);
        createProduct(sicakIcecekler, "Adaçayı", "Adaçayı", new BigDecimal("20.00"), 3, null, true, true);
        createProduct(sicakIcecekler, "Ihlamur", "Ihlamur çayı", new BigDecimal("20.00"), 3, null, true, true);
        
        // Soğuk İçecekler
        createProduct(sogukIcecekler, "Ayran", "Ev yapımı ayran", new BigDecimal("25.00"), 2, Arrays.asList("Laktoz içerir"), false, true);
        createProduct(sogukIcecekler, "Kola", "Soğuk kola", new BigDecimal("30.00"), 1, null, true, true);
        createProduct(sogukIcecekler, "Fanta", "Soğuk Fanta", new BigDecimal("30.00"), 1, null, true, true);
        createProduct(sogukIcecekler, "Sprite", "Soğuk Sprite", new BigDecimal("30.00"), 1, null, true, true);
        createProduct(sogukIcecekler, "Meyve Suyu", "Portakal suyu", new BigDecimal("35.00"), 2, null, true, true);
        createProduct(sogukIcecekler, "Limonata", "Taze limonata", new BigDecimal("40.00"), 3, null, true, true);
        createProduct(sogukIcecekler, "Şalgam", "Şalgam suyu", new BigDecimal("25.00"), 1, null, true, true);
        createProduct(sogukIcecekler, "Buzlu Kahve", "Buzlu kahve", new BigDecimal("50.00"), 5, null, true, true);
        createProduct(sogukIcecekler, "Milkshake", "Çikolatalı milkshake", new BigDecimal("60.00"), 5, Arrays.asList("Laktoz içerir"), false, true);
        createProduct(sogukIcecekler, "Smoothie", "Karışık meyve smoothie", new BigDecimal("55.00"), 5, null, true, true);

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
        createProduct(category, name, description, price, prepTime, allergens, false, false);
    }
    
    private void createProduct(Category category, String name, String description, 
                               BigDecimal price, Integer prepTime, java.util.List<String> allergens,
                               Boolean isVegan, Boolean isVegetarian) {
        Product product = new Product();
        product.setCategory(category);
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setPreparationTime(prepTime);
        product.setAvailable(true);
        // Lombok @Data ile Boolean field'lar için setter: setIsVegan, setIsVegetarian
        if (isVegan != null) {
            product.setIsVegan(isVegan);
        } else {
            product.setIsVegan(false);
        }
        if (isVegetarian != null) {
            product.setIsVegetarian(isVegetarian);
        } else {
            product.setIsVegetarian(false);
        }
        if (allergens != null) {
            product.setAllergens(allergens);
        }
        productRepository.save(product);
    }
}

