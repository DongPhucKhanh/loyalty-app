package com.doan.loyaltyapp.service;

import com.doan.loyaltyapp.model.Customer;
import com.doan.loyaltyapp.model.Promotion;
import com.doan.loyaltyapp.model.Tier;
import com.doan.loyaltyapp.model.Transaction;
import com.doan.loyaltyapp.repository.CustomerRepository;
import com.doan.loyaltyapp.repository.PromotionRepository;
import com.doan.loyaltyapp.repository.TierRepository;
import com.doan.loyaltyapp.repository.TransactionRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PointService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private TierRepository tierRepository;

    @Autowired
    private PromotionRepository promotionRepository; // Tiêm Repository Khuyến mãi

    @Transactional
    public void addPointsFromTransaction(Long customerId, Double amount, String type) {
        
        // 1. Tìm khách hàng
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Khách hàng không tồn tại!"));

        // ====================================================
        // BƯỚC 1: TÍNH ĐIỂM CƠ BẢN (1%)
        // ====================================================
        int basePoints = (int) (amount * 0.01); 

        // ====================================================
        // BƯỚC 2: KIỂM TRA KHUYẾN MÃI (PROMOTIONS)
        // ====================================================
        double multiplier = 1.0;
        String promoInfo = "";

        // Tìm các sự kiện đang diễn ra hôm nay
        List<Promotion> activePromos = promotionRepository.findActivePromotions(LocalDate.now());
        
        // Nếu có sự kiện, lấy hệ số cao nhất
        for (Promotion p : activePromos) {
            if (p.getMultiplier() > multiplier) {
                multiplier = p.getMultiplier();
                promoInfo = " | " + p.getName() + " (x" + multiplier + ")";
            }
        }

        // Tính điểm cuối cùng = Điểm cơ bản * Hệ số
        int finalPoints = (int) (basePoints * multiplier);

        // ====================================================
        // BƯỚC 3: CẬP NHẬT KHÁCH HÀNG & XÉT HẠNG
        // ====================================================
        
        int newBalance = customer.getPointBalance() + finalPoints;
        customer.setPointBalance(newBalance);

        // Logic xét hạng động
        List<Tier> tiers = tierRepository.findAllByOrderByMinPointDesc();
        String newTier = "Mới"; 
        
        if (!tiers.isEmpty()) {
            for (Tier tier : tiers) {
                if (newBalance >= tier.getMinPoint()) {
                    newTier = tier.getName();
                    break;
                }
            }
        }
        customer.setTier(newTier);

        // Lưu khách hàng
        customerRepository.save(customer);

        // ====================================================
        // BƯỚC 4: LƯU LỊCH SỬ GIAO DỊCH
        // ====================================================
        Transaction trans = new Transaction();
        trans.setCustomer(customer);
        trans.setTotalAmount(amount);
        trans.setPointsEarned(finalPoints); // Lưu số điểm đã nhân hệ số
        trans.setTransactionDate(LocalDateTime.now());
        
        // Ghi chú vào loại giao dịch để Admin biết tại sao điểm lại cao thế
        // VD: "PRODUCT | Mừng Quốc Khánh (x2.0)"
        if (multiplier > 1.0) {
            trans.setType(type + promoInfo);
        } else {
            trans.setType(type);
        }
        
        transactionRepository.save(trans);
    }
}