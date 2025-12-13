package com.doan.loyaltyapp.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    private Double totalAmount; // Tổng tiền (VNĐ)
    
    private int pointsEarned;   // Điểm cộng (nếu là tích điểm)

    private int pointsUsed;     // Điểm trừ (nếu là đổi quà)

    @Column(name = "transaction_type") 
    private String type;        // "EARN" hoặc "REDEEM"

    private LocalDateTime transactionDate = LocalDateTime.now();
}