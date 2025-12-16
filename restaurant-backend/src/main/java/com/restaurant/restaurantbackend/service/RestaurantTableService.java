package com.restaurant.restaurantbackend.service;

import com.restaurant.restaurantbackend.model.RestaurantTable;
import com.restaurant.restaurantbackend.repository.RestaurantTableRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class RestaurantTableService {

    private final RestaurantTableRepository restaurantTableRepository;
    private final QRCodeService qrCodeService;

    public RestaurantTableService(RestaurantTableRepository restaurantTableRepository, QRCodeService qrCodeService) {
        this.restaurantTableRepository = restaurantTableRepository;
        this.qrCodeService = qrCodeService;
    }

    public List<RestaurantTable> getAllTables() {
        return restaurantTableRepository.findAll();
    }
    
    public Optional<RestaurantTable> getTableById(@NonNull Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Table ID cannot be null");
        }
        return restaurantTableRepository.findById(id);
    }

    public Optional<RestaurantTable> getTableByNumber(@NonNull String tableNumber) {
        if (tableNumber == null || tableNumber.isEmpty()) {
            throw new IllegalArgumentException("Table number cannot be null or empty");
        }
        // Eğer sadece sayı girildiyse "Masa " prefix'i ekle
        String normalizedTableNumber = tableNumber.trim();
        if (normalizedTableNumber.matches("^\\d+$")) {
            normalizedTableNumber = "Masa " + normalizedTableNumber;
        }
        return restaurantTableRepository.findByTableNumber(normalizedTableNumber);
    }

    @Transactional
    public RestaurantTable createOrUpdateTable(RestaurantTable table) {
        // Eğer yeni masa oluşturuluyorsa veya QR kod yoksa, QR kod içeriğini oluştur
        if (table.getId() == null || table.getQrCode() == null || table.getQrCode().isEmpty()) {
            // QR kod içeriğini oluştur (masa kaydedildikten sonra ID'ye göre)
            // Önce kaydet, sonra QR kod içeriğini güncelle
            RestaurantTable savedTable = restaurantTableRepository.save(table);
            String qrContent = qrCodeService.getQRCodeContent(savedTable.getId());
            savedTable.setQrCode(qrContent);
            return restaurantTableRepository.save(savedTable);
        }
        
        return restaurantTableRepository.save(table);
    }
    
    /**
     * Masa için QR kod içeriğini yeniden oluşturur
     */
    @Transactional
    public RestaurantTable regenerateQRCode(@NonNull Long tableId) {
        if (tableId == null) {
            throw new IllegalArgumentException("Table ID cannot be null");
        }
        RestaurantTable table = restaurantTableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found with id: " + tableId));
        
        String qrContent = qrCodeService.getQRCodeContent(tableId);
        table.setQrCode(qrContent);
        
        return restaurantTableRepository.save(table);
    }

    public void deleteTable(@NonNull Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Table ID cannot be null");
        }
        restaurantTableRepository.deleteById(id);
    }
}