package com.doan.loyaltyapp.repository;

import com.doan.loyaltyapp.model.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {

    /**
     * Tìm tất cả khuyến mãi đang có hiệu lực trong ngày hôm nay.
     * Logic: Ngày hôm nay phải LỚN HƠN HOẶC BẰNG ngày bắt đầu 
     * VÀ NHỎ HƠN HOẶC BẰNG ngày kết thúc.
     */
    @Query("SELECT p FROM Promotion p WHERE :today >= p.startDate AND :today <= p.endDate")
    List<Promotion> findActivePromotions(LocalDate today);
}