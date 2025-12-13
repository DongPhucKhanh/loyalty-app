package com.doan.loyaltyapp.repository;

import com.doan.loyaltyapp.model.Transaction;
// --- QUAN TRỌNG: Import Pageable ---
import org.springframework.data.domain.Pageable; 
// -----------------------------------
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // ==========================================
    // 1. CÁC HÀM CHO DASHBOARD (THỐNG KÊ)
    // ==========================================

    @Query("SELECT SUM(t.totalAmount) FROM Transaction t")
    Double sumTotalRevenue();

    @Query("SELECT SUM(t.pointsEarned) FROM Transaction t")
    Long sumTotalPointsIssued();

    // ==========================================
    // 2. CÁC HÀM CHO TRANG GIAO DỊCH & KHÁCH HÀNG
    // ==========================================

    // Hàm cũ (Lấy tất cả, sắp xếp, KHÔNG phân trang)
    List<Transaction> findByCustomerIdOrderByTransactionDateDesc(Long customerId);

    // --- HÀM MỚI (FIX LỖI): Lấy theo ID khách hàng CÓ PHÂN TRANG ---
    // Spring Data JPA sẽ tự động áp dụng Sort và Limit/Offset từ biến pageable
    List<Transaction> findByCustomerId(Long customerId, Pageable pageable);
}