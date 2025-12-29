package com.doan.loyaltyapp.controller;

import com.doan.loyaltyapp.model.Customer;
import com.doan.loyaltyapp.model.Promotion;
import com.doan.loyaltyapp.model.Tier; // <--- Import Tier
import com.doan.loyaltyapp.model.Transaction;
import com.doan.loyaltyapp.repository.CustomerRepository;
import com.doan.loyaltyapp.repository.PromotionRepository;
import com.doan.loyaltyapp.repository.TierRepository; // <--- 1. Import TierRepository
import com.doan.loyaltyapp.repository.TransactionRepository;
import com.doan.loyaltyapp.service.AuditLogService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private TierRepository tierRepository; // <--- 2. Tiêm Repo lấy hạng

    @Autowired
    private AuditLogService auditLogService;

    // 1. Lấy TOÀN BỘ danh sách giao dịch
    @GetMapping
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll(Sort.by(Sort.Direction.DESC, "transactionDate"));
    }

    // 2. Lấy lịch sử của 1 khách hàng
    @GetMapping("/customer/{customerId}")
    public List<Transaction> getTransactionsByCustomer(@PathVariable Long customerId) {
        return transactionRepository.findByCustomerIdOrderByTransactionDateDesc(customerId);
    }

    // 3. API CỘNG ĐIỂM (Full Option: KM + Audit Log + Dynamic Tier)
    @PostMapping("/add-points")
    public ResponseEntity<?> addPoints(
            @RequestParam Long customerId,
            @RequestParam Double amount) {
        try {
            // A. Tìm khách hàng
            Customer customer = customerRepository.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("Khách hàng không tồn tại!"));

            // B. Tính điểm gốc
            int basePoints = (int) (amount / 10000);

            // C. Kiểm tra khuyến mãi
            double multiplier = 1.0; 
            String promoName = "";
            List<Promotion> activePromotions = promotionRepository.findActivePromotions(LocalDate.now());

            if (!activePromotions.isEmpty()) {
                Promotion promo = activePromotions.get(0);
                multiplier = promo.getMultiplier();
                promoName = promo.getName();
            }

            // D. Tính điểm thực nhận
            int finalPoints = (int) (basePoints * multiplier);

            // E. Lưu giao dịch
            Transaction transaction = new Transaction();
            transaction.setCustomer(customer);
            transaction.setTotalAmount(amount);
            transaction.setPointsEarned(finalPoints);
            transaction.setPointsUsed(0);
            transaction.setType("EARN");
            transaction.setTransactionDate(LocalDateTime.now());
            transactionRepository.save(transaction);

            // F. Cập nhật ví điểm
            int newBalance = customer.getPointBalance() + finalPoints;
            customer.setPointBalance(newBalance);

            // --- G. CẬP NHẬT HẠNG ĐỘNG (LOGIC MỚI) ---
            // 1. Lấy tất cả các hạng từ DB, sắp xếp điểm từ CAO xuống THẤP
            List<Tier> tiers = tierRepository.findAll(Sort.by(Sort.Direction.DESC, "minPoint"));
            
            String newTierName = "Mới"; // Mặc định nếu không đạt hạng nào
            
            // 2. Duyệt qua từng hạng, nếu điểm khách >= điểm hạng thì gán luôn (vì đã sort giảm dần)
            for (Tier tier : tiers) {
                if (newBalance >= tier.getMinPoint()) {
                    newTierName = tier.getName();
                    break; // Tìm thấy hạng cao nhất phù hợp thì dừng ngay
                }
            }
            
            // Chỉ cập nhật nếu hạng thay đổi
            if (!newTierName.equals(customer.getTier())) {
                customer.setTier(newTierName);
                // Có thể ghi thêm log thăng hạng ở đây nếu muốn
            }
            // ------------------------------------------

            customerRepository.save(customer);

            // H. Ghi Log hệ thống
            String logDetails = "Cộng " + finalPoints + " điểm cho khách " + customer.getName() + 
                                " (Bill: " + String.format("%,.0f", amount) + "đ)";
            
            if (multiplier > 1.0) {
                logDetails += " - KM: " + promoName + " (x" + multiplier + ")";
            }

            auditLogService.saveLog("Hệ thống", "CỘNG ĐIỂM", logDetails);

            return ResponseEntity.ok("Thành công! Điểm mới: " + newBalance + " (Hạng: " + newTierName + ")");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Lỗi Server: " + e.getMessage());
        }
    }
}