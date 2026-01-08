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
    
    @Column(name = "point_cost")
    private int pointCost; 
    
    @Column(name = "stock_quantity")
    private int stockQuantity; 

    // --- CẬP NHẬT: PHẢI CÓ 2 TRƯỜNG NÀY ĐỂ XỬ LÝ VOUCHER ---
    
    // Ánh xạ với cột 'type' trong DB (Dùng để biết là VOUCHER hay GIFT)
    private String type; 

    // Ánh xạ với cột 'discount_value' trong DB (Số tiền được giảm)
    @Column(name = "discount_value")
    private Double discountValue; 
}