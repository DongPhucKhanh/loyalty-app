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

    private Double totalAmount; // Tổng tiền giao dịch
    
    private int pointsEarned; // Điểm tích lũy được từ giao dịch này

    private String type; // Loại giao dịch: PRODUCT, SERVICE_APP, EXCLUDED

    private LocalDateTime transactionDate = LocalDateTime.now();
}