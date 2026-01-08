package com.doan.loyaltyapp.repository;

import com.doan.loyaltyapp.model.Reward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RewardRepository extends JpaRepository<Reward, Long> {

    // 1. Tìm các món quà mà khách hàng đủ điểm để đổi
    // Dùng để hiển thị gợi ý ngay khi nhân viên chọn khách hàng tại POS
    List<Reward> findByPointCostLessThanEqual(int points);

    // 2. Tìm các món quà khách đủ điểm VÀ còn hàng trong kho
    // Đảm bảo không đổi những món đã hết số lượng (stockQuantity > 0)
    List<Reward> findByPointCostLessThanEqualAndStockQuantityGreaterThan(int points, int stock);
}