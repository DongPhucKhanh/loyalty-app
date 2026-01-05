package com.doan.loyaltyapp.controller;

import com.doan.loyaltyapp.model.Customer;
import com.doan.loyaltyapp.model.Promotion;
import com.doan.loyaltyapp.model.Tier;
import com.doan.loyaltyapp.model.Transaction;
import com.doan.loyaltyapp.repository.CustomerRepository;
import com.doan.loyaltyapp.repository.PromotionRepository;
import com.doan.loyaltyapp.repository.TierRepository;
import com.doan.loyaltyapp.repository.TransactionRepository;
import com.doan.loyaltyapp.service.AuditLogService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication; // <--- Import này quan trọng
import org.springframework.security.core.context.SecurityContextHolder; // <--- Import này quan trọng
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
    private TierRepository tierRepository;

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

    // 3. API CỘNG ĐIỂM (Full Option: KM + Audit Log + Dynamic Tier + Current User)
    @PostMapping("/add-points")
    public ResponseEntity<?> addPoints(
            @RequestParam Long customerId,
            @RequestParam Double amount) {
        try {
            // A. Tìm khách hàng
            Customer customer = customerRepository.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("Khách hàng không tồn tại!"));

            // B. Tính điểm gốc (Ví dụ: 10.000đ = 1 điểm)
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

            // F. Cập nhật ví điểm khách hàng
            int newBalance = customer.getPointBalance() + finalPoints;
            customer.setPointBalance(newBalance);

            // --- G. CẬP NHẬT HẠNG ĐỘNG (LOGIC MỚI) ---
            List<Tier> tiers = tierRepository.findAll(Sort.by(Sort.Direction.DESC, "minPoint"));
            
            String newTierName = "Mới"; // Mặc định
            
            for (Tier tier : tiers) {
                if (newBalance >= tier.getMinPoint()) {
                    newTierName = tier.getName();
                    break; 
                }
            }
            
            boolean tierChanged = !newTierName.equals(customer.getTier());
            if (tierChanged) {
                customer.setTier(newTierName);
            }
            // ------------------------------------------

            customerRepository.save(customer);

            // H. Ghi Log hệ thống (QUAN TRỌNG: Lấy user hiện tại)
            
            // 1. Lấy tên người dùng đang đăng nhập (Ví dụ: admin, nv01...)
            String currentUsername = "Hệ thống"; // Mặc định nếu chạy test không login
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                currentUsername = auth.getName();
            }

            // 2. Tạo nội dung log chi tiết
            String logDetails = "KH: " + customer.getName() + 
                              " | Bill: " + String.format("%,.0f", amount) + "đ" +
                              " | Điểm: +" + finalPoints;
            
            if (multiplier > 1.0) {
                logDetails += " (KM: " + promoName + " x" + multiplier + ")";
            }

            if (tierChanged) {
                logDetails += " | Thăng hạng: " + newTierName;
            }

            // 3. Lưu log
            auditLogService.saveLog(currentUsername, "TÍCH ĐIỂM", logDetails);

            return ResponseEntity.ok("Thành công! Điểm mới: " + newBalance + " (Hạng: " + newTierName + ")");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Lỗi Server: " + e.getMessage());
        }
    }
}