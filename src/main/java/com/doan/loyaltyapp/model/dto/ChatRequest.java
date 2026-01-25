package com.doan.loyaltyapp.model.dto;

public class ChatRequest {
    private String message;
    private Long customerId;

    // Constructor mặc định
    public ChatRequest() {
    }

    // Constructor đầy đủ
    public ChatRequest(String message, Long customerId) {
        this.message = message;
        this.customerId = customerId;
    }

    // --- GETTERS & SETTERS (Bắt buộc phải có) ---
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }
}