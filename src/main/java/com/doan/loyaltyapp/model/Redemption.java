package com.doan.loyaltyapp.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "redemptions")
@Data
public class Redemption {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "reward_id", nullable = false)
    private Reward reward;

    @Column(unique = true)
    private String voucherCode; // Mã code ngẫu nhiên để khách trình tại quầy

    // Trạng thái: "UNUSED" (Chưa dùng), "USED" (Đã dùng), "EXPIRED" (Hết hạn)
    private String status; 

    private LocalDateTime redeemedDate = LocalDateTime.now();
    
    private LocalDateTime expiryDate; // Ngày hết hạn voucher
}