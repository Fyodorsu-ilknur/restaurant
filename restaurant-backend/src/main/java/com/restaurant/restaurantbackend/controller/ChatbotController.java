package com.restaurant.restaurantbackend.controller;

import com.restaurant.restaurantbackend.service.ChatbotService;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {

    private final ChatbotService chatbotService;

    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody @NonNull ChatRequest request) {
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Mesaj boş olamaz");
            return ResponseEntity.badRequest().body(error);
        }

        String response = chatbotService.getChatbotResponse(request.getMessage());
        
        Map<String, String> result = new HashMap<>();
        result.put("response", response);
        
        return ResponseEntity.ok(result);
    }

    // DTO for chat request
    public static class ChatRequest {
        private String message;

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}

