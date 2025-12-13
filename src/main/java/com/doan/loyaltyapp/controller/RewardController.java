package com.doan.loyaltyapp.controller;

import com.doan.loyaltyapp.model.RedemptionHistory;
import com.doan.loyaltyapp.model.Reward;
import com.doan.loyaltyapp.repository.RedemptionHistoryRepository;
import com.doan.loyaltyapp.service.RewardService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rewards")
// Đã xóa @CrossOrigin vì SecurityConfig đã xử lý rồi
public class RewardController {

    @Autowired
    private RewardService rewardService;

    @Autowired
    private RedemptionHistoryRepository redemptionHistoryRepository;

    // ==========================================
    // 1. LẤY DANH SÁCH TẤT CẢ QUÀ (User + Admin)
    // GET: http://localhost:8080/api/rewards
    // ==========================================
    @GetMapping
    public List<Reward> getAll() {
        return rewardService.getAllRewards();
    }

    // ==========================================
    // 2. LỊCH SỬ ĐỔI QUÀ (Admin - Xem tất cả)
    // GET: http://localhost:8080/api/rewards/history
    // ==========================================
    @GetMapping("/history")
    public List<RedemptionHistory> getAllHistory() {
        return redemptionHistoryRepository.findAll(Sort.by(Sort.Direction.DESC, "redeemedAt"));
    }

    // ==========================================
    // 3. LỊCH SỬ ĐỔI QUÀ CÁ NHÂN (User - Xem của mình)
    // GET: http://localhost:8080/api/rewards/history/{customerId}
    // ==========================================
    @GetMapping("/history/{customerId}")
    public List<RedemptionHistory> getUserHistory(@PathVariable Long customerId) {
        // Cần đảm bảo Repository đã có hàm này (xem lưu ý bên dưới)
        return redemptionHistoryRepository.findByCustomerIdOrderByRedeemedAtDesc(customerId);
    }

    // ==========================================
    // 4. THÊM QUÀ MỚI (Admin)
    // POST: http://localhost:8080/api/rewards
    // ==========================================
    @PostMapping
    public Reward create(@RequestBody Reward reward) {
        return rewardService.createReward(reward);
    }

    // ==========================================
    // 5. SỬA QUÀ (Admin)
    // PUT: http://localhost:8080/api/rewards/{id}
    // ==========================================
    @PutMapping("/{id}")
    public ResponseEntity<Reward> update(@PathVariable Long id, @RequestBody Reward reward) {
        return ResponseEntity.ok(rewardService.updateReward(id, reward));
    }

    // ==========================================
    // 6. XÓA QUÀ (Admin)
    // DELETE: http://localhost:8080/api/rewards/{id}
    // ==========================================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        rewardService.deleteReward(id);
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // 7. THỰC HIỆN ĐỔI QUÀ (User)
    // POST: http://localhost:8080/api/rewards/redeem
    // ==========================================
    @PostMapping("/redeem")
    public ResponseEntity<?> redeemReward(@RequestBody RedeemRequest request) {
        try {
            RedemptionHistory history = rewardService.redeemReward(request.getCustomerId(), request.getRewardId());
            return ResponseEntity.ok(history);
        } catch (RuntimeException e) {
            // Trả về lỗi 400 nếu không đủ điểm hoặc hết hàng
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DTO hứng dữ liệu khi đổi quà
    @Data
    static class RedeemRequest {
        private Long customerId;
        private Long rewardId;
    }
}