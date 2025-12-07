package com.doan.loyaltyapp.repository;

import com.doan.loyaltyapp.model.Tier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TierRepository extends JpaRepository<Tier, Long> {
    // Tìm tất cả hạng và sắp xếp điểm từ cao xuống thấp
    // VD: Kim Cương (1000) -> Vàng (500) -> Bạc (200) -> Mới (0)
    // Sắp xếp giảm dần để khi xét hạng, ta so sánh từ cao nhất trước.
    List<Tier> findAllByOrderByMinPointDesc();
}