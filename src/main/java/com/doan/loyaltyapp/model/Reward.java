package com.doan.loyaltyapp.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "rewards")
@Data
public class Reward {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    
    private int pointCost; // Số điểm cần để đổi quà
    
    private int stockQuantity; // Số lượng tồn kho
}