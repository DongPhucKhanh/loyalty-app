package com.doan.loyaltyapp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Ai làm? (Lưu số điện thoại hoặc Tên user)
    private String performedBy; 

    // Làm gì? (Ví dụ: "Xóa khách hàng ID 5", "Tạo giao dịch 100k")
    private String action;

    // Chi tiết thêm (Ví dụ: JSON dữ liệu cũ, ghi chú...)
    @Column(length = 1000) // Cho phép lưu dài một chút
    private String details;

    // Thời gian
    private LocalDateTime timestamp = LocalDateTime.now();

    // --- CONSTRUCTOR ---
    public AuditLog() {}

    public AuditLog(String performedBy, String action, String details) {
        this.performedBy = performedBy;
        this.action = action;
        this.details = details;
        this.timestamp = LocalDateTime.now();
    }

    // --- GETTER & SETTER ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}