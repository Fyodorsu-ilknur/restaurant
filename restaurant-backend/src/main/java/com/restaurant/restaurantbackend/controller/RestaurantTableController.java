package com.restaurant.restaurantbackend.controller;

import com.restaurant.restaurantbackend.model.RestaurantTable;
import com.restaurant.restaurantbackend.service.QRCodeService;
import com.restaurant.restaurantbackend.service.RestaurantTableService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tables")
public class RestaurantTableController {

    private final RestaurantTableService tableService;
    private final QRCodeService qrCodeService;

    public RestaurantTableController(RestaurantTableService tableService, QRCodeService qrCodeService) {
        this.tableService = tableService;
        this.qrCodeService = qrCodeService;
    }

    @GetMapping
    public ResponseEntity<List<RestaurantTable>> getAllTables() {
        List<RestaurantTable> tables = tableService.getAllTables();
        return ResponseEntity.ok(tables);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestaurantTable> getTableById(@PathVariable @NonNull Long id) {
        return tableService.getTableById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-number/{tableNumber}")
    public ResponseEntity<RestaurantTable> getTableByNumber(@PathVariable @NonNull String tableNumber) {
        return tableService.getTableByNumber(tableNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<RestaurantTable> createTable(@RequestBody @NonNull RestaurantTable table) {
        RestaurantTable newTable = tableService.createOrUpdateTable(table);
        return new ResponseEntity<>(newTable, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RestaurantTable> updateTable(@PathVariable @NonNull Long id, @RequestBody @NonNull RestaurantTable table) {
        table.setId(id);
        RestaurantTable updatedTable = tableService.createOrUpdateTable(table);
        return ResponseEntity.ok(updatedTable);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTable(@PathVariable @NonNull Long id) {
        tableService.deleteTable(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Masa için QR kod görselini döndürür (PNG formatında)
     */
    @GetMapping("/{id}/qr-code")
    public ResponseEntity<byte[]> getQRCodeImage(@PathVariable @NonNull Long id) {
        try {
            byte[] qrCodeImage = qrCodeService.generateQRCode(id);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_PNG);
            headers.setContentLength(qrCodeImage.length);
            headers.set("Content-Disposition", "inline; filename=qr-code-" + id + ".png");
            
            return new ResponseEntity<>(qrCodeImage, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Masa için QR kod içeriğini döndürür (text olarak)
     */
    @GetMapping("/{id}/qr-code-content")
    public ResponseEntity<String> getQRCodeContent(@PathVariable @NonNull Long id) {
        String qrContent = qrCodeService.getQRCodeContent(id);
        return ResponseEntity.ok(qrContent);
    }

    /**
     * Masa için QR kodunu yeniden oluşturur
     */
    @PostMapping("/{id}/regenerate-qr")
    public ResponseEntity<RestaurantTable> regenerateQRCode(@PathVariable @NonNull Long id) {
        RestaurantTable updatedTable = tableService.regenerateQRCode(id);
        return ResponseEntity.ok(updatedTable);
    }
}