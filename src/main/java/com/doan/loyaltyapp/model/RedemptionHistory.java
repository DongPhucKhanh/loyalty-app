package com.doan.loyaltyapp.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "redemption_history")
@Data
public class RedemptionHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "reward_id", nullable = false)
    private Reward reward;

    private int pointsUsed; // Số điểm đã trừ lúc đổi

    private LocalDateTime redeemedAt = LocalDateTime.now();
}