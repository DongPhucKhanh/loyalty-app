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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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

    // 1. Lấy TOÀN BỘ danh sách
    @GetMapping
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll(Sort.by(Sort.Direction.DESC, "transactionDate"));
    }

    // 2. Lấy lịch sử của 1 khách hàng
    @GetMapping("/customer/{customerId}")
    public List<Transaction> getTransactionsByCustomer(@PathVariable Long customerId) {
        return transactionRepository.findByCustomerIdOrderByTransactionDateDesc(customerId);
    }

    // ============================================================
    // HÀM PHỤ: KIỂM TRA GIAN LẬN (PRIVATE)
    // ============================================================
    private void checkFraud(String currentUsername, Long custId, double amount, String custName) {
        // 1. CẢNH BÁO: Ngoài giờ làm việc (22h - 8h sáng hôm sau)
        LocalTime now = LocalTime.now();
        if (now.isAfter(LocalTime.of(22, 0)) || now.isBefore(LocalTime.of(8, 0))) {
            auditLogService.saveLog("CẢNH BÁO HỆ THỐNG", "GIAN LẬN GIỜ GIẤC", 
                "User " + currentUsername + " tích điểm lúc " + now + " (Ngoài giờ làm việc!)");
        }

        // 2. CẢNH BÁO: Hóa đơn quá lớn (> 10 triệu)
        if (amount > 10000000) {
             auditLogService.saveLog("CẢNH BÁO HỆ THỐNG", "GIAN LẬN GIÁ TRỊ", 
                "User " + currentUsername + " nhập hóa đơn KHỦNG: " + String.format("%,.0f", amount) + "đ cho khách " + custName);
        }

        // 3. CẢNH BÁO: Spam tích điểm (Quá 3 lần/ngày cho 1 khách)
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        long count = transactionRepository.countTransactionsToday(custId, startOfDay);
        // count là số cũ, cộng lần này nữa là count + 1
        if (count >= 10) {
            auditLogService.saveLog("CẢNH BÁO HỆ THỐNG", "GIAN LẬN TẦN SUẤT", 
                "User " + currentUsername + " đã tích điểm cho khách " + custName + " lần thứ " + (count + 1) + " trong ngày!");
        }
    }

    // ============================================================
    // 3. API CỘNG ĐIỂM (FULL OPTION: KM + Audit + Tier + Check Fraud)
    // ============================================================
    @PostMapping("/add-points")
    public ResponseEntity<?> addPoints(
            @RequestParam Long customerId,
            @RequestParam Double amount) {
        try {
            // A. Lấy User đang thao tác (để ghi log và check gian lận)
            String currentUsername = "Hệ thống";
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                currentUsername = auth.getName();
            }

            // B. Tìm khách hàng
            Customer customer = customerRepository.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("Khách hàng không tồn tại!"));

            // --- C. GỌI HÀM CHECK GIAN LẬN NGAY TẠI ĐÂY ---
            checkFraud(currentUsername, customerId, amount, customer.getName());
            // ----------------------------------------------

            // D. Tính điểm gốc (10.000đ = 1 điểm)
            int basePoints = (int) (amount / 10000);

            // E. Kiểm tra khuyến mãi
            double multiplier = 1.0; 
            String promoName = "";
            List<Promotion> activePromotions = promotionRepository.findActivePromotions(LocalDate.now());

            if (!activePromotions.isEmpty()) {
                Promotion promo = activePromotions.get(0);
                multiplier = promo.getMultiplier();
                promoName = promo.getName();
            }

            // F. Tính điểm thực nhận
            int finalPoints = (int) (basePoints * multiplier);

            // G. Lưu giao dịch
            Transaction transaction = new Transaction();
            transaction.setCustomer(customer);
            transaction.setTotalAmount(amount);
            transaction.setPointsEarned(finalPoints);
            transaction.setPointsUsed(0);
            transaction.setType("EARN"); // Đánh dấu là giao dịch tích điểm
            transaction.setTransactionDate(LocalDateTime.now());
            transactionRepository.save(transaction);

            // H. Cập nhật ví điểm khách hàng
            int newBalance = customer.getPointBalance() + finalPoints;
            customer.setPointBalance(newBalance);

            // I. CẬP NHẬT HẠNG ĐỘNG
            List<Tier> tiers = tierRepository.findAll(Sort.by(Sort.Direction.DESC, "minPoint"));
            String newTierName = "Mới";
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
            customerRepository.save(customer);

            // K. Ghi Log hệ thống
            String logDetails = "KH: " + customer.getName() + 
                              " | Bill: " + String.format("%,.0f", amount) + "đ" +
                              " | Điểm: +" + finalPoints;
            
            if (multiplier > 1.0) {
                logDetails += " (KM: " + promoName + " x" + multiplier + ")";
            }

            if (tierChanged) {
                logDetails += " | Thăng hạng: " + newTierName;
            }

            auditLogService.saveLog(currentUsername, "TÍCH ĐIỂM", logDetails);

            return ResponseEntity.ok("Thành công! Điểm mới: " + newBalance + " (Hạng: " + newTierName + ")");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Lỗi Server: " + e.getMessage());
        }
    }
}