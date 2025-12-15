package com.doan.loyaltyapp.model;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    
    // Database của bạn là point_cost, code ánh xạ sang "points" cho Frontend dễ dùng
    @Column(name = "point_cost")
    private int pointCost; 
    
    @Column(name = "stock_quantity")
    private int stockQuantity; 

    // LƯU Ý: Đã xóa trường 'image' và 'type' vì trong ảnh Database của bạn không có.
}