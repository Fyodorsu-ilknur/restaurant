package com.restaurant.restaurantbackend.service;

import com.restaurant.restaurantbackend.model.Product;
import com.restaurant.restaurantbackend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ChatbotService {

    private final ProductRepository productRepository;
    private final RestTemplate restTemplate;
    
    @Value("${gemini.api.key:}")
    private String geminiApiKey;
    
    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent}")
    private String geminiApiUrl;

    @Autowired
    public ChatbotService(ProductRepository productRepository, RestTemplate restTemplate) {
        this.productRepository = productRepository;
        this.restTemplate = restTemplate;
    }

    public String getChatbotResponse(@NonNull String userMessage) {
        // Google Gemini API key yoksa, basit bir kural tabanlı yanıt döndür
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            return getSimpleResponse(userMessage);
        }

        try {
            // Menü bilgilerini al
            List<Product> products = productRepository.findAll();
            String menuContext = buildMenuContext(products);

            // Google Gemini API'ye istek gönder
            String response = callGeminiAPI(userMessage, menuContext);
            return response;
        } catch (Exception e) {
            System.err.println("Google Gemini API hatası: " + e.getMessage());
            e.printStackTrace();
            // Hata durumunda basit yanıt döndür
            return getSimpleResponse(userMessage);
        }
    }

    private String callGeminiAPI(String userMessage, String menuContext) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");

        String systemPrompt = "Sen bir restoran asistanısın. Müşterilere menü hakkında bilgi veriyorsun, ürün öneriyorsun ve sipariş konusunda yardımcı oluyorsun.\n\n" +
                "ÖNEMLİ KURALLAR:\n" +
                "1. Sadece menüdeki ürünler hakkında konuş. Menüde olmayan ürünler için öneride bulunma.\n" +
                "2. Müşteri alerjen veya diyet kısıtlaması belirtirse (laktoz, gluten, fıstık, vegan, vejetaryen vb.), MUTLAKA bu kısıtlamalara uygun ürünler öner.\n" +
                "3. Alerjen bilgisi içeren ürünleri asla önerme (örnek: laktoz intoleransı varsa 'Laktoz içerir' yazan ürünleri önerme).\n" +
                "4. Müşteri öneri istediğinde, kategorilere göre çeşitli ürünler öner (sadece 2-3 ürün değil, 8-10 ürün öner).\n" +
                "5. Her ürün için hazırlanma süresini (preparationTime) mutlaka belirt.\n" +
                "6. Müşteri vaktinin kısıtlı olduğunu söylerse, hazırlanma süresi kısa olan ürünleri öncelikle öner.\n" +
                "7. Türkçe yanıt ver. Samimi ve yardımcı ol.\n" +
                "8. Her ürün için format: '• [Ürün Adı] - [Fiyat] ₺ (⏱️ [Hazırlanma Süresi] dakika)'\n\n" +
                "Menü Bilgileri:\n" + menuContext;

        // Google Gemini API request formatı
        Map<String, Object> requestBody = new HashMap<>();
        
        // Contents array
        List<Map<String, Object>> contents = new java.util.ArrayList<>();
        
        // System instruction (part olarak ekleniyor)
        Map<String, Object> systemPart = new HashMap<>();
        systemPart.put("text", systemPrompt);
        Map<String, Object> systemContent = new HashMap<>();
        systemContent.put("role", "user");
        systemContent.put("parts", List.of(systemPart));
        contents.add(systemContent);
        
        // User message
        Map<String, Object> userPart = new HashMap<>();
        userPart.put("text", userMessage);
        Map<String, Object> userContent = new HashMap<>();
        userContent.put("role", "user");
        userContent.put("parts", List.of(userPart));
        contents.add(userContent);
        
        requestBody.put("contents", contents);
        
        // Generation config
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.7);
        generationConfig.put("maxOutputTokens", 800); // Daha uzun yanıtlar için artırıldı
        requestBody.put("generationConfig", generationConfig);

        // API key'i URL'e query parameter olarak ekle
        String urlWithKey = geminiApiUrl + "?key=" + geminiApiKey;
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        
        ResponseEntity<Map> response = restTemplate.exchange(
            urlWithKey,
            HttpMethod.POST,
            request,
            Map.class
        );

        Map<String, Object> responseBody = response.getBody();
        if (responseBody != null && responseBody.containsKey("candidates")) {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
            if (!candidates.isEmpty()) {
                Map<String, Object> firstCandidate = candidates.get(0);
                Map<String, Object> content = (Map<String, Object>) firstCandidate.get("content");
                if (content != null && content.containsKey("parts")) {
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    if (!parts.isEmpty()) {
                        Map<String, Object> firstPart = parts.get(0);
                        return (String) firstPart.get("text");
                    }
                }
            }
        }
        
        return "Üzgünüm, şu anda yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.";
    }

    private String buildMenuContext(List<Product> products) {
        if (products.isEmpty()) {
            return "Menüde şu anda ürün bulunmamaktadır.";
        }

        StringBuilder context = new StringBuilder();
        context.append("Menüdeki Ürünler:\n\n");

        // Kategorilere göre grupla
        Map<String, List<Product>> productsByCategory = products.stream()
            .filter(p -> p.getCategory() != null)
            .collect(Collectors.groupingBy(p -> p.getCategory().getName()));

        productsByCategory.forEach((categoryName, categoryProducts) -> {
            context.append(categoryName).append(":\n");
            categoryProducts.forEach(product -> {
                context.append("- ").append(product.getName());
                if (product.getDescription() != null && !product.getDescription().isEmpty()) {
                    context.append(": ").append(product.getDescription());
                }
                context.append(" (").append(product.getPrice()).append(" ₺)");
                
                // Hazırlanma süresi
                if (product.getPreparationTime() != null) {
                    context.append(" [⏱️ ").append(product.getPreparationTime()).append(" dakika]");
                }
                
                // Vegan/Vejetaryen bilgisi
                if (product.getIsVegan() != null && product.getIsVegan()) {
                    context.append(" [Vegan]");
                } else if (product.getIsVegetarian() != null && product.getIsVegetarian()) {
                    context.append(" [Vejetaryen]");
                }
                
                // Alerjen bilgisi - ÖNEMLİ: Bu bilgiyi mutlaka göster
                if (product.getAllergens() != null && !product.getAllergens().isEmpty()) {
                    context.append(" [⚠️ Alerjen: ").append(String.join(", ", product.getAllergens())).append("]");
                } else {
                    context.append(" [✓ Alerjen içermez]");
                }
                context.append("\n");
            });
            context.append("\n");
        });

        return context.toString();
    }

    private String getSimpleResponse(String userMessage) {
        String message = userMessage.toLowerCase();
        
        // Basit kural tabanlı yanıtlar
        if (message.contains("vegan") || message.contains("vejetaryen")) {
            List<Product> veganProducts = productRepository.findAll().stream()
                .filter(p -> (p.getIsVegan() != null && p.getIsVegan()) || 
                           (p.getIsVegetarian() != null && p.getIsVegetarian()))
                .limit(5)
                .collect(Collectors.toList());
            
            if (veganProducts.isEmpty()) {
                return "Üzgünüm, şu anda menüde vegan/vejetaryen ürün bulunmamaktadır.";
            }
            
            StringBuilder response = new StringBuilder("Vegan/Vejetaryen ürünlerimiz:\n");
            veganProducts.forEach(p -> {
                response.append("• ").append(p.getName()).append(" - ").append(p.getPrice()).append(" ₺\n");
            });
            return response.toString();
        }
        
        if (message.contains("fiyat") || message.contains("ne kadar") || message.contains("kaç")) {
            return "Ürün fiyatlarını görmek için menü sayfasındaki ürün kartlarına bakabilirsiniz. Belirli bir ürünün fiyatını öğrenmek isterseniz, ürün adını yazabilirsiniz.";
        }
        
        // Alerjen filtreleme kontrolü
        boolean hasAllergenRestriction = message.contains("laktoz") || message.contains("gluten") || 
                                        message.contains("fıstık") || message.contains("yumurta") ||
                                        message.contains("süt") || message.contains("intolerans") ||
                                        message.contains("alerjen") || message.contains("alerji");
        
        // Öneri isteği
        if (message.contains("öner") || message.contains("tavsiye") || message.contains("ne yiyebilirim") || 
            message.contains("ne içebilirim") || message.contains("yemek öner") || message.contains("içecek öner")) {
            
            List<Product> recommendedProducts;
            
            if (hasAllergenRestriction) {
                // Alerjen filtreleme
                String lowerMessage = message.toLowerCase();
                recommendedProducts = productRepository.findAll().stream()
                    .filter(p -> {
                        // Laktoz kontrolü
                        if (lowerMessage.contains("laktoz") || lowerMessage.contains("süt")) {
                            if (p.getAllergens() != null) {
                                boolean hasLactose = p.getAllergens().stream()
                                    .anyMatch(a -> a.toLowerCase().contains("laktoz") || 
                                                  a.toLowerCase().contains("süt") ||
                                                  a.toLowerCase().contains("dairy"));
                                if (hasLactose) return false;
                            }
                        }
                        // Gluten kontrolü
                        if (lowerMessage.contains("gluten")) {
                            if (p.getAllergens() != null) {
                                boolean hasGluten = p.getAllergens().stream()
                                    .anyMatch(a -> a.toLowerCase().contains("gluten"));
                                if (hasGluten) return false;
                            }
                        }
                        // Fıstık kontrolü
                        if (lowerMessage.contains("fıstık")) {
                            if (p.getAllergens() != null) {
                                boolean hasPeanut = p.getAllergens().stream()
                                    .anyMatch(a -> a.toLowerCase().contains("fıstık") || 
                                                  a.toLowerCase().contains("peanut"));
                                if (hasPeanut) return false;
                            }
                        }
                        return true;
                    })
                    .limit(10)
                    .collect(Collectors.toList());
            } else {
                // Normal öneri
                recommendedProducts = productRepository.findAll().stream()
                    .limit(10)
                    .collect(Collectors.toList());
            }
            
            if (recommendedProducts.isEmpty()) {
                return "Üzgünüm, belirttiğiniz kriterlere uygun ürün bulunamadı. Lütfen farklı bir kriter belirtin.";
            }
            
            StringBuilder response = new StringBuilder("Size şunları önerebilirim:\n\n");
            recommendedProducts.forEach(p -> {
                response.append("• ").append(p.getName())
                        .append(" - ").append(p.getPrice()).append(" ₺");
                if (p.getPreparationTime() != null) {
                    response.append(" (⏱️ ").append(p.getPreparationTime()).append(" dakika)");
                }
                response.append("\n");
            });
            return response.toString();
        }
        
        if (message.contains("merhaba") || message.contains("selam") || message.contains("hello")) {
            return "Merhaba! Size nasıl yardımcı olabilirim? Menü hakkında sorularınızı sorabilir, vegan/vejetaryen ürünler hakkında bilgi alabilir veya öneri isteyebilirsiniz.";
        }
        
        return "Menü hakkında sorularınız için 'vegan ürünler', 'fiyatlar', 'öneriler' gibi anahtar kelimeler kullanabilirsiniz. Belirli bir ürün hakkında bilgi almak isterseniz, ürün adını yazabilirsiniz.";
    }
}

