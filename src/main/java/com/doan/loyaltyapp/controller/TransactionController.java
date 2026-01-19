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

    // --- 1. LẤY TẤT CẢ GIAO DỊCH (Dành cho Admin/Staff) ---
    @GetMapping
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll(Sort.by(Sort.Direction.DESC, "transactionDate"));
    }

    // --- 2. 🔥 FIX LỖI 403: LẤY LỊCH SỬ GIAO DỊCH THEO KHÁCH HÀNG ---
    // Phương thức này xử lý yêu cầu: GET /api/transactions/customer/{id}
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<?> getTransactionsByCustomer(@PathVariable Long customerId) {
        try {
            // Gọi hàm từ Repository (Cần cập nhật Repository ở bước 2 bên dưới)
            List<Transaction> transactions = transactionRepository.findByCustomerIdOrderByTransactionDateDesc(customerId);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tải lịch sử: " + e.getMessage());
        }
    }

    // --- 3. THANH TOÁN, TÍCH ĐIỂM & ĐÓNG VOUCHER ---
    @PostMapping("/add-points")
    public ResponseEntity<?> addPoints(
            @RequestParam Long customerId,
            @RequestParam Double amount,
            @RequestParam(required = false) Long redemptionId) {
        try {
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

            // XỬ LÝ VOUCHER
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

                // Thông báo dùng quà
                saveNotification(customerId, "Sử dụng ưu đãi thành công", 
                    "Bạn đã dùng Voucher: " + rewardName + " cho hóa đơn này.", "REDEEM");
            }

            // // LOGIC TÍCH ĐIỂM (10.000đ = 1đ)
            // int basePoints = (int) (amount / 10000);
            // double multiplier = 1.0;
            // List<Promotion> activePromos = promotionRepository.findActivePromotions(LocalDate.now());
            // if (!activePromos.isEmpty()) {
            //     multiplier = activePromos.get(0).getMultiplier();
            // }
            // int earnedPoints = (int) (basePoints * multiplier);
            // 1. LOGIC TÍCH ĐIỂM MỚI (1% Doanh thu)
// Ví dụ: 100.000đ * 0.01 = 1.000 điểm
int basePoints = (int) (amount * 0.01); 

// 2. KIỂM TRA KHUYẾN MÃI (X2, X3 điểm)
double multiplier = 1.0;
List<Promotion> activePromos = promotionRepository.findActivePromotions(LocalDate.now());

if (!activePromos.isEmpty()) {
    // Lấy hệ số nhân của chương trình khuyến mãi đầu tiên đang hoạt động
    multiplier = activePromos.get(0).getMultiplier();
}

// 3. TÍNH ĐIỂM CUỐI CÙNG
// Ví dụ: Nếu có khuyến mãi X2, khách nhận được: 1.000 * 2 = 2.000 điểm
int earnedPoints = (int) (basePoints * multiplier);

System.out.println(">>> Số tiền: " + amount + " | Điểm cơ bản: " + basePoints + " | Tổng điểm nhận: " + earnedPoints);

            // LƯU GIAO DỊCH
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

            // CẬP NHẬT VÍ ĐIỂM & HẠNG
            int newBalance = customer.getPointBalance() + earnedPoints;
            customer.setPointBalance(newBalance);
            updateCustomerTier(customer, newBalance);
            customerRepository.save(customer);

            // THÔNG BÁO & LOG
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

    // --- HÀM HỖ TRỢ ---
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
        notificationRepository.save(n);
    }
    // Endpoint mới để khớp với StaffScanner.jsx và TransactionRequest DTO
@PostMapping("/add")
public ResponseEntity<?> addFromScanner(@RequestBody TransactionRequest request) {
    // Chuyển hướng dữ liệu từ JSON sang hàm xử lý tích điểm hiện tại của bạn
    return addPoints(request.getCustomerId(), request.getAmount(), null);
}
}