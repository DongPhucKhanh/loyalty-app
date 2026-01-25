package com.doan.loyaltyapp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "internal_notes")
public class InternalNote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String content;

    // Lưu người gửi là ai để sau này lọc
    private String senderName; // Ví dụ: "nguyenvanA"
    private String senderRole; // Ví dụ: "STAFF" hoặc "ADMIN"

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // --- Constructor, Getter, Setter ---
    public InternalNote() {}

    public InternalNote(String content, String senderName, String senderRole) {
        this.content = content;
        this.senderName = senderName;
        this.senderRole = senderRole;
    }

    // (Bạn tự generate Getter/Setter nhé hoặc dùng Lombok @Data)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }
    public String getSenderRole() { return senderRole; }
    public void setSenderRole(String senderRole) { this.senderRole = senderRole; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}