package com.restaurant.restaurantbackend.controller;

import com.restaurant.restaurantbackend.model.TableRequest;
import com.restaurant.restaurantbackend.service.TableRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/table-requests")
public class TableRequestController {

    private final TableRequestService tableRequestService;

    public TableRequestController(TableRequestService tableRequestService) {
        this.tableRequestService = tableRequestService;
    }

    @GetMapping
    public ResponseEntity<List<TableRequest>> getAllRequests() {
        List<TableRequest> requests = tableRequestService.getAllRequests();
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<TableRequest>> getPendingRequests() {
        List<TableRequest> requests = tableRequestService.getPendingRequests();
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/table/{tableId}")
    public ResponseEntity<List<TableRequest>> getRequestsByTable(@PathVariable @NonNull Long tableId) {
        List<TableRequest> requests = tableRequestService.getRequestsByTableId(tableId);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TableRequest> getRequestById(@PathVariable @NonNull Long id) {
        return tableRequestService.getRequestById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<TableRequest> createRequest(@RequestBody @NonNull TableRequest request) {
        TableRequest newRequest = tableRequestService.createRequest(request);
        return new ResponseEntity<>(newRequest, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TableRequest> updateRequestStatus(
            @PathVariable @NonNull Long id,
            @RequestBody @NonNull StatusUpdateDTO statusDTO) {
        String status = statusDTO.getStatus();
        if (status == null || status.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        TableRequest updatedRequest = tableRequestService.updateRequestStatus(id, status);
        return ResponseEntity.ok(updatedRequest);
    }

    // DTO for status update
    public static class StatusUpdateDTO {
        private String status;

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}

