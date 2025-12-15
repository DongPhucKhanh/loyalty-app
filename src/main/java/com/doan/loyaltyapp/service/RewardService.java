package com.doan.loyaltyapp.service;

import com.doan.loyaltyapp.model.Customer;
import com.doan.loyaltyapp.model.RedemptionHistory;
import com.doan.loyaltyapp.model.Reward;
import com.doan.loyaltyapp.model.Transaction; // <--- Import Transaction
import com.doan.loyaltyapp.repository.CustomerRepository;
import com.doan.loyaltyapp.repository.RedemptionHistoryRepository;
import com.doan.loyaltyapp.repository.RewardRepository;
import com.doan.loyaltyapp.repository.TransactionRepository; // <--- Import Repo Transaction
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RewardService {

    @Autowired
    private RewardRepository rewardRepository;
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private RedemptionHistoryRepository redemptionHistoryRepository;
    
    // --- THÊM CÁI NÀY ĐỂ GHI NHẬN GIAO DỊCH ---
    @Autowired
    private TransactionRepository transactionRepository;

    // 1. Lấy tất cả quà
    public List<Reward> getAllRewards() {
        return rewardRepository.findAll();
    }
    
    // 2. Thêm quà mới
    public Reward createReward(Reward reward) {
        return rewardRepository.save(reward);
    }

    // 3. Cập nhật quà
    public Reward updateReward(Long id, Reward rewardDetails) {
        Reward reward = rewardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy quà!"));
        
        reward.setName(rewardDetails.getName());
        reward.setDescription(rewardDetails.getDescription());
        reward.setPointCost(rewardDetails.getPointCost());
        reward.setStockQuantity(rewardDetails.getStockQuantity());
        
        return rewardRepository.save(reward);
    }

    // 4. Xóa quà
    public void deleteReward(Long id) {
        rewardRepository.deleteById(id);
    }

    // 5. Chức năng Đổi quà (NÂNG CẤP)
    @Transactional
    public RedemptionHistory redeemReward(Long customerId, Long rewardId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
        Reward reward = rewardRepository.findById(rewardId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phần thưởng"));

        if (reward.getStockQuantity() <= 0) {
            throw new RuntimeException("Phần thưởng này đã hết hàng!");
        }
        if (customer.getPointBalance() < reward.getPointCost()) {
            throw new RuntimeException("Khách hàng không đủ điểm!");
        }

        // A. Trừ điểm và tồn kho
        customer.setPointBalance(customer.getPointBalance() - reward.getPointCost());
        customerRepository.save(customer);

        reward.setStockQuantity(reward.getStockQuantity() - 1);
        rewardRepository.save(reward);

        // B. Lưu lịch sử đổi quà (Cho bảng RedemptionHistory)
        RedemptionHistory history = new RedemptionHistory();
        history.setCustomer(customer);
        history.setReward(reward);
        history.setPointsUsed(reward.getPointCost());
        // history.setRedeemedAt(LocalDateTime.now()); // Bên Model đã có mặc định rồi
        
        RedemptionHistory savedHistory = redemptionHistoryRepository.save(history);

        // C. TẠO GIAO DỊCH (TRANSACTION) - QUAN TRỌNG
        // Bước này để thống kê được vào biểu đồ "Chi tiêu"
        Transaction transaction = new Transaction();
        transaction.setCustomer(customer);
        transaction.setTotalAmount(0.0); // Không mất tiền
        transaction.setPointsEarned(0);  // Không tích điểm
        transaction.setPointsUsed(reward.getPointCost()); // Ghi nhận số điểm đã tiêu
        transaction.setType("REDEEM");   // Đánh dấu là loại giao dịch Đổi quà
        transaction.setTransactionDate(LocalDateTime.now());
        
        transactionRepository.save(transaction);

        return savedHistory;
    }
}