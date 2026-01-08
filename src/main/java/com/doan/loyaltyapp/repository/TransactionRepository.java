package com.doan.loyaltyapp.repository;

import com.doan.loyaltyapp.model.Transaction;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // --- 1. PHỤC VỤ DASHBOARD (THỐNG KÊ) ---
    // COALESCE giúp trả về 0.0 hoặc 0 nếu bảng trống, tránh lỗi NullPointerException ở Backend
    @Query("SELECT COALESCE(SUM(t.totalAmount), 0.0) FROM Transaction t")
    Double sumTotalRevenue();

    @Query("SELECT COALESCE(SUM(t.pointsEarned), 0) FROM Transaction t")
    Long sumTotalPointsIssued();

    // --- 2. PHỤC VỤ LỊCH SỬ GIAO DỊCH (SỬA LỖI 403) ---
    // Lấy toàn bộ lịch sử của 1 khách hàng, sắp xếp mới nhất lên đầu
    List<Transaction> findByCustomerIdOrderByTransactionDateDesc(Long customerId);

    // Hỗ trợ phân trang nếu danh sách giao dịch quá dài
    List<Transaction> findByCustomerId(Long customerId, Pageable pageable);

    // --- 3. KIỂM TRA GIAN LẬN (ANTI-FRAUD) ---
    // Đếm số lần giao dịch của khách hàng tính từ một thời điểm nhất định (thường là bắt đầu ngày)
    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.customer.id = :custId AND t.transactionDate >= :startTime")
    long countTransactionsToday(@Param("custId") Long custId, @Param("startTime") LocalDateTime startTime);
}