package com.doan.loyaltyapp.repository;

import com.doan.loyaltyapp.model.Transaction;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param; // <--- Import này
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // 1. CHO DASHBOARD
    @Query("SELECT SUM(t.totalAmount) FROM Transaction t")
    Double sumTotalRevenue();

    @Query("SELECT SUM(t.pointsEarned) FROM Transaction t")
    Long sumTotalPointsIssued();

    // 2. CHO LỊCH SỬ GIAO DỊCH
    List<Transaction> findByCustomerIdOrderByTransactionDateDesc(Long customerId);
    List<Transaction> findByCustomerId(Long customerId, Pageable pageable);

    // 3. --- QUAN TRỌNG: HÀM ĐẾM ĐỂ CHECK GIAN LẬN ---
    // Đếm số lần 1 nhân viên (hoặc hệ thống) cộng điểm cho 1 khách trong ngày
    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.customer.id = :custId AND t.transactionDate >= :startTime")
    long countTransactionsToday(@Param("custId") Long custId, @Param("startTime") LocalDateTime startTime);
}