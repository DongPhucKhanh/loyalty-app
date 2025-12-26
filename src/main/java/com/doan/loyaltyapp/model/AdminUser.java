package com.doan.loyaltyapp.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "admin_users")
@Data
public class AdminUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    // SỬA DÒNG NÀY: Thêm length = 255 để chứa thoải mái mã hóa BCrypt
    @Column(nullable = false, length = 255) 
    private String password; 

    private String fullName;
    
    private String role; // Ví dụ: "ADMIN", "STAFF"
}