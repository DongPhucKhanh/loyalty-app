package com.doan.loyaltyapp.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "promotions")
@Data
public class Promotion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // Tên sự kiện (VD: Mừng sinh nhật)

    @Column(nullable = false)
    private String description; 

    private LocalDate startDate; // Ngày bắt đầu
    private LocalDate endDate;   // Ngày kết thúc

    private double multiplier = 1.0; // Hệ số nhân (VD: 2.0 là nhân đôi)
    
    // true: Đang chạy, false: Tắt
    private boolean active = true; 
}