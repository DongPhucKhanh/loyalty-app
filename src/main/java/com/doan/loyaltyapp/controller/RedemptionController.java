package com.doan.loyaltyapp.controller;

import com.doan.loyaltyapp.model.*;
import com.doan.loyaltyapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/redemptions")
@CrossOrigin(origins = "*")
public class RedemptionController {

    @Autowired
    private RedemptionRepository redemptionRepository;
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private RewardRepository rewardRepository;
    @Autowired
    private NotificationRepository notificationRepository;

    // 1. KHÁCH HÀNG ĐỔI QUÀ (Trừ điểm, tạo Voucher)
    @PostMapping("/redeem")
    public ResponseEntity<?> redeemGift(@RequestParam Long customerId, @RequestParam Long rewardId) {
        Customer customer = customerRepository.findById(customerId).orElseThrow();
        Reward reward = rewardRepository.findById(rewardId).orElseThrow();

        if (customer.getPointBalance() < reward.getPointCost()) {
            return ResponseEntity.badRequest().body("Bạn không đủ điểm!");
        }
        if (reward.getStockQuantity() <= 0) {
            return ResponseEntity.badRequest().body("Món quà này đã hết hàng!");
        }

        customer.setPointBalance(customer.getPointBalance() - reward.getPointCost());
        reward.setStockQuantity(reward.getStockQuantity() - 1);

        Redemption redemption = new Redemption();
        redemption.setCustomer(customer);
        redemption.setReward(reward);
        redemption.setStatus("UNUSED");
        // Sinh mã voucher ngẫu nhiên duy nhất
        redemption.setVoucherCode("VC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        redemption.setExpiryDate(LocalDateTime.now().plusDays(30));

        customerRepository.save(customer);
        rewardRepository.save(reward);
        redemptionRepository.save(redemption);

        return ResponseEntity.ok(redemption);
    }

    // 2. API CHO POS: Lấy danh sách quà KHÁCH ĐÃ CÓ (để nhân viên chọn áp dụng)
    @GetMapping("/available-to-use")
    public List<Redemption> getAvailableToUse(@RequestParam Long customerId) {
        // Trả về danh sách voucher "UNUSED" để nhân viên chọn tại quầy thanh toán
        return redemptionRepository.findByCustomerIdAndStatus(customerId, "UNUSED");
    }

    // 3. XÁC NHẬN SỬ DỤNG VOUCHER (Thực hiện khi bấm thanh toán tại POS)
    @PutMapping("/use-voucher")
    public ResponseEntity<?> useVoucher(@RequestParam String code) {
        return redemptionRepository.findByVoucherCode(code).map(v -> {
            if (!"UNUSED".equals(v.getStatus())) {
                return ResponseEntity.badRequest().body("Voucher này đã được sử dụng hoặc hết hạn!");
            }
            // Chuyển trạng thái sang Đã dùng để ẩn khỏi danh sách khả dụng
            v.setStatus("USED");
            redemptionRepository.save(v);
            return ResponseEntity.ok("Voucher đã được áp dụng thành công!");
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my-vouchers")
    public List<Redemption> getMyVouchers(@RequestParam Long userId) {
        List<Redemption> list = redemptionRepository.findByCustomerIdOrderByRedeemedDateDesc(userId);
        LocalDateTime now = LocalDateTime.now();
        list.forEach(v -> {
            if ("UNUSED".equals(v.getStatus()) && v.getExpiryDate().isBefore(now)) {
                v.setStatus("EXPIRED");
                redemptionRepository.save(v);
            }
        });
        return list;
    }
}