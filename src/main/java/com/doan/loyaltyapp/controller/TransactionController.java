package com.doan.loyaltyapp.controller;

import com.doan.loyaltyapp.model.*;
import com.doan.loyaltyapp.model.dto.TransactionRequest;
import com.doan.loyaltyapp.repository.*;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    private NotificationRepository notificationRepository;
    @Autowired
    private RedemptionRepository redemptionRepository;
    @Autowired
    private AuditLogService auditLogService;

    // --- 1. LẤY TẤT CẢ GIAO DỊCH ---
    @GetMapping
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll(Sort.by(Sort.Direction.DESC, "transactionDate"));
    }

    // --- 2. LẤY LỊCH SỬ GIAO DỊCH THEO KHÁCH HÀNG ---
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<?> getTransactionsByCustomer(@PathVariable Long customerId) {
        try {
            List<Transaction> transactions = transactionRepository.findByCustomerIdOrderByTransactionDateDesc(customerId);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tải lịch sử: " + e.getMessage());
        }
    }

    // --- 3. API TÍCH ĐIỂM CHÍNH (LOGIC 1% & CHẶN SỐ ÂM) ---
    @PostMapping("/add-points")
    public ResponseEntity<?> addPoints(
            @RequestParam Long customerId,
            @RequestParam Double amount,
            @RequestParam(required = false) Long redemptionId) {
        try {
            // ---------------------------------------------------------
            // 🛑 BƯỚC 1: VALIDATION (CHẶN SỐ ÂM)
            // Nếu nhập -50000, code sẽ chạy vào đây và return lỗi ngay.
            // Không thực hiện tính toán ở dưới.
            // ---------------------------------------------------------
            if (amount == null || amount <= 0) {
                return ResponseEntity.badRequest().body("Số tiền giao dịch không hợp lệ (Phải lớn hơn 0)!");
            }

            // Lấy thông tin người thực hiện
            String currentUsername = "Hệ thống";
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                currentUsername = auth.getName();
            }

            Customer customer = customerRepository.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("Khách hàng không tồn tại!"));

            checkFraud(currentUsername, customerId, amount, customer.getName());

            Double finalAmount = amount;
            Double discountAmount = 0.0;
            String rewardName = "";

            // --- XỬ LÝ VOUCHER (NẾU CÓ) ---
            if (redemptionId != null) {
                Redemption redemption = redemptionRepository.findById(redemptionId)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy Voucher!"));

                if (!"UNUSED".equals(redemption.getStatus())) {
                    return ResponseEntity.badRequest().body("Voucher đã sử dụng hoặc hết hạn!");
                }

                Reward reward = redemption.getReward();
                rewardName = reward.getName();
                
                if ("VOUCHER".equalsIgnoreCase(reward.getType()) && reward.getDiscountValue() != null) {
                    discountAmount = reward.getDiscountValue();
                    finalAmount = Math.max(0, amount - discountAmount);
                }

                redemption.setStatus("USED");
                redemptionRepository.save(redemption);

                saveNotification(customerId, "Sử dụng ưu đãi thành công", 
                    "Bạn đã dùng Voucher: " + rewardName + " cho hóa đơn này.", "REDEEM");
            }

            // ---------------------------------------------------------
            // ✅ BƯỚC 2: TÍNH ĐIỂM (1% DOANH THU)
            // Code chỉ chạy đến đây nếu BƯỚC 1 đã qua (số tiền dương).
            // ---------------------------------------------------------
            int basePoints = (int) (amount * 0.01); 

            // Kiểm tra khuyến mãi (X2, X3...)
            double multiplier = 1.0;
            List<Promotion> activePromos = promotionRepository.findActivePromotions(LocalDate.now());
            if (!activePromos.isEmpty()) {
                multiplier = activePromos.get(0).getMultiplier();
            }

            // Tổng điểm cuối cùng
            int earnedPoints = (int) (basePoints * multiplier);

            // --- LƯU VÀO DB ---
            Transaction transaction = new Transaction();
            transaction.setCustomer(customer);
            transaction.setTotalAmount(amount);
            transaction.setDiscountAmount(discountAmount);
            transaction.setFinalAmount(finalAmount);
            transaction.setPointsEarned(earnedPoints);
            transaction.setPointsUsed(0);
            transaction.setTransactionDate(LocalDateTime.now());
            transaction.setType(redemptionId != null ? "REDEEM_AND_EARN" : "EARN");
            transactionRepository.save(transaction);

            // Cập nhật ví điểm & hạng
            int newBalance = customer.getPointBalance() + earnedPoints;
            customer.setPointBalance(newBalance);
            updateCustomerTier(customer, newBalance);
            customerRepository.save(customer);

            // Thông báo
            saveNotification(customerId, "Tích điểm thành công", 
                "Nhận +" + earnedPoints + " điểm từ hóa đơn " + String.format("%,.0f", amount) + "đ.", "TRANSACTION");
            
            auditLogService.saveLog(currentUsername, "GIAO DỊCH POS", 
                "KH: " + customer.getName() + " | Bill: " + amount + " | Thu: " + finalAmount);

            Map<String, Object> resp = new HashMap<>();
            resp.put("finalAmount", finalAmount);
            resp.put("pointsEarned", earnedPoints);
            resp.put("newBalance", newBalance);
            return ResponseEntity.ok(resp);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi xử lý: " + e.getMessage());
        }
    }

    // --- 4. HỖ TRỢ JSON (Đã sửa để dùng được RedemptionId từ DTO) ---
  @PostMapping("/add")
public ResponseEntity<?> addFromScanner(@RequestBody TransactionRequest request) {
    // Chuyển hướng dữ liệu từ JSON sang hàm xử lý tích điểm hiện tại của bạn
    return addPoints(request.getCustomerId(), request.getAmount(), null);
}

    // --- PRIVATE HELPERS ---
    private void checkFraud(String user, Long id, double amt, String name) {
        LocalTime now = LocalTime.now();
        if (now.isAfter(LocalTime.of(22, 0)) || now.isBefore(LocalTime.of(8, 0))) {
            auditLogService.saveLog("CẢNH BÁO", "GIỜ GIẤC", "Giao dịch ngoài giờ: " + user);
        }
        if (amt > 10000000) {
            auditLogService.saveLog("CẢNH BÁO", "GIÁ TRỊ", "Bill lớn: " + amt + "đ - KH: " + name);
        }
    }

    private void updateCustomerTier(Customer customer, int points) {
        List<Tier> tiers = tierRepository.findAll(Sort.by(Sort.Direction.DESC, "minPoint"));
        for (Tier tier : tiers) {
            if (points >= tier.getMinPoint()) {
                customer.setTier(tier.getName());
                break;
            }
        }
    }

    private void saveNotification(Long custId, String title, String msg, String type) {
        Notification n = new Notification();
        n.setUserId(custId);
        n.setTitle(title);
        n.setMessage(msg);
        n.setType(type);
        n.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(n);
    }
}