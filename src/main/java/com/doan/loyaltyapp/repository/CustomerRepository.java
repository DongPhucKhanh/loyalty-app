package com.doan.loyaltyapp.repository;

import com.doan.loyaltyapp.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying; // <--- Cần thêm
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional; // <--- Cần thêm

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    
    Optional<Customer> findByPhone(String phone);

    // --- CÁC HÀM CHO DASHBOARD (GIỮ NGUYÊN) ---
    // Lấy Top 5 khách hàng VIP
    List<Customer> findTop5ByOrderByPointBalanceDesc();

    // Đếm số lượng khách theo từng hạng (cho biểu đồ tròn)
    @Query("SELECT c.tier, COUNT(c) FROM Customer c GROUP BY c.tier")
    List<Object[]> countCustomersByTier();

    // --- HÀM MỚI: RESET ĐIỂM HÀNG THÁNG ---
    // Bắt buộc phải có @Modifying và @Transactional vì đây là lệnh UPDATE (sửa dữ liệu)
    @Modifying
    @Transactional
    @Query("UPDATE Customer c SET c.pointBalance = 0")
    void resetAllPoints();
}