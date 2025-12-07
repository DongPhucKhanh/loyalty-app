package com.doan.loyaltyapp.repository;

import com.doan.loyaltyapp.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    // Tính tổng doanh thu (cột totalAmount)
    @Query("SELECT SUM(t.totalAmount) FROM Transaction t")
    Double sumTotalRevenue();

    // Tính tổng số điểm đã cấp (cột pointsEarned)
    @Query("SELECT SUM(t.pointsEarned) FROM Transaction t")
    Long sumTotalPointsIssued();
}