package com.doan.loyaltyapp.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore; // <--- 1. NHỚ IMPORT CÁI NÀY

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "customers")
@Data
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    
    @Column(unique = true)
    private String email;
    
    private String phone;
    
    private int pointBalance = 0; // Số điểm hiện có

    // 2. Nên đặt giá trị mặc định để không bị null khi mới tạo
    private String tier = "Mới"; 

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)
    @JsonIgnore // <--- 3. QUAN TRỌNG NHẤT: Ngắt vòng lặp vô tận
    private List<Transaction> transactions;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}