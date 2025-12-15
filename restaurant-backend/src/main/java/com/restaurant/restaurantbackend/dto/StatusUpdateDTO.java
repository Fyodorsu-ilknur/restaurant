package com.restaurant.restaurantbackend.dto;

public class StatusUpdateDTO {
    private String status;

    public StatusUpdateDTO() {
    }

    public StatusUpdateDTO(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

