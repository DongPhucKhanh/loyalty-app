package com.doan.loyaltyapp.controller;

import com.doan.loyaltyapp.model.Customer;
import com.doan.loyaltyapp.model.RedemptionHistory;
import com.doan.loyaltyapp.model.Reward;
import com.doan.loyaltyapp.model.Tier;
import com.doan.loyaltyapp.repository.CustomerRepository;
import com.doan.loyaltyapp.repository.RedemptionHistoryRepository;
import com.doan.loyaltyapp.repository.TierRepository;
import com.doan.loyaltyapp.service.AuditLogService;
import com.doan.loyaltyapp.service.RewardService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rewards")
public class RewardController {

    @Autowired
    private RewardService rewardService;

    @Autowired
    private RedemptionHistoryRepository redemptionHistoryRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private TierRepository tierRepository;
    
    @Autowired
    private CustomerRepository customerRepository;

    // ==========================================
    // 1. LẤY DANH SÁCH TẤT CẢ QUÀ
    // ==========================================
    @GetMapping
    public List<Reward> getAll() {
        return rewardService.getAllRewards();
    }

    // ==========================================
    // 2. LỊCH SỬ ĐỔI QUÀ (Admin - Xem tất cả)
    // ==========================================
    @GetMapping("/history")
    public List<RedemptionHistory> getAllHistory() {
        return redemptionHistoryRepository.findAll(Sort.by(Sort.Direction.DESC, "redeemedAt"));
    }

    // ==========================================
    // 3. LỊCH SỬ ĐỔI QUÀ CÁ NHÂN (User)
    // ==========================================
    @GetMapping("/history/{customerId}")
    public List<RedemptionHistory> getUserHistory(@PathVariable Long customerId) {
        return redemptionHistoryRepository.findByCustomerIdOrderByRedeemedAtDesc(customerId);
    }

    // ==========================================
    // 4. THÊM QUÀ MỚI (Admin)
    // ==========================================
    @PostMapping
    public Reward create(@RequestBody Reward reward) {
        return rewardService.createReward(reward);
    }

    // ==========================================
    // 5. SỬA QUÀ (Admin)
    // ==========================================
    @PutMapping("/{id}")
    public ResponseEntity<Reward> update(@PathVariable Long id, @RequestBody Reward reward) {
        return ResponseEntity.ok(rewardService.updateReward(id, reward));
    }

    // ==========================================
    // 6. XÓA QUÀ (Admin)
    // ==========================================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        rewardService.deleteReward(id);
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // 7. THỰC HIỆN ĐỔI QUÀ (CÓ LOGIC HẠ HẠNG)
    // ==========================================
    @PostMapping("/redeem")
    public ResponseEntity<?> redeemReward(@RequestBody RedeemRequest request) {
        try {
            // A. Thực hiện đổi quà (Điểm đã bị trừ trong Service)
            RedemptionHistory history = rewardService.redeemReward(request.getCustomerId(), request.getRewardId());

            // B. LOGIC MỚI: KIỂM TRA VÀ HẠ HẠNG NẾU CẦN
            Customer customer = history.getCustomer(); 
            int currentPoints = customer.getPointBalance();

            // Lấy tất cả các hạng, sắp xếp điểm từ CAO xuống THẤP
            List<Tier> tiers = tierRepository.findAll(Sort.by(Sort.Direction.DESC, "minPoint"));
            String correctTier = "Mới"; // Hạng mặc định thấp nhất

            // Tìm hạng phù hợp với điểm hiện tại
            for (Tier tier : tiers) {
                if (currentPoints >= tier.getMinPoint()) {
                    correctTier = tier.getName();
                    break;
                }
            }

            // Nếu hạng đúng khác hạng hiện tại -> Cập nhật (Hạ hạng)
            if (!correctTier.equals(customer.getTier())) {
                customer.setTier(correctTier);
                customerRepository.save(customer);
            }

            // C. GHI LOG
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = "Hệ thống";
            if (auth != null && auth.isAuthenticated()) {
                currentUsername = auth.getName();
            }

            String rewardName = history.getReward() != null ? history.getReward().getName() : "Quà tặng";
            String logDetails = "Đổi: " + rewardName + " (-" + history.getPointsUsed() + " điểm)";
            
            if (!correctTier.equals(history.getCustomer().getTier())) {
                 logDetails += " | Cập nhật hạng: " + correctTier;
            }

            auditLogService.saveLog(currentUsername, "ĐỔI QUÀ", logDetails);

            return ResponseEntity.ok(history);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Data
    static class RedeemRequest {
        private Long customerId;
        private Long rewardId;
    }
}