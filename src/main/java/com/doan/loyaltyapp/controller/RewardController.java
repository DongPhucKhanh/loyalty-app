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
@CrossOrigin(origins = "*") // Cho phép Frontend gọi API
public class RewardController {

    @Autowired
    private RewardService rewardService;

    // Tiêm Repository này vào để lấy lịch sử đổi quà
    @Autowired
    private RedemptionHistoryRepository redemptionHistoryRepository;

    // ==========================================
    // 1. LẤY DANH SÁCH TẤT CẢ QUÀ
    // GET: http://localhost:8080/api/rewards
    // ==========================================
    @GetMapping
    public List<Reward> getAll() {
        return rewardService.getAllRewards();
    }

    // ==========================================
    // 2. XEM LỊCH SỬ ĐỔI QUÀ (API MỚI)
    // GET: http://localhost:8080/api/rewards/history
    // ==========================================
    @GetMapping("/history")
    public List<RedemptionHistory> getRedemptionHistory() {
        // Lấy danh sách lịch sử, sắp xếp người đổi mới nhất lên đầu
        return redemptionHistoryRepository.findAll(Sort.by(Sort.Direction.DESC, "redeemedAt"));
    }

    // ==========================================
    // 3. THÊM QUÀ MỚI
    // POST: http://localhost:8080/api/rewards
    // ==========================================
    @PostMapping
    public Reward create(@RequestBody Reward reward) {
        return rewardService.createReward(reward);
    }

    // ==========================================
    // 4. SỬA QUÀ
    // PUT: http://localhost:8080/api/rewards/{id}
    // ==========================================
    @PutMapping("/{id}")
    public ResponseEntity<Reward> update(@PathVariable Long id, @RequestBody Reward reward) {
        return ResponseEntity.ok(rewardService.updateReward(id, reward));
    }

    // ==========================================
    // 5. XÓA QUÀ
    // DELETE: http://localhost:8080/api/rewards/{id}
    // ==========================================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        rewardService.deleteReward(id);
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // 6. THỰC HIỆN ĐỔI QUÀ (Redeem)
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