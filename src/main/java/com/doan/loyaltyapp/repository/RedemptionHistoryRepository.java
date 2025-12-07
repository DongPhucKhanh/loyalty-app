package com.doan.loyaltyapp.repository;

import com.doan.loyaltyapp.model.RedemptionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RedemptionHistoryRepository extends JpaRepository<RedemptionHistory, Long> {
    // Tìm lịch sử đổi quà của riêng một khách hàng
    List<RedemptionHistory> findByCustomerId(Long customerId);
}