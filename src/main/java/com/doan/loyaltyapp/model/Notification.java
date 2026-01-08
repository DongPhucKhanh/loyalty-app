package com.doan.loyaltyapp.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId; // Thông báo cho ai? (Nếu null thì là thông báo chung cho tất cả)
    private String title; // Tiêu đề (VD: Cộng điểm thành công)
    private String message; // Nội dung (VD: Bạn nhận được 500 điểm...)
    private String type; // Loại: "TRANSACTION", "PROMOTION", "SYSTEM"
    
    private boolean isRead = false; // Đã xem chưa?
    
    private LocalDateTime createdAt = LocalDateTime.now();
}