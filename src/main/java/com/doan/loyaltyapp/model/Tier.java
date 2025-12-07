package com.doan.loyaltyapp.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "tiers")
@Data
public class Tier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // Tên hạng (VD: Vàng, Bạc)

    @Column(nullable = false)
    private int minPoint; // Điểm tối thiểu để đạt hạng này (VD: 500)
    
    // Thuộc tính phụ để hiển thị màu sắc trên Frontend (nếu muốn)
    private String colorCode; // VD: "gold", "silver", "#ff0000"
}