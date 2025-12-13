package com.doan.loyaltyapp.repository;

import com.doan.loyaltyapp.model.RedemptionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RedemptionHistoryRepository extends JpaRepository<RedemptionHistory, Long> {
    // Sửa lại tên hàm để tự động sắp xếp ngày giảm dần
    List<RedemptionHistory> findByCustomerIdOrderByRedeemedAtDesc(Long customerId);
}