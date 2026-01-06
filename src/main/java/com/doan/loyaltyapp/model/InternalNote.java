package com.doan.loyaltyapp.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "internal_notes")
public class InternalNote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String content; // Nội dung ghi chú

    private String senderName; // Tên người gửi (NV01, Admin...)
    private String senderRole; // Vai trò (STAFF, ADMIN)

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}