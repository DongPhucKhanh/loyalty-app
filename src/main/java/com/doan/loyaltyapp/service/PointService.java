package com.doan.loyaltyapp.service;

import com.doan.loyaltyapp.model.Customer;
import com.doan.loyaltyapp.model.Tier;
import com.doan.loyaltyapp.model.Transaction;
import com.doan.loyaltyapp.repository.CustomerRepository;
import com.doan.loyaltyapp.repository.TierRepository;
import com.doan.loyaltyapp.repository.TransactionRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    @Transactional
    public void addPointsFromTransaction(Long customerId, Double amount, String type) {
        
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Khách hàng không tồn tại!"));

        // ====================================================
        // LOGIC TÍNH ĐIỂM: 1% GIÁ TRỊ ĐƠN HÀNG (CHO TẤT CẢ)
        // ====================================================
        
        // 87.000đ * 0.01 = 870 điểm
        int points = (int) (amount * 0.01); 

        // (Nếu bạn muốn giữ logic cũ: trừ các loại sim thẻ thì dùng if-else ở đây. 
        // Còn code này hiện tại sẽ áp dụng 1% cho MỌI LOẠI giao dịch).
        
        // ====================================================

        // Cộng điểm vào tổng
        int newBalance = customer.getPointBalance() + points;
        customer.setPointBalance(newBalance);

        // --- XÉT HẠNG ĐỘNG ---
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
        // ---------------------

        // Lưu khách hàng
        customerRepository.save(customer);

        // Lưu lịch sử giao dịch
        Transaction trans = new Transaction();
        trans.setCustomer(customer);
        trans.setTotalAmount(amount);
        trans.setPointsEarned(points);
        trans.setType(type); // Vẫn lưu loại để thống kê (VD: "PRODUCT")
        trans.setTransactionDate(LocalDateTime.now());
        
        transactionRepository.save(trans);
    }
}