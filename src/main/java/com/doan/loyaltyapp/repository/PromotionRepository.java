package com.doan.loyaltyapp.repository;

import com.doan.loyaltyapp.model.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    
    // Tìm các sự kiện đang hoạt động và trong thời gian hiệu lực
    @Query("SELECT p FROM Promotion p WHERE p.active = true AND :today BETWEEN p.startDate AND p.endDate")
    List<Promotion> findActivePromotions(LocalDate today);
}