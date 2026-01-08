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

    // --- CÁC TRƯỜNG CẬP NHẬT ĐỂ XỬ LÝ ĐỔI QUÀ TẠI POS ---

    @Column(name = "total_amount")
    private Double totalAmount;    // Tổng tiền hóa đơn gốc (VNĐ) - Dùng để tính điểm cộng

    @Column(name = "discount_amount")
    private Double discountAmount; // Số tiền được giảm giá (nếu khách đổi voucher tại quầy)

    @Column(name = "final_amount")
    private Double finalAmount;    // Số tiền khách thực tế phải trả sau khi giảm giá
    
    @Column(name = "points_earned")
    private int pointsEarned;      // Số điểm khách nhận được (tính trên totalAmount)

    @Column(name = "points_used")
    private int pointsUsed;        // Số điểm khách bị trừ (nếu đổi quà/voucher tại quầy)

    @Column(name = "transaction_type") 
    private String type;           // Loại giao dịch: "EARN", "REDEEM", hoặc "EARN_AND_REDEEM"

    @Column(name = "transaction_date")
    private LocalDateTime transactionDate = LocalDateTime.now();

    // Bạn có thể thêm trường này để biết khách đã đổi món quà nào tại quầy (tùy chọn)
    @ManyToOne
    @JoinColumn(name = "reward_id")
    private Reward reward; 
}