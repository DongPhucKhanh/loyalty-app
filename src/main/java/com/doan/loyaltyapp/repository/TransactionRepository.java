package com.doan.loyaltyapp.repository;

import com.doan.loyaltyapp.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // ==========================================
    // 1. CÁC HÀM CHO DASHBOARD (THỐNG KÊ)
    // ==========================================

    // Tính tổng doanh thu (cột totalAmount) của toàn hệ thống
    @Query("SELECT SUM(t.totalAmount) FROM Transaction t")
    Double sumTotalRevenue();

    // Tính tổng số điểm đã cấp (cột pointsEarned) của toàn hệ thống
    @Query("SELECT SUM(t.pointsEarned) FROM Transaction t")
    Long sumTotalPointsIssued();

    // ==========================================
    // 2. CÁC HÀM CHO TRANG GIAO DỊCH & KHÁCH HÀNG
    // ==========================================

    // Tìm tất cả giao dịch của MỘT khách hàng cụ thể
    // Sắp xếp ngày mới nhất lên đầu (Desc)
    List<Transaction> findByCustomerIdOrderByTransactionDateDesc(Long customerId);
}