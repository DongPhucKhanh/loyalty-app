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

    @Column(nullable = false)
    private String password; // Trong thực tế nên mã hóa (BCrypt), ở đây demo lưu plain text

    private String fullName;
    
    private String role; // Ví dụ: "ADMIN", "STAFF"
}